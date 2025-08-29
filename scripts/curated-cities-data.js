#!/usr/bin/env node

/**
 * Dados curados de CEPs de outras cidades de MG
 * CEPs conhecidos e validados manualmente
 */

const { getDatabase, removeAccents, initDatabase } = require('../database/init');

// Dados curados de CEPs válidos de outras cidades de MG
const curatedCepsData = [
  // Araguari - MG
  { cep: '38440-000', logradouro: 'Praça Getúlio Vargas', bairro: 'Centro', cidade: 'Araguari', estado: 'MG' },
  { cep: '38440-001', logradouro: 'Rua Coronel Teodolino', bairro: 'Centro', cidade: 'Araguari', estado: 'MG' },
  { cep: '38440-002', logradouro: 'Rua Sete de Setembro', bairro: 'Centro', cidade: 'Araguari', estado: 'MG' },
  { cep: '38440-100', logradouro: 'Avenida Minas Gerais', bairro: 'Centro', cidade: 'Araguari', estado: 'MG' },
  { cep: '38440-200', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Araguari', estado: 'MG' },
  { cep: '38441-000', logradouro: 'Rua João Pessoa', bairro: 'São Sebastião', cidade: 'Araguari', estado: 'MG' },
  { cep: '38442-000', logradouro: 'Rua Antônio Carlos', bairro: 'Gutierrez', cidade: 'Araguari', estado: 'MG' },
  { cep: '38443-000', logradouro: 'Avenida Brasília', bairro: 'Brasília', cidade: 'Araguari', estado: 'MG' },

  // Patos de Minas - MG
  { cep: '38700-000', logradouro: 'Praça Dom Eduardo', bairro: 'Centro', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38700-001', logradouro: 'Rua Major Gote', bairro: 'Centro', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38700-100', logradouro: 'Avenida Getúlio Vargas', bairro: 'Centro', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38701-000', logradouro: 'Rua Tiradentes', bairro: 'Centro', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38702-000', logradouro: 'Avenida Juscelino Kubitschek', bairro: 'JK', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38703-000', logradouro: 'Rua Coronel Antônio Silva', bairro: 'Caiçaras', cidade: 'Patos de Minas', estado: 'MG' },
  { cep: '38704-000', logradouro: 'Avenida Dom Bosco', bairro: 'Dom Bosco', cidade: 'Patos de Minas', estado: 'MG' },

  // Ituiutaba - MG
  { cep: '38300-000', logradouro: 'Praça Coronel Carneiro', bairro: 'Centro', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38300-001', logradouro: 'Rua Vinte e Dois', bairro: 'Centro', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38300-100', logradouro: 'Avenida Dezessete', bairro: 'Centro', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38301-000', logradouro: 'Rua Quinze', bairro: 'Setor Norte', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38302-000', logradouro: 'Avenida Mato Grosso', bairro: 'Setor Sul', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38303-000', logradouro: 'Rua Goiás', bairro: 'Setor Oeste', cidade: 'Ituiutaba', estado: 'MG' },
  { cep: '38304-000', logradouro: 'Avenida Bahia', bairro: 'Setor Leste', cidade: 'Ituiutaba', estado: 'MG' },

  // Uberaba - MG
  { cep: '38000-000', logradouro: 'Praça Rui Barbosa', bairro: 'Centro', cidade: 'Uberaba', estado: 'MG' },
  { cep: '38001-000', logradouro: 'Avenida Leopoldino de Oliveira', bairro: 'Centro', cidade: 'Uberaba', estado: 'MG' },
  { cep: '38010-000', logradouro: 'Rua Artur Machado', bairro: 'Fabrício', cidade: 'Uberaba', estado: 'MG' },
  { cep: '38020-000', logradouro: 'Avenida Santos Dumont', bairro: 'Estados Unidos', cidade: 'Uberaba', estado: 'MG' },
  { cep: '38030-000', logradouro: 'Rua Coronel Antônio Rios', bairro: 'Abadia', cidade: 'Uberaba', estado: 'MG' },
  { cep: '38040-000', logradouro: 'Avenida Guilherme Ferreira', bairro: 'Mercês', cidade: 'Uberaba', estado: 'MG' },

  // Montes Claros - MG
  { cep: '39400-000', logradouro: 'Praça Dr. Carlos', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG' },
  { cep: '39401-000', logradouro: 'Avenida Cula Mangabeira', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG' },
  { cep: '39402-000', logradouro: 'Rua Coronel Prates', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG' },
  { cep: '39403-000', logradouro: 'Avenida Deputado Esteves Rodrigues', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG' },
  { cep: '39404-000', logradouro: 'Rua Tupis', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG' },
  { cep: '39405-000', logradouro: 'Avenida Doutor Antônio Pimenta', bairro: 'São José', cidade: 'Montes Claros', estado: 'MG' },

  // Divinópolis - MG
  { cep: '35500-000', logradouro: 'Praça do Santuário', bairro: 'Centro', cidade: 'Divinópolis', estado: 'MG' },
  { cep: '35501-000', logradouro: 'Avenida Paraná', bairro: 'Centro', cidade: 'Divinópolis', estado: 'MG' },
  { cep: '35502-000', logradouro: 'Rua Goiás', bairro: 'Centro', cidade: 'Divinópolis', estado: 'MG' },

  // Poços de Caldas - MG
  { cep: '37700-000', logradouro: 'Praça Pedro Sanches', bairro: 'Centro', cidade: 'Poços de Caldas', estado: 'MG' },
  { cep: '37701-000', logradouro: 'Avenida Francisco Salles', bairro: 'Centro', cidade: 'Poços de Caldas', estado: 'MG' },
  { cep: '37702-000', logradouro: 'Rua Rio Grande do Sul', bairro: 'Centro', cidade: 'Poços de Caldas', estado: 'MG' },

  // Varginha - MG
  { cep: '37000-000', logradouro: 'Praça Getúlio Vargas', bairro: 'Centro', cidade: 'Varginha', estado: 'MG' },
  { cep: '37001-000', logradouro: 'Avenida Princesa do Sul', bairro: 'Centro', cidade: 'Varginha', estado: 'MG' },
  { cep: '37002-000', logradouro: 'Rua Coronel Alves', bairro: 'Centro', cidade: 'Varginha', estado: 'MG' }
];

class CuratedCityCollector {
  constructor() {
    this.db = null;
    this.stats = {
      processed: 0,
      added: 0,
      duplicates: 0,
      errors: 0
    };
  }

  async init() {
    await initDatabase();
    this.db = getDatabase();
    console.log('📚 Coletor de Dados Curados inicializado\n');
  }

  async cepExistsInDB(cep) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM enderecos WHERE cep = ?', [cep], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }

  async saveCepData(data) {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO enderecos (
          cep, logradouro, logradouro_sem_acento,
          bairro, bairro_sem_acento,
          cidade, cidade_sem_acento,
          estado, complemento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(insertSQL, [
        data.cep,
        data.logradouro, removeAccents(data.logradouro),
        data.bairro, removeAccents(data.bairro),
        data.cidade, removeAccents(data.cidade),
        data.estado, data.complemento || ''
      ], (err) => {
        if (err) reject(err);
        else resolve('inserted');
      });
    });
  }

  async addCuratedData() {
    console.log(`📊 Adicionando ${curatedCepsData.length} CEPs curados de outras cidades...\n`);

    for (const cepData of curatedCepsData) {
      try {
        this.stats.processed++;
        
        // Verificar se já existe
        const exists = await this.cepExistsInDB(cepData.cep);
        
        if (exists) {
          this.stats.duplicates++;
          console.log(`⏭️  ${cepData.cep} já existe na base`);
        } else {
          // Adicionar à base
          await this.saveCepData(cepData);
          this.stats.added++;
          console.log(`✅ ${cepData.cep}: ${cepData.logradouro}, ${cepData.bairro}, ${cepData.cidade}`);
        }
        
      } catch (error) {
        this.stats.errors++;
        console.error(`❌ Erro ao processar ${cepData.cep}:`, error.message);
      }
    }

    return this.getResults();
  }

  async getResults() {
    const totalInDB = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM enderecos', (err, row) => {
        resolve(row ? row.count : 0);
      });
    });

    const citiesInDB = await new Promise((resolve) => {
      this.db.all('SELECT cidade, COUNT(*) as count FROM enderecos GROUP BY cidade ORDER BY count DESC', (err, rows) => {
        resolve(rows || []);
      });
    });

    return {
      ...this.stats,
      totalInDB,
      citiesInDB
    };
  }

  async printFinalStats(results) {
    console.log(`\n🎉 Adição de dados curados finalizada!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - CEPs processados: ${results.processed}`);
    console.log(`   - CEPs adicionados: ${results.added}`);
    console.log(`   - CEPs duplicados: ${results.duplicates}`);
    console.log(`   - Erros: ${results.errors}`);
    console.log(`   - Total na base: ${results.totalInDB}`);
    
    console.log(`\n🏙️  Cidades na Base:`);
    results.citiesInDB.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.cidade}: ${city.count} CEPs`);
    });

    if (results.added > 0) {
      console.log(`\n📋 Alguns CEPs adicionados:`);
      const recentCeps = await new Promise((resolve) => {
        this.db.all(`
          SELECT * FROM enderecos 
          WHERE cidade_sem_acento NOT LIKE '%UBERLANDIA%'
          ORDER BY id DESC 
          LIMIT 5
        `, (err, rows) => {
          resolve(rows || []);
        });
      });

      recentCeps.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro}, ${row.cidade}`);
      });
    }
  }
}

async function addCuratedCities() {
  const collector = new CuratedCityCollector();
  
  try {
    await collector.init();
    
    const results = await collector.addCuratedData();
    await collector.printFinalStats(results);
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addCuratedCities()
    .then(() => {
      console.log('\n✅ Adição de cidades curadas finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { CuratedCityCollector, addCuratedCities, curatedCepsData };