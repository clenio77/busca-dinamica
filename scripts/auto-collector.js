#!/usr/bin/env node

/**
 * Coletor Automático de CEPs
 * Executa múltiplas coletas com pausas inteligentes
 */

const { UltraConservativeCEPCollector } = require('./ultra-conservative-collector');

class AutoCEPCollector {
  constructor() {
    this.collector = new UltraConservativeCEPCollector();
    this.totalCollected = 0;
    this.totalProcessed = 0;
    this.currentCep = 38400015; // Começar do 38400-015
    this.maxIterations = 50; // Máximo de execuções
    this.cepsPerBatch = 5; // CEPs por lote
    this.pauseBetweenBatches = 30000; // 30 segundos entre lotes
    this.pauseAfterErrors = 60000; // 1 minuto após erros
  }

  async init() {
    await this.collector.init();
    console.log('🤖 Coletor Automático de CEPs inicializado');
    console.log(`📊 Configurações:`);
    console.log(`   - CEPs por lote: ${this.cepsPerBatch}`);
    console.log(`   - Pausa entre lotes: ${this.pauseBetweenBatches / 1000}s`);
    console.log(`   - Máximo de execuções: ${this.maxIterations}`);
    console.log(`   - Início: ${this.formatCep(this.currentCep)}\n`);
  }

  formatCep(cepNumber) {
    const cepStr = cepNumber.toString().padStart(8, '0');
    return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
  }

  async getLastProcessedCep() {
    return new Promise((resolve, reject) => {
      this.collector.db.get(
        `
        SELECT cep FROM enderecos 
        WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
        AND cep LIKE '384%' 
        ORDER BY cep DESC 
        LIMIT 1
      `,
        (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              const cepNumber = parseInt(row.cep.replace('-', ''));
              resolve(cepNumber + 1); // Próximo CEP
            } else {
              resolve(this.currentCep); // Começar do padrão
            }
          }
        }
      );
    });
  }

  async runAutomaticCollection() {
    console.log('🚀 Iniciando coleta automática...\n');

    // Forçar início no 38400-015 (não usar getLastProcessedCep)
    this.currentCep = 38400015;
    console.log(`📍 Forçando início em: ${this.formatCep(this.currentCep)}\n`);

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      try {
        console.log(`\n🔄 === LOTE ${iteration}/${this.maxIterations} ===`);
        console.log(`📍 Coletando CEPs a partir de: ${this.formatCep(this.currentCep)}`);

        // Executar coleta do lote atual
        const results = await this.collector.collectUltraConservatively(
          this.currentCep,
          this.cepsPerBatch
        );

        // Atualizar estatísticas
        this.totalCollected += results.found;
        this.totalProcessed += results.processed;
        this.currentCep += this.cepsPerBatch;

        // Log do progresso
        console.log(`\n📊 Progresso do Lote ${iteration}:`);
        console.log(`   - CEPs encontrados: ${results.found}/${this.cepsPerBatch}`);
        console.log(`   - Eficiência: ${results.efficiency}%`);
        console.log(`   - Erros: ${results.errors}`);
        console.log(`   - Total na base: ${results.totalInDB}`);

        // Log do progresso geral
        console.log(`\n📈 Progresso Geral:`);
        console.log(`   - Total coletado: ${this.totalCollected}`);
        console.log(`   - Total processado: ${this.totalProcessed}`);
        console.log(`   - Próximo CEP: ${this.formatCep(this.currentCep)}`);

        // Verificar se deve continuar
        if (results.errors > 3) {
          console.log(`\n⚠️  Muitos erros detectados (${results.errors}), pausando mais tempo...`);
          await this.sleep(this.pauseAfterErrors);
        } else if (iteration < this.maxIterations) {
          // Pausa normal entre lotes
          console.log(
            `\n⏸️  Pausando ${this.pauseBetweenBatches / 1000}s antes do próximo lote...`
          );
          await this.sleep(this.pauseBetweenBatches);
        }

        // Parar se chegou no limite de CEPs de Uberlândia
        if (this.currentCep > 38499999) {
          console.log('\n🏁 Chegou ao final da faixa de CEPs de Uberlândia (38499-999)');
          break;
        }
      } catch (error) {
        console.error(`\n❌ Erro no lote ${iteration}:`, error.message);
        console.log(`⏸️  Pausando ${this.pauseAfterErrors / 1000}s devido ao erro...`);
        await this.sleep(this.pauseAfterErrors);
      }
    }

    await this.printFinalSummary();
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async printFinalSummary() {
    // Estatísticas finais da base
    const totalInDB = await new Promise((resolve) => {
      this.collector.db.get(
        'SELECT COUNT(*) as count FROM enderecos WHERE cidade_sem_acento LIKE ?',
        ['%UBERLANDIA%'],
        (err, row) => {
          resolve(row ? row.count : 0);
        }
      );
    });

    console.log(`\n\n🎉 === COLETA AUTOMÁTICA FINALIZADA ===`);
    console.log(`📊 Resumo Final:`);
    console.log(`   - Total de CEPs coletados: ${this.totalCollected}`);
    console.log(`   - Total de CEPs processados: ${this.totalProcessed}`);
    console.log(`   - CEPs de Uberlândia na base: ${totalInDB}`);
    console.log(`   - Último CEP processado: ${this.formatCep(this.currentCep - 1)}`);
    console.log(`   - Próxima execução deve começar em: ${this.formatCep(this.currentCep)}`);

    // Mostrar alguns CEPs recentes
    console.log(`\n📋 Últimos CEPs coletados:`);
    const recentCeps = await new Promise((resolve) => {
      this.collector.db.all(
        `
        SELECT * FROM enderecos 
        WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
        ORDER BY id DESC 
        LIMIT 10
      `,
        (err, rows) => {
          resolve(rows || []);
        }
      );
    });

    recentCeps.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro || 'N/A'}, ${row.bairro}`);
    });

    console.log(`\n✨ Para continuar coletando, execute novamente: npm run auto-collect`);
  }
}

async function runAutoCollection() {
  const autoCollector = new AutoCEPCollector();

  try {
    await autoCollector.init();
    await autoCollector.runAutomaticCollection();
  } catch (error) {
    console.error('❌ Erro fatal na coleta automática:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // Capturar Ctrl+C para finalização limpa
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Coleta automática interrompida pelo usuário');
    console.log('✅ Dados coletados até agora foram salvos na base');
    process.exit(0);
  });

  runAutoCollection()
    .then(() => {
      console.log('\n✅ Coleta automática finalizada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { AutoCEPCollector, runAutoCollection };
