#!/usr/bin/env node

/**
 * Script para testar coleta de CEPs de Uberlândia
 */

const { chromium } = require('playwright');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

async function scrapeCEPsUberlandia() {
  console.log('🚀 Iniciando coleta de CEPs de Uberlândia...\n');

  // Inicializar banco de dados
  await initDatabase();

  const browser = await chromium.launch({ 
    headless: false, // Mostrar browser para debug
    slowMo: 1000 // Delay entre ações
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  const page = await context.newPage();

  const results = [];
  let found = 0;

  try {
    console.log('📍 Navegando para o site dos Correios...');
    
    // Navegar para busca por localidade
    await page.goto('https://buscacepinter.correios.com.br/app/localidade_logradouro/index.php', {
      waitUntil: 'networkidle'
    });
    
    console.log('🔍 Preenchendo formulário de busca...');
    
    // Preencher formulário
    await page.waitForSelector('#localidade');
    await page.fill('#localidade', 'Uberlândia');
    
    await page.waitForSelector('#uf');
    await page.selectOption('#uf', 'MG');
    
    // Clicar em pesquisar
    await page.click('#btn_pesquisar');
    
    console.log('⏳ Aguardando resultados...');
    
    // Aguardar resultados carregarem
    await page.waitForTimeout(5000);
    
    // Verificar se há resultados
    const hasResults = await page.locator('table').count() > 0;
    
    if (!hasResults) {
      console.log('❌ Nenhum resultado encontrado');
      return;
    }
    
    console.log('📊 Extraindo dados da tabela...');
    
    // Extrair dados da tabela
    const cepData = await page.evaluate(() => {
      const results = [];
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
          // Pular cabeçalho
          if (index === 0) return;
          
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const logradouro = cells[0]?.textContent?.trim();
            const bairro = cells[1]?.textContent?.trim();
            const cep = cells[2]?.textContent?.trim();
            
            if (logradouro && cep && cep.match(/\d{5}-?\d{3}/)) {
              results.push({
                logradouro: logradouro,
                bairro: bairro || '',
                cidade: 'Uberlândia',
                cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
                estado: 'MG'
              });
            }
          }
        });
      });
      
      return results;
    });

    console.log(`✅ Encontrados ${cepData.length} CEPs`);
    
    // Salvar no banco de dados
    const db = getDatabase();
    let saved = 0;
    let updated = 0;
    
    for (const data of cepData.slice(0, 50)) { // Limitar a 50 para teste
      try {
        const result = await saveCEPData(db, data);
        if (result === 'inserted') saved++;
        if (result === 'updated') updated++;
        
        results.push(data);
        found++;
        
        console.log(`📍 ${data.cep}: ${data.logradouro}, ${data.bairro}`);
        
      } catch (error) {
        console.error(`❌ Erro ao salvar ${data.cep}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Coleta concluída!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Encontrados: ${cepData.length}`);
    console.log(`   - Processados: ${found}`);
    console.log(`   - Novos: ${saved}`);
    console.log(`   - Atualizados: ${updated}`);

  } catch (error) {
    console.error('❌ Erro durante scraping:', error.message);
  } finally {
    await browser.close();
  }

  return { found, results: results.slice(0, 10) };
}

async function saveCEPData(db, data) {
  return new Promise((resolve, reject) => {
    // Verificar se já existe
    db.get('SELECT id FROM enderecos WHERE cep = ?', [data.cep], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
        // Atualizar
        const updateSQL = `
          UPDATE enderecos SET 
            logradouro = ?, logradouro_sem_acento = ?,
            bairro = ?, bairro_sem_acento = ?,
            cidade = ?, cidade_sem_acento = ?,
            estado = ?, complemento = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE cep = ?
        `;
        
        db.run(updateSQL, [
          data.logradouro, removeAccents(data.logradouro),
          data.bairro, removeAccents(data.bairro),
          data.cidade, removeAccents(data.cidade),
          data.estado, data.complemento || '',
          data.cep
        ], (err) => {
          if (err) reject(err);
          else resolve('updated');
        });
      } else {
        // Inserir
        const insertSQL = `
          INSERT INTO enderecos (
            cep, logradouro, logradouro_sem_acento,
            bairro, bairro_sem_acento,
            cidade, cidade_sem_acento,
            estado, complemento
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertSQL, [
          data.cep,
          data.logradouro, removeAccents(data.logradouro),
          data.bairro, removeAccents(data.bairro),
          data.cidade, removeAccents(data.cidade),
          data.estado, data.complemento || ''
        ], (err) => {
          if (err) reject(err);
          else resolve('inserted');
        });
      }
    });
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  scrapeCEPsUberlandia()
    .then((result) => {
      console.log('\n✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = scrapeCEPsUberlandia;