#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente do Render
 * Gera tokens de segurança e configurações necessárias
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuração de Ambiente para Render');
console.log('=====================================\n');

// Gerar tokens de segurança
const cronSecret = crypto.randomBytes(32).toString('hex');
const manualToken = crypto.randomBytes(32).toString('hex');

// Configurações padrão
const config = {
  NODE_ENV: 'production',
  SCRAPER_DELAY_MS: '2000',
  MAX_REQUESTS_PER_MINUTE: '30',
  DISABLE_CRON: 'false',
  DISABLE_BACKUP: 'false',
  DISABLE_FILE_LOGS: 'false',
  CRON_SECRET: cronSecret,
  MANUAL_EXECUTION_TOKEN: manualToken,
  UPDATE_SCHEDULE: '0 2 * * 1',
  COLLECT_SCHEDULE: '0 6 * * *'
};

console.log('🔑 Tokens de Segurança Gerados:');
console.log('================================');
console.log(`1. CRON_SECRET (para autenticação dos cron jobs):`);
console.log(`   ${cronSecret}`);
console.log('');
console.log(`2. MANUAL_EXECUTION_TOKEN (para execução manual):`);
console.log(`   ${manualToken}`);
console.log('');

console.log('⚙️ Configurações de Ambiente:');
console.log('==============================');
Object.entries(config).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});
console.log('');

console.log('📋 Passos para Configuração no Render:');
console.log('======================================');
console.log('');
console.log('1. Acesse o Dashboard do Render:');
console.log('   https://dashboard.render.com');
console.log('');
console.log('2. Selecione seu Web Service "busca-cep"');
console.log('');
console.log('3. Vá em "Environment" > "Environment Variables"');
console.log('');
console.log('4. Adicione cada variável da lista acima');
console.log('');
console.log('5. Clique em "Save Changes"');
console.log('');
console.log('6. O Render fará deploy automático');
console.log('');

console.log('🔧 Endpoints de Automação Disponíveis:');
console.log('======================================');
console.log('');
console.log('📊 Status dos Cron Jobs:');
console.log(`   GET /api/admin/cron/status`);
console.log('');
console.log('🔄 Execução Manual:');
console.log(`   POST /api/admin/cron/execute`);
console.log('');
console.log('📝 Exemplos de Uso:');
console.log('');

// Exemplos de uso
const examples = [
  {
    action: 'collect-ceps',
    description: 'Coletar CEPs manualmente',
    params: { startFrom: 38400010, maxCEPs: 20 }
  },
  {
    action: 'weekly-update',
    description: 'Executar atualização semanal',
    params: {}
  },
  {
    action: 'status',
    description: 'Verificar status dos serviços',
    params: {}
  }
];

examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.description}:`);
  console.log(`   curl -X POST https://seu-app.onrender.com/api/admin/cron/execute \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"action": "${example.action}", "params": ${JSON.stringify(example.params, null, 2)}}'`);
  console.log('');
});

console.log('⏰ Cronogramas Configurados:');
console.log('============================');
console.log(`- Atualização Semanal: ${config.UPDATE_SCHEDULE} (Segunda-feira 2h)`);
console.log(`- Coleta Diária: ${config.COLLECT_SCHEDULE} (Todos os dias 6h)`);
console.log('');

console.log('🔒 Segurança:');
console.log('==============');
console.log('- Todos os endpoints requerem autenticação');
console.log('- Tokens são únicos para cada instância');
console.log('- Rate limiting configurado para proteção');
console.log('');

console.log('📁 Arquivos de Configuração:');
console.log('=============================');
console.log('- render.yaml: Configuração de deploy');
console.log('- server-render.js: Servidor otimizado');
console.log('- .env: Variáveis locais (não commitar)');
console.log('');

// Salvar configuração em arquivo .env.render
const envContent = Object.entries(config)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const envPath = path.join(__dirname, '..', '.env.render');
fs.writeFileSync(envPath, envContent);

console.log(`💾 Configuração salva em: ${envPath}`);
console.log('⚠️  Este arquivo contém tokens sensíveis - NÃO commitar no Git!');
console.log('');

console.log('✅ Configuração concluída!');
console.log('🚀 Faça deploy no Render e os cron jobs funcionarão automaticamente.');
console.log('');
console.log('📞 Para suporte, consulte a documentação ou abra uma issue no GitHub.');