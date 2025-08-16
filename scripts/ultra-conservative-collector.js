#!/usr/bin/env node

/**
 * Coletor ultra conservador de CEPs
 * Usa múltiplas APIs e estratégia extremamente cautelosa
 */

const axios = require('axios');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

class UltraConservativeCEPCollector {
  constructor() {
    this.db = null;
    this.delay = 5000; // 5 segundos entre requisições
    this.stats = {
      processed: 0,
      found: 0,
      skipped: 0,
      errors: 0,
      apiCalls: 0
    };
  }

  async init() {
    await initDatabase();
    this.db = getDatabase();
    console.log('🐌 Coletor Ultra Conservador de CEPs inicializado\n');
  }

  formatCep(cepNumber) {
    const cepStr = cepNumber.toString().padStart(8, '0');
    return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
  }

  async cepExistsInDB(cep) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM enderecos WHERE cep = ?', [cep], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }

  async fetchFromBrasilAPI(cep) {
    try {
      console.log(`🇧🇷 Consultando BrasilAPI: ${cep}`);
      
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data) {
        return {
          cep: cep,
          logradouro: response.data.street || '',
          bairro: response.data.neighborhood || '',
          cidade: response.data.city || '',
          estado: response.data.state || '',
          complemento: ''
        };
      }
      
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`ℹ️  BrasilAPI: ${cep} não existe`);
      } else {
        console.log(`⚠️  BrasilAPI erro: ${error.message}`);
      }
      return null;
    }
  }

  async fetchFromViaCEP(cep) {
    try {
      console.log(`📮 Consultando ViaCEP: ${cep}`);
      
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
        timeout: 20000,
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
      if (error.response?.status === 404) {
        console.log(`ℹ️  ViaCEP: ${cep} não existe`);
      } else {
        console.log(`⚠️  ViaCEP erro: ${error.message}`);
      }
      return null;
    }
  }

  async fetchCepData(cep) {
    this.stats.apiCalls++;
    
    // Tentar BrasilAPI primeiro (geralmente mais estável)
    let data = await this.fetchFromBrasilAPI(cep);
    
    if (!data) {
      // Aguardar 3 segundos antes de tentar ViaCEP
      console.log('⏳ Aguardando 3s antes de tentar ViaCEP...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      data = await this.fetchFromViaCEP(cep);
    }
    
    return data;
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

  async collectUltraConservatively(startCep = 38400010, maxCeps = 10) {
    console.log(`📍 Iniciando coleta ultra conservadora a partir de: ${this.formatCep(startCep)}`);
    console.log(`🎯 Meta: ${maxCeps} CEPs`);
    console.log(`⏱️  Delay: ${this.delay}ms entre requisições`);
    console.log(`🔄 Usando BrasilAPI + ViaCEP como fallback\n`);

    let currentCep = startCep;
    let collected = 0;

    while (collected < maxCeps && currentCep <= 38499999) {
      const formattedCep = this.formatCep(currentCep);
      this.stats.processed++;

      try {
        // 1. Verificar se já existe na base
        const exists = await this.cepExistsInDB(formattedCep);
        
        if (exists) {
          this.stats.skipped++;
          console.log(`⏭️  ${formattedCep} já existe na base`);
          currentCep++;
          continue;
        }

        // 2. Buscar nas APIs
        console.log(`\n🔍 Processando CEP ${this.stats.processed}/${maxCeps}: ${formattedCep}`);
        
        const cepData = await this.fetchCepData(formattedCep);
        
        if (cepData && cepData.cidade) {
          // 3. Verificar se é de Uberlândia
          const isUberlandia = cepData.cidade.toLowerCase().includes('uberlândia') ||
                              cepData.cidade.toLowerCase().includes('uberlandia');
          
          if (isUberlandia) {
            // 4. Salvar na base
            await this.saveCepData(cepData);
            this.stats.found++;
            collected++;
            
            console.log(`✅ SUCESSO: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`);
          } else {
            console.log(`ℹ️  Outro município: ${cepData.cidade}`);
          }
        } else {
          console.log(`❌ CEP ${formattedCep} não encontrado em nenhuma API`);
        }
        
        // 3. Pausa longa entre requisições
        if (collected < maxCeps) {
          console.log(`⏸️  Pausando ${this.delay}ms antes da próxima requisição...\n`);
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }

      } catch (error) {
        console.error(`❌ Erro processando ${formattedCep}:`, error.message);
        this.stats.errors++;
        
        // Pausa extra em caso de erro
        console.log('⏸️  Erro detectado, pausando 10 segundos...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      currentCep++;
    }

    return this.getResults();
  }

  async getResults() {
    const totalInDB = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM enderecos WHERE cidade_sem_acento LIKE ?', 
        ['%UBERLANDIA%'], (err, row) => {
          resolve(row ? row.count : 0);
        });
    });

    return {
      ...this.stats,
      totalInDB,
      efficiency: this.stats.apiCalls > 0 ? ((this.stats.found / this.stats.apiCalls) * 100).toFixed(1) : 0
    };
  }

  async printFinalStats(results) {
    console.log(`\n🎉 Coleta ultra conservadora finalizada!`);
    console.log(`📊 Estatísticas Finais:`);
    console.log(`   - CEPs processados: ${results.processed}`);
    console.log(`   - CEPs encontrados: ${results.found}`);
    console.log(`   - CEPs pulados: ${results.skipped}`);
    console.log(`   - Chamadas à API: ${results.apiCalls}`);
    console.log(`   - Erros: ${results.errors}`);
    console.log(`   - Total na base (Uberlândia): ${results.totalInDB}`);
    console.log(`   - Eficiência API: ${results.efficiency}%`);
    
    // Mostrar últimos CEPs coletados
    if (results.found > 0) {
      console.log(`\n📋 Últimos CEPs coletados:`);
      const lastCeps = await new Promise((resolve) => {
        this.db.all(`
          SELECT * FROM enderecos 
          WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
          ORDER BY id DESC 
          LIMIT 3
        `, (err, rows) => {
          resolve(rows || []);
        });
      });

      lastCeps.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro || 'N/A'}, ${row.bairro}`);
      });
    }
  }
}

async function runUltraConservativeCollection() {
  const collector = new UltraConservativeCEPCollector();
  
  try {
    await collector.init();
    
    // Configurações ultra conservadoras
    const results = await collector.collectUltraConservatively(
      38400010, // Começar do 38400-010
      5         // Apenas 5 CEPs por execução
    );
    
    await collector.printFinalStats(results);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runUltraConservativeCollection()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { UltraConservativeCEPCollector, runUltraConservativeCollection };