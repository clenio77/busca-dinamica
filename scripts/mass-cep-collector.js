#!/usr/bin/env node

/**
 * Coletor em massa de CEPs de Uberlândia usando ViaCEP
 */

const axios = require('axios');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

async function massCollectUberlandiaCEPs() {
  console.log('🚀 Iniciando coleta em massa de CEPs de Uberlândia...\n');

  await initDatabase();
  const db = getDatabase();

  // Faixas de CEP conhecidas de Uberlândia
  const cepRanges = [
    { start: 38400, end: 38420, name: 'Centro e adjacências' },
    { start: 38421, end: 38440, name: 'Bairros periféricos' }
  ];

  let totalFound = 0;
  let totalProcessed = 0;
  const maxPerRange = 50; // Limitar para não sobrecarregar a API

  for (const range of cepRanges) {
    console.log(`📍 Processando faixa: ${range.name} (${range.start}000-${range.end}999)`);
    
    let foundInRange = 0;
    
    for (let cepBase = range.start; cepBase <= range.end && foundInRange < maxPerRange; cepBase++) {
      // Testar diferentes terminações
      const endings = ['000', '100', '200', '300', '400', '500'];
      
      for (const ending of endings) {
        const cep = `${cepBase}${ending}`;
        const formattedCep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
        
        try {
          totalProcessed++;
          
          console.log(`🔍 Testando: ${formattedCep}`);
          
          const response = await axios.get(`https://viacep.com.br/ws/${formattedCep}/json/`, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Busca-Dinamica-CEP/2.0'
            }
          });
          
          if (response.data && !response.data.erro) {
            const data = response.data;
            
            // Verificar se é de Uberlândia
            if (data.localidade && data.localidade.toLowerCase().includes('uberlândia')) {
              console.log(`✅ Encontrado: ${data.logradouro || 'N/A'}, ${data.bairro || 'N/A'}, ${data.localidade}`);
              
              // Salvar no banco
              await saveCEPData(db, {
                cep: formattedCep,
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade,
                estado: data.uf,
                complemento: data.complemento || ''
              });
              
              totalFound++;
              foundInRange++;
            } else if (data.localidade) {
              console.log(`ℹ️  Outro município: ${data.localidade} (${formattedCep})`);
            }
          }
          
          // Rate limiting - aguardar entre requisições
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          if (error.response?.status === 404) {
            // CEP não existe, normal
          } else {
            console.error(`❌ Erro ${formattedCep}:`, error.message);
          }
        }
        
        // Log de progresso
        if (totalProcessed % 20 === 0) {
          console.log(`📊 Progresso: ${totalProcessed} processados, ${totalFound} encontrados`);
        }
      }
    }
    
    console.log(`✅ Faixa ${range.name} concluída: ${foundInRange} CEPs encontrados\n`);
  }

  // Estatísticas finais
  const totalInDB = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM enderecos WHERE cidade_sem_acento LIKE ?', 
      ['%UBERLANDIA%'], (err, row) => {
        resolve(row ? row.count : 0);
      });
  });

  console.log(`🎉 Coleta em massa finalizada!`);
  console.log(`📊 Estatísticas:`);
  console.log(`   - CEPs processados: ${totalProcessed}`);
  console.log(`   - Novos CEPs encontrados: ${totalFound}`);
  console.log(`   - Total de CEPs de Uberlândia na base: ${totalInDB}`);
  console.log(`   - Taxa de sucesso: ${((totalFound / totalProcessed) * 100).toFixed(1)}%`);

  return { processed: totalProcessed, found: totalFound, total: totalInDB };
}

async function saveCEPData(db, data) {
  return new Promise((resolve, reject) => {
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
          data.estado, data.complemento,
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
  massCollectUberlandiaCEPs()
    .then(() => {
      console.log('\n✅ Coleta em massa finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = massCollectUberlandiaCEPs;