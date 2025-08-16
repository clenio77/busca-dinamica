#!/usr/bin/env node

/**
 * Coletor sequencial de CEPs otimizado
 * Busca a partir do 38400-000 em sequência
 * Verifica na base antes de fazer requisição
 */

const axios = require('axios');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

class SequentialCEPCollector {
  constructor() {
    this.db = null;
    this.startCep = 38400000; // 38400-000
    this.endCep = 38499999;   // 38499-999
    this.batchSize = 100;     // Processar em lotes
    this.delay = 2000;        // Delay entre requisições (ms) - aumentado para 2s
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
    console.log('🚀 Coletor Sequencial de CEPs inicializado\n');
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

  async getLastProcessedCep() {
    return new Promise((resolve, reject) => {
      // Buscar o maior CEP de Uberlândia na base para continuar de onde parou
      this.db.get(`
        SELECT cep FROM enderecos 
        WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
        AND cep LIKE '384%' 
        ORDER BY cep DESC 
        LIMIT 1
      `, (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            const cepNumber = parseInt(row.cep.replace('-', ''));
            // Começar do próximo CEP após o último encontrado
            resolve(cepNumber + 1);
          } else {
            // Se não há CEPs na base, começar do 38400-000
            resolve(this.startCep);
          }
        }
      });
    });
  }

  async fetchCepFromAPI(cep, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.stats.apiCalls++;
        
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
          timeout: 10000, // Aumentar timeout para 10s
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
          // CEP não existe, não tentar novamente
          return null;
        }
        
        if (attempt === retries) {
          // Última tentativa falhou
          console.error(`❌ Erro API ${cep} (${retries} tentativas):`, error.message);
          this.stats.errors++;
          return null;
        }
        
        // Aguardar antes de tentar novamente
        const backoffDelay = attempt * 2000; // 2s, 4s, 6s...
        console.log(`⚠️  Erro ${cep} (tentativa ${attempt}/${retries}), aguardando ${backoffDelay}ms...`);
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

  async collectSequentially(options = {}) {
    const { 
      maxCeps = 500,
      startFrom = null,
      onProgress = null 
    } = options;

    // Determinar ponto de início
    const startCepNumber = startFrom || await this.getLastProcessedCep();
    const formattedStart = this.formatCep(startCepNumber);
    
    console.log(`📍 Iniciando coleta sequencial a partir de: ${formattedStart}`);
    console.log(`🎯 Meta: ${maxCeps} CEPs`);
    console.log(`📊 Faixa: ${formattedStart} até ${this.formatCep(this.endCep)}\n`);

    let currentCep = startCepNumber;
    let collected = 0;

    while (currentCep <= this.endCep && collected < maxCeps) {
      const formattedCep = this.formatCep(currentCep);
      this.stats.processed++;

      try {
        // 1. Verificar se já existe na base
        const exists = await this.cepExistsInDB(formattedCep);
        
        if (exists) {
          this.stats.skipped++;
          if (this.stats.processed % 100 === 0) {
            console.log(`⏭️  ${formattedCep} já existe (${this.stats.skipped} pulados)`);
          }
        } else {
          // 2. Buscar na API
          const cepData = await this.fetchCepFromAPI(formattedCep);
          
          if (cepData && cepData.cidade) {
            // 3. Verificar se é de Uberlândia ou região
            const isUberlandia = cepData.cidade.toLowerCase().includes('uberlândia') ||
                                cepData.cidade.toLowerCase().includes('uberlandia');
            
            if (isUberlandia) {
              // 4. Salvar na base
              await this.saveCepData(cepData);
              this.stats.found++;
              collected++;
              
              console.log(`✅ ${formattedCep}: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`);
            } else {
              // CEP de outro município
              if (this.stats.processed % 50 === 0) {
                console.log(`ℹ️  ${formattedCep}: ${cepData.cidade} (outro município)`);
              }
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }

        // Progress callback
        if (onProgress) {
          onProgress({
            current: formattedCep,
            processed: this.stats.processed,
            found: this.stats.found,
            skipped: this.stats.skipped,
            collected
          });
        }

        // Log de progresso
        if (this.stats.processed % 100 === 0) {
          this.printProgress(formattedCep, collected, maxCeps);
        }

      } catch (error) {
        console.error(`❌ Erro processando ${formattedCep}:`, error.message);
        this.stats.errors++;
      }

      currentCep++;
    }

    return this.getResults();
  }

  printProgress(currentCep, collected, maxCeps) {
    const percentage = ((collected / maxCeps) * 100).toFixed(1);
    console.log(`\n📊 Progresso: ${currentCep}`);
    console.log(`   - Processados: ${this.stats.processed}`);
    console.log(`   - Coletados: ${collected}/${maxCeps} (${percentage}%)`);
    console.log(`   - Encontrados: ${this.stats.found}`);
    console.log(`   - Pulados: ${this.stats.skipped}`);
    console.log(`   - Chamadas API: ${this.stats.apiCalls}`);
    console.log(`   - Erros: ${this.stats.errors}\n`);
  }

  async getResults() {
    // Estatísticas finais da base
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
    console.log(`\n🎉 Coleta sequencial finalizada!`);
    console.log(`📊 Estatísticas Finais:`);
    console.log(`   - CEPs processados: ${results.processed}`);
    console.log(`   - CEPs encontrados: ${results.found}`);
    console.log(`   - CEPs pulados (já existiam): ${results.skipped}`);
    console.log(`   - Chamadas à API: ${results.apiCalls}`);
    console.log(`   - Erros: ${results.errors}`);
    console.log(`   - Total na base (Uberlândia): ${results.totalInDB}`);
    console.log(`   - Eficiência API: ${results.efficiency}%`);
    
    // Mostrar últimos CEPs coletados
    console.log(`\n📋 Últimos CEPs coletados:`);
    const lastCeps = await new Promise((resolve) => {
      this.db.all(`
        SELECT * FROM enderecos 
        WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
        ORDER BY id DESC 
        LIMIT 5
      `, (err, rows) => {
        resolve(rows || []);
      });
    });

    lastCeps.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro || 'N/A'}, ${row.bairro}`);
    });
  }
}

async function runSequentialCollection() {
  const collector = new SequentialCEPCollector();
  
  try {
    await collector.init();
    
    // Configurações - muito mais conservadoras
    const options = {
      maxCeps: 50,         // Reduzir para apenas 50 CEPs por execução
      startFrom: 38400000, // Forçar início em 38400-000
      onProgress: null     // Callback opcional
    };

    const results = await collector.collectSequentially(options);
    await collector.printFinalStats(results);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runSequentialCollection()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { SequentialCEPCollector, runSequentialCollection };