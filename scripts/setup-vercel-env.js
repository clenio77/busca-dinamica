#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Vercel
 */

const crypto = require('crypto');

function generateSecrets() {
  const cronSecret = crypto.randomBytes(32).toString('hex');
  const manualToken = crypto.randomBytes(32).toString('hex');

  console.log('🔐 Variáveis de ambiente para configurar no Vercel:');
  console.log('================================================');
  console.log('');
  console.log('1. CRON_SECRET (para autenticação dos cron jobs):');
  console.log(`   ${cronSecret}`);
  console.log('');
  console.log('2. MANUAL_EXECUTION_TOKEN (para execução manual):');
  console.log(`   ${manualToken}`);
  console.log('');
  console.log('📋 Como configurar no Vercel:');
  console.log('1. Acesse: https://vercel.com/dashboard');
  console.log('2. Vá para seu projeto > Settings > Environment Variables');
  console.log('3. Adicione as variáveis acima');
  console.log('4. Redeploy o projeto');
  console.log('');
  console.log('🔧 Comandos Vercel CLI (alternativa):');
  console.log(`vercel env add CRON_SECRET`);
  console.log(`vercel env add MANUAL_EXECUTION_TOKEN`);
  console.log('');
  console.log('⏰ Cronogramas configurados:');
  console.log('- Atualização semanal: Segunda-feira às 2h (0 2 * * 1)');
  console.log('- Coleta diária: Todos os dias às 6h (0 6 * * *)');
  console.log('');
  console.log('🚀 Endpoints disponíveis após deploy:');
  console.log('- /api/cron/update-ceps (automático)');
  console.log('- /api/cron/collect-ceps (automático)');
  console.log('- /api/manual/run-collector (manual)');
}

if (require.main === module) {
  generateSecrets();
}

module.exports = { generateSecrets };
