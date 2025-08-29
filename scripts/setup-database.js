#!/usr/bin/env node

/**
 * Script para configurar e popular o banco de dados inicial
 */

require('dotenv').config();
const { initDatabase, getDatabase, removeAccents } = require('../database/init');
const fs = require('fs');
const path = require('path');

// Dados extraídos do HTML original
const initialData = [
  { logradouro: 'Rua Belizario Dias', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Boa Viagem', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Educacao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Do Lavrador', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Domingues Alves', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Eclipse', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Francisco de Assis', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Joao Claudio Peixoto', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Joaquim Antonio de Freitas', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Jose Camin', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Nova Republica', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Praça Santo Agostinho', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Querubina da Costa Camim', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Sao Joao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  { logradouro: 'Rua Sol Nascente', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  
  // Martinesia
  { logradouro: 'Rua Abadia', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Aniceto Antonio Da Silva', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Central', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Cutelaria', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Da Felicidade', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Avenida Da Fortuna', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Avenida Dos Direitos', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Elerio Batista Pacheco', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Francisco Antonio Fernandes', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Joao Antonio Faria', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Joaquim Justino de Faria', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Pedro Jose Ferreira', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  { logradouro: 'Rua Uberlandia', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
  
  // Tapuirama
  { logradouro: 'Rua Adolfo Fonseca', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Alves Pereira', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Fernandes Rabelo', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Gonzaga', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Governador Valadares', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Herculino da Rocha', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Joaquim Pereira Nascimento', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Avenida Jose Custodio de Oliveira', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Jose Pedro Abalem', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Jose Antonio Ferreira', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Manoel Catoco', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Medeiros', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Melo Montes', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Moreira', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  { logradouro: 'Rua Rangel', cep: '38439-600', bairro: '', cidade: 'Tapuirama' },
  
  // Miraporanga
  { logradouro: 'Miraporanga', cep: '38439-700', bairro: '', cidade: 'Miraporanga' },
  { logradouro: 'Rua Municipal', cep: '38439-700', bairro: '', cidade: 'Miraporanga' },
  
  // Uberlândia - alguns exemplos
  { logradouro: 'Rua Olegario Maciel', cep: '38408-384', bairro: 'Vigilato Pereira', cidade: 'Uberlandia' },
  { logradouro: 'Rua Antonio Paiva Catalao', cep: '38410-238', bairro: 'Laranjeiras', cidade: 'Uberlandia' },
  { logradouro: 'Avenida Vereda', cep: '38433-001', bairro: 'Vila Marielza', cidade: 'Uberlandia' },
  { logradouro: 'Rua SP 09', cep: '38411-430', bairro: 'Shopping Park', cidade: 'Uberlandia' },
  { logradouro: 'Rua SP 101', cep: '38411-719', bairro: 'Shopping Park', cidade: 'Uberlandia' },
  { logradouro: 'Rua SP 02', cep: '38411-416', bairro: 'Shopping Park', cidade: 'Uberlandia' },
  { logradouro: 'Rua 01', cep: '38412-691', bairro: 'Morada Nova', cidade: 'Uberlandia' },
  { logradouro: 'Rua 02', cep: '38412-754', bairro: 'Morada Nova', cidade: 'Uberlandia' },
  { logradouro: 'Rua 03', cep: '38412-752', bairro: 'Morada Nova', cidade: 'Uberlandia' },
  { logradouro: 'Rua Abelias', cep: '38412-639', bairro: 'Nova Uberlandia', cidade: 'Uberlandia' },
  { logradouro: 'Rua Acaris', cep: '38412-641', bairro: 'Nova Uberlandia', cidade: 'Uberlandia' },
  { logradouro: 'Rua Aguia Real', cep: '38411-377', bairro: 'Jardim Karaiba', cidade: 'Uberlandia' },
  { logradouro: 'Rua Amor Perfeito', cep: '38411-159', bairro: 'Jardim Karaiba', cidade: 'Uberlandia' }
];

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados...');
  
  try {
    // Inicializar banco
    await initDatabase();
    console.log('✅ Banco de dados inicializado');

    // Verificar se já existem dados
    const db = getDatabase();
    
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM enderecos', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (count > 0) {
      console.log(`ℹ️ Base já contém ${count} registros`);
      console.log('✅ Setup concluído - base já configurada');
      return;
    }

    // Inserir dados iniciais
    console.log('📥 Inserindo dados iniciais...');
    
    const stmt = db.prepare(`
      INSERT INTO enderecos (
        cep, logradouro, logradouro_sem_acento,
        bairro, bairro_sem_acento,
        cidade, cidade_sem_acento, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const data of initialData) {
      try {
        await new Promise((resolve, reject) => {
          stmt.run([
            data.cep,
            data.logradouro,
            removeAccents(data.logradouro),
            data.bairro,
            removeAccents(data.bairro),
            data.cidade,
            removeAccents(data.cidade),
            'MG'
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        inserted++;
      } catch (error) {
        console.error(`❌ Erro ao inserir ${data.logradouro}:`, error.message);
      }
    }

    stmt.finalize();
    
    console.log(`✅ ${inserted} registros inseridos com sucesso`);
    
    // Mostrar estatísticas
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT cidade) as cidades,
          COUNT(DISTINCT bairro) as bairros
        FROM enderecos
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('\n📊 Estatísticas da base:');
    console.log(`   - Total de endereços: ${stats.total}`);
    console.log(`   - Cidades: ${stats.cidades}`);
    console.log(`   - Bairros: ${stats.bairros}`);
    
    console.log('\n🚀 Base de dados configurada e pronta para uso!');
    console.log('💡 Próximos passos:');
    console.log('   - Execute "npm start" para iniciar o servidor');
    console.log('   - Execute "npm run scraper" para coletar mais CEPs');

  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('✅ Setup concluído');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = setupDatabase;
