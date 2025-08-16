#!/usr/bin/env node

/**
 * Script para configurar e testar o MCP Server de CEPs
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function setupMCP() {
  console.log('🚀 Configurando MCP Server para scraping de CEPs...\n');

  // 1. Instalar dependências do MCP server
  console.log('📦 Instalando dependências do MCP server...');
  const mcpDir = path.join(__dirname, '../mcp-servers');
  
  if (!fs.existsSync(path.join(mcpDir, 'node_modules'))) {
    await runCommand('npm', ['install'], { cwd: mcpDir });
    console.log('✅ Dependências instaladas\n');
  } else {
    console.log('✅ Dependências já instaladas\n');
  }

  // 2. Instalar Playwright browsers
  console.log('🎭 Instalando browsers do Playwright...');
  await runCommand('npx', ['playwright', 'install', 'chromium'], { cwd: mcpDir });
  console.log('✅ Browsers instalados\n');

  // 3. Verificar configuração MCP
  const mcpConfigPath = path.join(__dirname, '../.kiro/settings/mcp.json');
  if (fs.existsSync(mcpConfigPath)) {
    console.log('✅ Configuração MCP encontrada');
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    console.log('📋 Servidores MCP configurados:');
    Object.keys(config.mcpServers).forEach(name => {
      console.log(`   - ${name}`);
    });
  } else {
    console.log('❌ Configuração MCP não encontrada');
    console.log('   Execute este script a partir do diretório do projeto');
  }

  console.log('\n🎉 Setup concluído!');
  console.log('\n📖 Como usar:');
  console.log('1. Reinicie o Kiro para carregar os servidores MCP');
  console.log('2. Use os comandos MCP no chat:');
  console.log('   - scrape_cep_range: Para coletar faixa de CEPs');
  console.log('   - scrape_city_ceps: Para coletar CEPs de uma cidade');
  console.log('   - validate_cep_data: Para validar dados existentes');
  console.log('\n💡 Exemplo de uso:');
  console.log('   "Use o MCP para coletar CEPs de Uberlândia com scrape_city_ceps"');
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    child.on('error', reject);
  });
}

// Executar setup
if (require.main === module) {
  setupMCP().catch(error => {
    console.error('❌ Erro durante setup:', error.message);
    process.exit(1);
  });
}

module.exports = setupMCP;