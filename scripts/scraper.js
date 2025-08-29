#!/usr/bin/env node

/**
 * Script para executar o scraper de CEPs manualmente
 * 
 * Uso:
 * npm run scraper -- --start=30000000 --max=1000
 * node scripts/scraper.js --start=30000000 --max=1000 --city="Uberlandia"
 */

require('dotenv').config();
const CEPScraper = require('../services/cep-scraper');
const { initDatabase } = require('../database/init');

async function main() {
  const args = process.argv.slice(2);
  
  // Parse argumentos
  const options = {
    start: 30000000,
    max: 1000,
    city: null,
    help: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--start=')) {
      options.start = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--max=')) {
      options.max = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--city=')) {
      options.city = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  });

  if (options.help) {
    console.log(`
🔍 Scraper de CEPs - Minas Gerais

Uso:
  npm run scraper -- [opções]
  node scripts/scraper.js [opções]

Opções:
  --start=NUMERO    CEP inicial (padrão: 30000000)
  --max=NUMERO      Máximo de CEPs para processar (padrão: 1000)
  --city=NOME       Filtrar por cidade específica
  --help, -h        Mostrar esta ajuda

Exemplos:
  npm run scraper -- --start=38400000 --max=500
  npm run scraper -- --city="Uberlandia" --max=2000
  npm run scraper -- --start=30100000 --max=100
    `);
    process.exit(0);
  }

  console.log('🚀 Iniciando scraper de CEPs...');
  console.log(`📊 Configurações:`);
  console.log(`   - CEP inicial: ${options.start}`);
  console.log(`   - Máximo: ${options.max}`);
  console.log(`   - Cidade: ${options.city || 'Todas'}`);
  console.log('');

  try {
    // Inicializar banco de dados
    await initDatabase();
    console.log('✅ Banco de dados inicializado');

    // Criar instância do scraper
    const scraper = new CEPScraper();

    // Callback para mostrar progresso
    const onProgress = (progress) => {
      const { processed, found, errors, currentCEP } = progress;
      
      if (processed % 50 === 0) {
        const percentage = ((processed / options.max) * 100).toFixed(1);
        console.log(`📊 Progresso: ${percentage}% (${processed}/${options.max}) - Encontrados: ${found} - Erros: ${errors}`);
      }
    };

    // Executar scraping
    const result = await scraper.scrapeMGCEPs({
      startFrom: options.start,
      maxCEPs: options.max,
      onProgress
    });

    console.log('\n🏁 Scraping concluído!');
    console.log(`📊 Resultados finais:`);
    console.log(`   - Processados: ${result.processed}`);
    console.log(`   - Encontrados: ${result.found}`);
    console.log(`   - Erros: ${result.errors}`);
    console.log(`   - Taxa de sucesso: ${((result.found / result.processed) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erro durante execução:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = main;
