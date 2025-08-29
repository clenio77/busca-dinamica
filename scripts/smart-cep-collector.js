#!/usr/bin/env node

/**
 * Coletor inteligente de CEPs
 * Usa estratégia mais eficiente para evitar sobrecarga da API
 */

const axios = require('axios');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

class SmartCEPCollector {
  constructor() {
    this.db = null;
    this.delay = 3000; // 3 segundos entre requisições
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
    console.log('🧠 Coletor Inteligente de CEPs inicializado\n');
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

  // Gerar CEPs sequenciais a partir do ponto inicial
  generateSmartCeps(startCep = 38400010, count = 50) {
    const ceps = [];
    let currentCep = startCep;
    
    // Gerar CEPs sequenciais
    for (let i = 0; i < count; i++) {
      if (currentCep >= 38400000 && currentCep <= 38499999) {
        ceps.push(currentCep);
      }
      currentCep++;
    }
    
    return ceps;
  }

  async fetchCepFromAPI(cep, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.stats.apiCalls++;
        
        console.log(`🔍 Consultando: ${cep} (tentativa ${attempt}/${retries})`);
        
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
          console.log(`ℹ️  ${cep}: CEP não existe`);
          return null;
        }
        
        if (attempt === retries) {
          console.error(`❌ Erro final ${cep}:`, error.message);
          this.stats.errors++;
          
          // Se muitos erros consecutivos, pausar mais tempo
          if (this.stats.errors % 5 === 0) {
            console.log('⏸️  Muitos erros, pausando 30 segundos...');
            await new Promise(resolve => setTimeout(resolve, 30000));
          }
          
          return null;
        }
        
        // Backoff exponencial
        const backoffDelay = attempt * 5000; // 5s, 10s
        console.log(`⚠️  Erro ${cep}, aguardando ${backoffDelay}ms...`);
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

  async collectSmartly(options = {}) {
    const { 
      maxCeps = 30,
      startFrom = 38400000
    } = options;

    console.log(`📍 Iniciando coleta inteligente a partir de: ${this.formatCep(startFrom)}`);
    console.log(`🎯 Meta: ${maxCeps} CEPs`);
    console.log(`⏱️  Delay: ${this.delay}ms entre requisições\n`);

    // Gerar lista de CEPs inteligentes
    const smartCeps = this.generateSmartCeps(startFrom, maxCeps * 3); // 3x mais para ter opções
    let collected = 0;

    for (const cepNumber of smartCeps) {
      if (collected >= maxCeps) break;
      
      const formattedCep = this.formatCep(cepNumber);
      this.stats.processed++;

      try {
        // 1. Verificar se já existe na base
        const exists = await this.cepExistsInDB(formattedCep);
        
        if (exists) {
          this.stats.skipped++;
          console.log(`⏭️  ${formattedCep} já existe na base`);
          continue;
        }

        // 2. Buscar na API
        const cepData = await this.fetchCepFromAPI(formattedCep);
        
        if (cepData && cepData.cidade) {
          // 3. Verificar se é de Uberlândia
          const isUberlandia = cepData.cidade.toLowerCase().includes('uberlândia') ||
                              cepData.cidade.toLowerCase().includes('uberlandia');
          
          if (isUberlandia) {
            // 4. Salvar na base
            await this.saveCepData(cepData);
            this.stats.found++;
            collected++;
            
            console.log(`✅ ${formattedCep}: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`);
          } else {
            console.log(`ℹ️  ${formattedCep}: ${cepData.cidade} (outro município)`);
          }
        }
        
        // Rate limiting - pausa entre requisições
        if (this.stats.apiCalls % 10 === 0) {
          console.log(`⏸️  Pausa de 10 segundos após 10 requisições...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }

      } catch (error) {
        console.error(`❌ Erro processando ${formattedCep}:`, error.message);
        this.stats.errors++;
      }

      // Log de progresso
      if (this.stats.processed % 10 === 0) {
        this.printProgress(collected, maxCeps);
      }
    }

    return this.getResults();
  }

  printProgress(collected, maxCeps) {
    const percentage = ((collected / maxCeps) * 100).toFixed(1);
    console.log(`\n📊 Progresso:`);
    console.log(`   - Processados: ${this.stats.processed}`);
    console.log(`   - Coletados: ${collected}/${maxCeps} (${percentage}%)`);
    console.log(`   - Encontrados: ${this.stats.found}`);
    console.log(`   - Pulados: ${this.stats.skipped}`);
    console.log(`   - Chamadas API: ${this.stats.apiCalls}`);
    console.log(`   - Erros: ${this.stats.errors}\n`);
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
    console.log(`\n🎉 Coleta inteligente finalizada!`);
    console.log(`📊 Estatísticas Finais:`);
    console.log(`   - CEPs processados: ${results.processed}`);
    console.log(`   - CEPs encontrados: ${results.found}`);
    console.log(`   - CEPs pulados: ${results.skipped}`);
    console.log(`   - Chamadas à API: ${results.apiCalls}`);
    console.log(`   - Erros: ${results.errors}`);
    console.log(`   - Total na base (Uberlândia): ${results.totalInDB}`);
    console.log(`   - Eficiência API: ${results.efficiency}%`);
  }
}

async function runSmartCollection() {
  const collector = new SmartCEPCollector();
  
  try {
    await collector.init();
    
    const options = {
      maxCeps: 20,         // Apenas 20 CEPs por execução
      startFrom: 38400010  // Começar do 38400-010
    };

    const results = await collector.collectSmartly(options);
    await collector.printFinalStats(results);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSmartCollection()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { SmartCEPCollector, runSmartCollection };