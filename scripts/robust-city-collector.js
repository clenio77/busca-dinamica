#!/usr/bin/env node

/**
 * Coletor robusto para múltiplas cidades
 * Lida com erros de API e timeouts
 */

const axios = require('axios');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

class RobustCityCollector {
  constructor() {
    this.db = null;
    this.delay = 8000; // 8 segundos entre requisições
    this.maxRetries = 2;
    this.stats = {
      processed: 0,
      found: 0,
      errors: 0,
      apiCalls: 0
    };
    
    // Cidades com CEPs conhecidos que funcionam
    this.knownCeps = [
      // Araguari
      { cep: '38440-000', city: 'Araguari' },
      { cep: '38440-001', city: 'Araguari' },
      { cep: '38440-002', city: 'Araguari' },
      { cep: '38440-100', city: 'Araguari' },
      { cep: '38440-200', city: 'Araguari' },
      
      // Patos de Minas
      { cep: '38700-000', city: 'Patos de Minas' },
      { cep: '38700-001', city: 'Patos de Minas' },
      { cep: '38700-100', city: 'Patos de Minas' },
      { cep: '38700-200', city: 'Patos de Minas' },
      { cep: '38701-000', city: 'Patos de Minas' },
      
      // Ituiutaba
      { cep: '38300-000', city: 'Ituiutaba' },
      { cep: '38300-001', city: 'Ituiutaba' },
      { cep: '38300-100', city: 'Ituiutaba' },
      { cep: '38301-000', city: 'Ituiutaba' },
      { cep: '38302-000', city: 'Ituiutaba' },
      
      // Uberaba
      { cep: '38000-000', city: 'Uberaba' },
      { cep: '38001-000', city: 'Uberaba' },
      { cep: '38010-000', city: 'Uberaba' },
      { cep: '38020-000', city: 'Uberaba' },
      { cep: '38030-000', city: 'Uberaba' },
      
      // Montes Claros
      { cep: '39400-000', city: 'Montes Claros' },
      { cep: '39401-000', city: 'Montes Claros' },
      { cep: '39402-000', city: 'Montes Claros' },
      { cep: '39403-000', city: 'Montes Claros' },
      { cep: '39404-000', city: 'Montes Claros' }
    ];
  }

  async init() {
    await initDatabase();
    this.db = getDatabase();
    console.log('🛡️  Coletor Robusto de Múltiplas Cidades inicializado\n');
  }

  async cepExistsInDB(cep) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM enderecos WHERE cep = ?', [cep], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }

  async fetchCepWithRetry(cep, retries = this.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.stats.apiCalls++;
        
        console.log(`🔍 Tentativa ${attempt}/${retries}: ${cep}`);
        
        // Tentar ViaCEP primeiro (mais estável para CEPs conhecidos)
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data && !response.data.erro) {
          return {
            cep: response.data.cep,
            logradouro: response.data.logradouro || '',
            bairro: response.data.bairro || '',
            cidade: response.data.localidade || '',
            estado: response.data.uf || '',
            complemento: response.data.complemento || ''
          };
        }
        
        return null;
        
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === retries) {
          this.stats.errors++;
          return null;
        }
        
        // Backoff exponencial
        const backoffDelay = attempt * 5000; // 5s, 10s
        console.log(`⏸️  Aguardando ${backoffDelay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    return null;
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
        data.estado, data.complemento
      ], (err) => {
        if (err) reject(err);
        else resolve('inserted');
      });
    });
  }

  async collectKnownCeps() {
    console.log(`📍 Coletando CEPs conhecidos de múltiplas cidades...`);
    console.log(`🎯 Total de CEPs para testar: ${this.knownCeps.length}`);
    console.log(`⏱️  Delay entre requisições: ${this.delay}ms\n`);

    let collected = 0;
    let errorStreak = 0;
    const maxErrorStreak = 5;

    for (const cepInfo of this.knownCeps) {
      try {
        this.stats.processed++;
        
        // Verificar se já existe
        const exists = await this.cepExistsInDB(cepInfo.cep);
        if (exists) {
          console.log(`⏭️  ${cepInfo.cep} já existe na base`);
          continue;
        }

        console.log(`\n🔍 Processando ${this.stats.processed}/${this.knownCeps.length}: ${cepInfo.cep} (${cepInfo.city})`);
        
        // Buscar CEP
        const cepData = await this.fetchCepWithRetry(cepInfo.cep);
        
        if (cepData && cepData.cidade) {
          // Salvar na base
          await this.saveCepData(cepData);
          this.stats.found++;
          collected++;
          errorStreak = 0; // Reset error streak
          
          console.log(`✅ SUCESSO: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`);
        } else {
          console.log(`❌ CEP ${cepInfo.cep} não encontrado`);
          errorStreak++;
        }
        
        // Se muitos erros consecutivos, pausar mais tempo
        if (errorStreak >= maxErrorStreak) {
          console.log(`\n⚠️  Muitos erros consecutivos (${errorStreak}), pausando 60 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
          errorStreak = 0;
        } else {
          // Pausa normal
          console.log(`⏸️  Pausando ${this.delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }

      } catch (error) {
        console.error(`❌ Erro processando ${cepInfo.cep}:`, error.message);
        this.stats.errors++;
        errorStreak++;
      }

      // Log de progresso a cada 5 CEPs
      if (this.stats.processed % 5 === 0) {
        console.log(`\n📊 Progresso: ${this.stats.processed}/${this.knownCeps.length} processados, ${collected} coletados`);
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
      citiesInDB,
      efficiency: this.stats.apiCalls > 0 ? ((this.stats.found / this.stats.apiCalls) * 100).toFixed(1) : 0
    };
  }

  async printFinalStats(results) {
    console.log(`\n\n🎉 === COLETA ROBUSTA FINALIZADA ===`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - CEPs processados: ${results.processed}`);
    console.log(`   - CEPs encontrados: ${results.found}`);
    console.log(`   - Chamadas à API: ${results.apiCalls}`);
    console.log(`   - Erros: ${results.errors}`);
    console.log(`   - Eficiência: ${results.efficiency}%`);
    console.log(`   - Total na base: ${results.totalInDB}`);
    
    console.log(`\n🏙️  Cidades na Base:`);
    results.citiesInDB.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.cidade}: ${city.count} CEPs`);
    });

    if (results.found > 0) {
      console.log(`\n📋 Últimos CEPs coletados:`);
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
        console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro || 'N/A'}, ${row.cidade}`);
      });
    }
  }
}

async function collectRobustCities() {
  const collector = new RobustCityCollector();
  
  try {
    await collector.init();
    
    const results = await collector.collectKnownCeps();
    await collector.printFinalStats(results);
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  collectRobustCities()
    .then(() => {
      console.log('\n✅ Coleta robusta finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { RobustCityCollector, collectRobustCities };