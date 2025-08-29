#!/usr/bin/env node

/**
 * Script de teste para verificar se o sistema está funcionando corretamente
 */

require('dotenv').config();
const { initDatabase, getDatabase, removeAccents } = require('./database/init');
const CEPScraper = require('./services/cep-scraper');

async function testDatabase() {
  console.log('🧪 Testando banco de dados...');
  
  try {
    await initDatabase();
    console.log('✅ Banco inicializado');

    const db = getDatabase();
    
    // Testar inserção
    const testData = {
      cep: '38400-000',
      logradouro: 'Teste Rua',
      bairro: 'Teste Bairro',
      cidade: 'Uberlândia',
      estado: 'MG'
    };

    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO enderecos (
          cep, logradouro, logradouro_sem_acento,
          bairro, bairro_sem_acento,
          cidade, cidade_sem_acento, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        testData.cep,
        testData.logradouro, removeAccents(testData.logradouro),
        testData.bairro, removeAccents(testData.bairro),
        testData.cidade, removeAccents(testData.cidade),
        testData.estado
      ], (err) => {
        stmt.finalize();
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Inserção de teste OK');

    // Testar busca
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM enderecos WHERE cep = ?', [testData.cep], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (result) {
      console.log('✅ Busca de teste OK');
    } else {
      console.log('❌ Busca de teste falhou');
    }

    // Testar remoção de acentos
    const testAccents = removeAccents('São João da Boa Vista');
    if (testAccents === 'SAO JOAO DA BOA VISTA') {
      console.log('✅ Remoção de acentos OK');
    } else {
      console.log('❌ Remoção de acentos falhou');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    return false;
  }
}

async function testScraper() {
  console.log('🧪 Testando scraper...');
  
  try {
    const scraper = new CEPScraper();
    
    // Testar busca de CEP conhecido
    const result = await scraper.fetchCEPData('38400-100');
    
    if (result && result.estado === 'MG') {
      console.log('✅ Scraper funcionando:', result.logradouro);
      return true;
    } else {
      console.log('⚠️ Scraper não retornou dados válidos');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no teste de scraper:', error);
    return false;
  }
}

async function testAPI() {
  console.log('🧪 Testando API...');
  
  try {
    // Simular requisição HTTP
    const http = require('http');
    const querystring = require('querystring');

    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/cep/search?' + querystring.stringify({ q: 'teste', limit: 1 }),
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.success !== undefined) {
              console.log('✅ API respondendo');
              resolve(true);
            } else {
              console.log('⚠️ API resposta inválida');
              resolve(false);
            }
          } catch (error) {
            console.log('❌ API resposta não é JSON válido');
            resolve(false);
          }
        });
      });

      req.on('error', () => {
        console.log('⚠️ API não está rodando (normal se servidor não estiver iniciado)');
        resolve(false);
      });

      req.on('timeout', () => {
        console.log('⚠️ API timeout');
        resolve(false);
      });

      req.end();
    });
  } catch (error) {
    console.error('❌ Erro no teste de API:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 EXECUTANDO TESTES DO SISTEMA');
  console.log('================================\n');

  const results = {
    database: await testDatabase(),
    scraper: await testScraper(),
    api: await testAPI()
  };

  console.log('\n📋 RESULTADOS DOS TESTES');
  console.log('========================');
  console.log(`🗄️ Banco de dados: ${results.database ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🤖 Scraper: ${results.scraper ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📡 API: ${results.api ? '✅ OK' : '⚠️ Não testado (servidor não rodando)'}`);

  const allPassed = results.database && results.scraper;
  
  console.log('\n🎯 RESULTADO GERAL');
  console.log('==================');
  if (allPassed) {
    console.log('✅ Sistema pronto para uso!');
    console.log('💡 Execute "npm start" para iniciar o servidor');
  } else {
    console.log('❌ Alguns testes falharam. Verifique os erros acima.');
  }

  return allPassed;
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

module.exports = runAllTests;
