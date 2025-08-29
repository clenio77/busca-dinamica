#!/usr/bin/env node

/**
 * Script de teste para o MCP Server de scraping de CEPs
 * Testa o scraping de alguns CEPs do site dos Correios
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPScraperTester {
  constructor() {
    this.mcpServerPath = path.join(__dirname, 'mcp-servers', 'cep-scraper-server.js');
  }

  async testScrapeCepRange() {
    console.log('🚀 Testando scraping de faixa de CEPs...');
    
    const testRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'scrape_cep_range',
        arguments: {
          startCep: '38400-000',
          endCep: '38400-010',
          maxResults: 5,
          delay: 3000
        }
      }
    };

    return this.sendMCPRequest(testRequest);
  }

  async testScrapeCityCeps() {
    console.log('🏙️ Testando scraping de CEPs por cidade...');
    
    const testRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'scrape_city_ceps',
        arguments: {
          cityName: 'Uberlândia',
          state: 'MG',
          maxResults: 10
        }
      }
    };

    return this.sendMCPRequest(testRequest);
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const mcpProcess = spawn('node', [this.mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      mcpProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`MCP Server exited with code ${code}: ${errorOutput}`));
        } else {
          try {
            // Tentar parsear a resposta JSON
            const lines = output.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const response = JSON.parse(lastLine);
            resolve(response);
          } catch (error) {
            console.log('Raw output:', output);
            reject(new Error(`Failed to parse MCP response: ${error.message}`));
          }
        }
      });

      // Enviar a requisição
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();

      // Timeout de 2 minutos
      setTimeout(() => {
        mcpProcess.kill();
        reject(new Error('MCP request timeout'));
      }, 120000);
    });
  }

  async listTools() {
    console.log('📋 Listando ferramentas disponíveis...');
    
    const listRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'tools/list'
    };

    return this.sendMCPRequest(listRequest);
  }

  async runTests() {
    try {
      console.log('🔧 Iniciando testes do MCP Scraper...\n');

      // Listar ferramentas
      const tools = await this.listTools();
      console.log('✅ Ferramentas disponíveis:', JSON.stringify(tools, null, 2));
      console.log('\n');

      // Testar scraping de faixa de CEPs
      const rangeResult = await this.testScrapeCepRange();
      console.log('✅ Resultado do scraping por faixa:', JSON.stringify(rangeResult, null, 2));
      console.log('\n');

      console.log('🎉 Testes concluídos com sucesso!');
    } catch (error) {
      console.error('❌ Erro durante os testes:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  const tester = new MCPScraperTester();
  tester.runTests();
}

module.exports = MCPScraperTester;
