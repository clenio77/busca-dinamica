#!/usr/bin/env node

/**
 * Coletor Automático Aprimorado de CEPs
 * Combina coleta inteligente com múltiplas estratégias
 */

const { UltraConservativeCEPCollector } = require('./ultra-conservative-collector');
const { getDatabase } = require('../database/init');

class EnhancedAutoCEPCollector {
  constructor() {
    this.collector = new UltraConservativeCEPCollector();
    this.stats = {
      totalCollected: 0,
      totalProcessed: 0,
      citiesFound: new Set(),
      lastProcessedCep: null
    };
    
    // Configurações flexíveis
    this.config = {
      cepsPerBatch: 10,
      pauseBetweenBatches: 15000, // 15 segundos
      maxBatches: 20,
      targetCities: ['Uberlândia', 'Araguari', 'Patos de Minas', 'Ituiutaba'],
      cepRanges: [
        { start: 38400000, end: 38499999, city: 'Uberlândia' },
        { start: 38440000, end: 38449999, city: 'Araguari' },
        { start: 38700000, end: 38799999, city: 'Patos de Minas' },
        { start: 38300000, end: 38399999, city: 'Ituiutaba' }
      ]
    };
  }

  async init() {
    await this.collector.init();
    console.log('🚀 Enhanced Auto CEP Collector inicializado');
  }

  async getLastProcessedCepForRange(startRange, endRange) {
    return new Promise((resolve, reject) => {
      const db = this.collector.db;
      const startCepStr = this.formatCep(startRange);
      const endCepStr = this.formatCep(endRange);
      
      db.get(`
        SELECT cep FROM enderecos 
        WHERE cep >= ? AND cep <= ?
        ORDER BY cep DESC 
        LIMIT 1
      `, [startCepStr, endCepStr], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            const cepNumber = parseInt(row.cep.replace('-', ''));
            resolve(cepNumber + 1);
          } else {
            resolve(startRange);
          }
        }
      });
    });
  }

  async getCityStats() {
    return new Promise((resolve, reject) => {
      const db = this.collector.db;
      
      db.all(`
        SELECT 
          cidade,
          COUNT(*) as count,
          MAX(updated_at) as last_update
        FROM enderecos 
        GROUP BY cidade 
        ORDER BY count DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  formatCep(cepNumber) {
    const cepStr = cepNumber.toString().padStart(8, '0');
    return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
  }

  async collectForCityRange(cityConfig, maxCeps = 10) {
    console.log(`\n🏙️  Coletando CEPs para ${cityConfig.city}`);
    console.log(`📍 Faixa: ${this.formatCep(cityConfig.start)} - ${this.formatCep(cityConfig.end)}`);
    
    const startFrom = await this.getLastProcessedCepForRange(cityConfig.start, cityConfig.end);
    console.log(`🔄 Iniciando em: ${this.formatCep(startFrom)}`);
    
    let currentCep = startFrom;
    let collected = 0;
    let processed = 0;
    
    while (collected < maxCeps && currentCep <= cityConfig.end && processed < maxCeps * 3) {
      const formattedCep = this.formatCep(currentCep);
      processed++;
      
      try {
        // Verificar se já existe
        const exists = await this.collector.cepExistsInDB(formattedCep);
        if (exists) {
          currentCep++;
          continue;
        }
        
        // Buscar CEP
        const cepData = await this.collector.fetchCepData(formattedCep);
        
        if (cepData && cepData.cidade) {
          // Verificar se é da cidade esperada ou próxima
          const cityMatch = this.config.targetCities.some(targetCity =>
            cepData.cidade.toLowerCase().includes(targetCity.toLowerCase()) ||
            targetCity.toLowerCase().includes(cepData.cidade.toLowerCase())
          );
          
          if (cityMatch) {
            await this.collector.saveCepData(cepData);
            collected++;
            this.stats.totalCollected++;
            this.stats.citiesFound.add(cepData.cidade);
            
            console.log(`✅ ${formattedCep}: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`);
          } else {
            console.log(`ℹ️  ${formattedCep}: ${cepData.cidade} (fora do alvo)`);
          }
        }
        
        this.stats.totalProcessed++;
        this.stats.lastProcessedCep = formattedCep;
        
        // Delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${formattedCep}:`, error.message);
      }
      
      currentCep++;
    }
    
    return { collected, processed };
  }

  async runEnhancedCollection() {
    console.log('🚀 Iniciando coleta automática aprimorada...\n');
    
    // Mostrar estatísticas atuais
    const cityStats = await this.getCityStats();
    console.log('📊 Estatísticas atuais por cidade:');
    cityStats.forEach(stat => {
      console.log(`   ${stat.cidade}: ${stat.count} CEPs (última atualização: ${stat.last_update})`);
    });
    
    console.log(`\n🎯 Cidades alvo: ${this.config.targetCities.join(', ')}`);
    console.log(`📦 CEPs por lote: ${this.config.cepsPerBatch}`);
    console.log(`⏱️  Pausa entre lotes: ${this.config.pauseBetweenBatches}ms\n`);
    
    // Executar coleta para cada faixa de cidade
    for (const cityConfig of this.config.cepRanges) {
      try {
        console.log(`\n🔄 === PROCESSANDO ${cityConfig.city.toUpperCase()} ===`);
        
        const result = await this.collectForCityRange(cityConfig, this.config.cepsPerBatch);
        
        console.log(`📈 Resultado para ${cityConfig.city}:`);
        console.log(`   - Coletados: ${result.collected}`);
        console.log(`   - Processados: ${result.processed}`);
        
        // Pausa entre cidades
        if (this.config.pauseBetweenBatches > 0) {
          console.log(`⏳ Aguardando ${this.config.pauseBetweenBatches/1000}s antes da próxima cidade...`);
          await new Promise(resolve => setTimeout(resolve, this.config.pauseBetweenBatches));
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${cityConfig.city}:`, error);
      }
    }
    
    // Relatório final
    console.log(`\n\n🎉 === COLETA FINALIZADA ===`);
    console.log(`📊 Resumo:`);
    console.log(`   - Total coletado: ${this.stats.totalCollected} CEPs`);
    console.log(`   - Total processado: ${this.stats.totalProcessed} requisições`);
    console.log(`   - Cidades encontradas: ${Array.from(this.stats.citiesFound).join(', ')}`);
    console.log(`   - Último CEP processado: ${this.stats.lastProcessedCep}`);
    
    // Atualizar JSON público
    await this.updatePublicJSON();
  }

  async updatePublicJSON() {
    console.log('\n🔄 Atualizando arquivo JSON público...');
    
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/generate-json-from-db.js', { 
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      console.log('✅ Arquivo JSON atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar JSON:', error.message);
    }
  }
}

async function runEnhancedCollection() {
  const collector = new EnhancedAutoCEPCollector();
  
  try {
    await collector.init();
    await collector.runEnhancedCollection();
  } catch (error) {
    console.error('❌ Erro fatal na coleta:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runEnhancedCollection();
}

module.exports = { EnhancedAutoCEPCollector };
