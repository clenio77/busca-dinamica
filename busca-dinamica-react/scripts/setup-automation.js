#!/usr/bin/env node

/**
 * Script para configurar automação de coleta de CEPs
 * Configura cron jobs e tarefas automáticas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomationSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
    this.logsDir = path.join(this.projectRoot, 'logs');
  }

  ensureDirectories() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
      console.log('✅ Diretório de logs criado');
    }
  }

  createCronScript() {
    const cronScript = `#!/bin/bash

# Script para execução automática via cron
# Configurado para rodar a coleta de CEPs

cd "${this.projectRoot}"

# Definir variáveis de ambiente
export NODE_ENV=production
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Log com timestamp
echo "$(date): Iniciando coleta automática de CEPs" >> logs/auto-collection.log

# Executar coleta
node scripts/enhanced-auto-collector.js >> logs/auto-collection.log 2>&1

# Log de finalização
echo "$(date): Coleta finalizada" >> logs/auto-collection.log

# Manter apenas os últimos 1000 linhas do log
tail -n 1000 logs/auto-collection.log > logs/auto-collection.log.tmp
mv logs/auto-collection.log.tmp logs/auto-collection.log
`;

    const cronScriptPath = path.join(this.scriptsDir, 'cron-collect.sh');
    fs.writeFileSync(cronScriptPath, cronScript);
    
    // Tornar executável
    try {
      execSync(`chmod +x "${cronScriptPath}"`);
      console.log('✅ Script cron criado e tornado executável');
    } catch (error) {
      console.log('⚠️  Script cron criado (pode precisar tornar executável manualmente)');
    }

    return cronScriptPath;
  }

  createSystemdService() {
    const serviceName = 'busca-dinamica-collector';
    const serviceContent = `[Unit]
Description=Busca Dinâmica CEP Collector
After=network.target

[Service]
Type=oneshot
User=${process.env.USER || 'www-data'}
WorkingDirectory=${this.projectRoot}
ExecStart=/usr/bin/node scripts/enhanced-auto-collector.js
Environment=NODE_ENV=production
StandardOutput=append:${this.logsDir}/systemd-collection.log
StandardError=append:${this.logsDir}/systemd-collection.log

[Install]
WantedBy=multi-user.target
`;

    const timerContent = `[Unit]
Description=Run Busca Dinâmica CEP Collector every 6 hours
Requires=${serviceName}.service

[Timer]
OnCalendar=*-*-* 00,06,12,18:00:00
Persistent=true

[Install]
WantedBy=timers.target
`;

    console.log('\n📋 Conteúdo do serviço systemd:');
    console.log('Arquivo:', `/etc/systemd/system/${serviceName}.service`);
    console.log(serviceContent);
    
    console.log('\n📋 Conteúdo do timer systemd:');
    console.log('Arquivo:', `/etc/systemd/system/${serviceName}.timer`);
    console.log(timerContent);

    return { serviceName, serviceContent, timerContent };
  }

  showCronInstructions(cronScriptPath) {
    console.log('\n📅 CONFIGURAÇÃO DO CRON:');
    console.log('Para configurar execução automática, adicione uma das linhas abaixo ao crontab:');
    console.log('(Execute: crontab -e)');
    console.log('');
    console.log('# Executar a cada 6 horas');
    console.log(`0 */6 * * * ${cronScriptPath}`);
    console.log('');
    console.log('# Executar diariamente às 2h da manhã');
    console.log(`0 2 * * * ${cronScriptPath}`);
    console.log('');
    console.log('# Executar de segunda a sexta às 9h e 15h');
    console.log(`0 9,15 * * 1-5 ${cronScriptPath}`);
  }

  showSystemdInstructions(serviceName) {
    console.log('\n🔧 CONFIGURAÇÃO DO SYSTEMD:');
    console.log('Para usar systemd (recomendado para servidores), execute:');
    console.log('');
    console.log('1. Copie os arquivos de serviço para /etc/systemd/system/');
    console.log('2. Execute os comandos:');
    console.log(`   sudo systemctl daemon-reload`);
    console.log(`   sudo systemctl enable ${serviceName}.timer`);
    console.log(`   sudo systemctl start ${serviceName}.timer`);
    console.log('');
    console.log('Para verificar status:');
    console.log(`   sudo systemctl status ${serviceName}.timer`);
    console.log(`   sudo systemctl list-timers ${serviceName}.timer`);
  }

  createPackageScripts() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Adicionar scripts de automação
      packageJson.scripts['collect:auto'] = 'node scripts/enhanced-auto-collector.js';
      packageJson.scripts['collect:setup'] = 'node scripts/setup-automation.js';
      packageJson.scripts['collect:status'] = 'node scripts/check-collection-status.js';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Scripts adicionados ao package.json');
    }
  }

  showUsageInstructions() {
    console.log('\n🚀 COMO USAR A AUTOMAÇÃO:');
    console.log('');
    console.log('1. Execução manual:');
    console.log('   npm run collect:auto');
    console.log('');
    console.log('2. Verificar status:');
    console.log('   npm run collect:status');
    console.log('');
    console.log('3. Logs:');
    console.log('   tail -f logs/auto-collection.log');
    console.log('');
    console.log('4. Configurar automação:');
    console.log('   - Use cron para execução periódica');
    console.log('   - Use systemd para servidores');
    console.log('   - Configure webhooks para triggers externos');
  }

  async setup() {
    console.log('🔧 Configurando automação de coleta de CEPs...\n');

    this.ensureDirectories();
    
    const cronScriptPath = this.createCronScript();
    const systemdConfig = this.createSystemdService();
    
    this.createPackageScripts();
    
    this.showCronInstructions(cronScriptPath);
    this.showSystemdInstructions(systemdConfig.serviceName);
    this.showUsageInstructions();

    console.log('\n✅ Configuração de automação concluída!');
    console.log('📁 Logs serão salvos em:', this.logsDir);
  }
}

async function main() {
  const setup = new AutomationSetup();
  await setup.setup();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AutomationSetup };
