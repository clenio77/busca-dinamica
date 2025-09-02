#!/usr/bin/env node

/**
 * Script melhorado para coleta de CEPs usando múltiplas estratégias
 */

const { chromium } = require('playwright');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

async function scrapeCEPsMultipleStrategies() {
  console.log('🚀 Iniciando coleta de CEPs com múltiplas estratégias...\n');

  await initDatabase();

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  let totalFound = 0;

  try {
    // Estratégia 1: Buscar por faixa de CEPs conhecidos de Uberlândia
    console.log('📍 Estratégia 1: Busca por faixa de CEPs...');
    const cepsUberlandia = [
      '38400-000', '38401-000', '38402-000', '38403-000', '38404-000',
      '38405-000', '38406-000', '38407-000', '38408-000', '38409-000',
      '38410-000', '38411-000', '38412-000', '38413-000', '38414-000',
      '38415-000'
    ];

    for (const cep of cepsUberlandia.slice(0, 5)) { // Testar apenas 5 para começar
      try {
        console.log(`🔍 Testando CEP: ${cep}`);
        
        await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php');
        await page.waitForTimeout(2000);
        
        // Preencher CEP
        await page.fill('#endereco', cep);
        await page.click('#btn_pesquisar');
        await page.waitForTimeout(3000);
        
        // Extrair dados
        const cepData = await page.evaluate(() => {
          const data = {};
          
          // Tentar diferentes seletores
          const selectors = [
            'table tr td',
            '.resultado td',
            '.tmptabela td',
            'td'
          ];
          
          for (const selector of selectors) {
            const cells = document.querySelectorAll(selector);
            if (cells.length > 0) {
              const text = Array.from(cells).map(cell => cell.textContent?.trim()).join(' | ');
              console.log('Células encontradas:', text);
              
              // Tentar extrair informações
              cells.forEach((cell, index) => {
                const text = cell.textContent?.trim();
                if (text) {
                  if (text.includes('Logradouro') && cells[index + 1]) {
                    data.logradouro = cells[index + 1].textContent?.trim();
                  }
                  if (text.includes('Bairro') && cells[index + 1]) {
                    data.bairro = cells[index + 1].textContent?.trim();
                  }
                  if (text.includes('Localidade') && cells[index + 1]) {
                    data.cidade = cells[index + 1].textContent?.trim();
                  }
                }
              });
              
              if (data.logradouro) break;
            }
          }
          
          return data;
        });

        if (cepData.logradouro) {
          console.log(`✅ Encontrado: ${cepData.logradouro}, ${cepData.bairro || 'N/A'}, ${cepData.cidade || 'Uberlândia'}`);
          
          // Salvar no banco
          const db = getDatabase();
          await saveCEPData(db, {
            cep: cep,
            logradouro: cepData.logradouro,
            bairro: cepData.bairro || '',
            cidade: cepData.cidade || 'Uberlândia',
            estado: 'MG',
            complemento: ''
          });
          
          totalFound++;
        } else {
          console.log(`❌ Nenhum dado encontrado para ${cep}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${cep}:`, error.message);
      }
    }

    // Estratégia 2: Usar ViaCEP API como fallback
    console.log('\n📍 Estratégia 2: Usando ViaCEP API...');
    
    const axios = require('axios');
    const cepsParaTestar = ['38400-100', '38401-100', '38402-100'];
    
    for (const cep of cepsParaTestar) {
      try {
        console.log(`🔍 Consultando ViaCEP: ${cep}`);
        
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
          timeout: 5000
        });
        
        if (response.data && !response.data.erro && response.data.localidade === 'Uberlândia') {
          console.log(`✅ ViaCEP: ${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade}`);
          
          const db = getDatabase();
          await saveCEPData(db, {
            cep: response.data.cep,
            logradouro: response.data.logradouro || '',
            bairro: response.data.bairro || '',
            cidade: response.data.localidade,
            estado: response.data.uf,
            complemento: response.data.complemento || ''
          });
          
          totalFound++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
        
      } catch (error) {
        console.error(`❌ Erro ViaCEP ${cep}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await browser.close();
  }

  // Verificar quantos CEPs temos no total
  const db = getDatabase();
  const totalCeps = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM enderecos WHERE cidade_sem_acento LIKE ?', 
      ['%UBERLANDIA%'], (err, row) => {
        resolve(row ? row.count : 0);
      });
  });

  console.log(`\n🎉 Coleta finalizada!`);
  console.log(`📊 Estatísticas:`);
  console.log(`   - Novos CEPs coletados: ${totalFound}`);
  console.log(`   - Total de CEPs de Uberlândia na base: ${totalCeps}`);

  return { found: totalFound, total: totalCeps };
}

async function saveCEPData(db, data) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM enderecos WHERE cep = ?', [data.cep], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
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
          data.estado, data.complemento,
          data.cep
        ], (err) => {
          if (err) reject(err);
          else resolve('updated');
        });
      } else {
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
          data.estado, data.complemento
        ], (err) => {
          if (err) reject(err);
          else resolve('inserted');
        });
      }
    });
  });
}

if (require.main === module) {
  scrapeCEPsMultipleStrategies()
    .then(() => {
      console.log('\n✅ Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = scrapeCEPsMultipleStrategies;