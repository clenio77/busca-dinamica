#!/usr/bin/env node

/**
 * Script para executar atualização semanal manualmente
 */

require('dotenv').config();
const { initDatabase } = require('../database/init');
const { WeeklyUpdateService } = require('../services/weekly-update');

async function main() {
  console.log('🔄 Executando atualização semanal manual...');
  
  try {
    // Inicializar banco de dados
    await initDatabase();
    console.log('✅ Banco de dados inicializado');

    // Criar e executar serviço de atualização
    const updateService = new WeeklyUpdateService();
    await updateService.checkForUpdates();

    console.log('✅ Atualização semanal concluída');

  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
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
