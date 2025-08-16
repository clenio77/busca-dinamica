#!/usr/bin/env node

/**
 * MCP Server para Scraping de CEPs usando Playwright
 * Integra com o sistema de busca dinâmica existente
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const { chromium } = require('playwright');
const { getDatabase, removeAccents } = require('../database/init');

class CEPScraperMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cep-scraper-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'scrape_cep_range',
          description: 'Scraping de uma faixa de CEPs usando Playwright nos Correios',
          inputSchema: {
            type: 'object',
            properties: {
              startCep: {
                type: 'string',
                description: 'CEP inicial (formato: 38400-000)'
              },
              endCep: {
                type: 'string',
                description: 'CEP final (formato: 38499-999)'
              },
              maxResults: {
                type: 'number',
                description: 'Máximo de resultados (padrão: 100)',
                default: 100
              },
              delay: {
                type: 'number',
                description: 'Delay entre requisições em ms (padrão: 2000)',
                default: 2000
              }
            },
            required: ['startCep', 'endCep']
          }
        },
        {
          name: 'scrape_city_ceps',
          description: 'Scraping de CEPs de uma cidade específica',
          inputSchema: {
            type: 'object',
            properties: {
              cityName: {
                type: 'string',
                description: 'Nome da cidade (ex: Uberlândia)'
              },
              state: {
                type: 'string',
                description: 'Estado (padrão: MG)',
                default: 'MG'
              },
              maxResults: {
                type: 'number',
                description: 'Máximo de resultados (padrão: 500)',
                default: 500
              }
            },
            required: ['cityName']
          }
        },
        {
          name: 'validate_cep_data',
          description: 'Validar e limpar dados de CEP existentes na base',
          inputSchema: {
            type: 'object',
            properties: {
              batchSize: {
                type: 'number',
                description: 'Tamanho do lote para processamento (padrão: 50)',
                default: 50
              }
            }
          }
        }
      ]
    }));

    // Handler para executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scrape_cep_range':
            return await this.scrapeCepRange(args);
          case 'scrape_city_ceps':
            return await this.scrapeCityCeps(args);
          case 'validate_cep_data':
            return await this.validateCepData(args);
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro ao executar ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async scrapeCepRange({ startCep, endCep, maxResults = 100, delay = 2000 }) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();

    const results = [];
    let processed = 0;
    let found = 0;

    try {
      // Converter CEPs para números para iteração
      const startNum = parseInt(startCep.replace('-', ''));
      const endNum = parseInt(endCep.replace('-', ''));

      for (let cepNum = startNum; cepNum <= endNum && processed < maxResults; cepNum++) {
        const cepStr = cepNum.toString().padStart(8, '0');
        const formattedCep = `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;

        try {
          // Navegar para o site dos Correios
          await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php');

          // Preencher o CEP
          await page.fill('#endereco', formattedCep);
          await page.click('#btn_pesquisar');

          // Aguardar resultado
          await page.waitForTimeout(2000);

          // Extrair dados
          const cepData = await page.evaluate(() => {
            const result = {};

            // Tentar extrair dados da tabela de resultado
            const rows = document.querySelectorAll('table tr');
            rows.forEach((row) => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                const label = cells[0]?.textContent?.trim();
                const value = cells[1]?.textContent?.trim();

                if (label && value) {
                  if (label.includes('Logradouro')) result.logradouro = value;
                  if (label.includes('Bairro')) result.bairro = value;
                  if (label.includes('Localidade')) result.cidade = value;
                  if (label.includes('CEP')) result.cep = value;
                }
              }
            });

            return result;
          });

          if (cepData.logradouro && cepData.cidade) {
            // Salvar no banco de dados
            await this.saveCepData({
              cep: formattedCep,
              logradouro: cepData.logradouro,
              bairro: cepData.bairro || '',
              cidade: cepData.cidade,
              estado: 'MG',
              complemento: ''
            });

            results.push(cepData);
            found++;
          }

          processed++;

          // Delay entre requisições
          await page.waitForTimeout(delay);
        } catch (error) {
          console.error(`Erro ao processar CEP ${formattedCep}:`, error.message);
        }
      }
    } finally {
      await browser.close();
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              processed,
              found,
              results: results.slice(0, 10), // Mostrar apenas os primeiros 10
              summary: `Processados: ${processed}, Encontrados: ${found}`
            },
            null,
            2
          )
        }
      ]
    };
  }

  async scrapeCityCeps({ cityName, state = 'MG', maxResults = 500 }) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const results = [];
    let found = 0;

    try {
      // Navegar para busca por cidade
      await page.goto('https://buscacepinter.correios.com.br/app/localidade_logradouro/index.php');

      // Preencher cidade
      await page.fill('#localidade', cityName);
      await page.selectOption('#uf', state);
      await page.click('#btn_pesquisar');

      // Aguardar resultados
      await page.waitForTimeout(3000);

      // Extrair todos os CEPs da página
      const cepList = await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('table tr');

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const logradouro = cells[0]?.textContent?.trim();
            const bairro = cells[1]?.textContent?.trim();
            const cidade = cells[2]?.textContent?.trim();
            const cep = cells[3]?.textContent?.trim();

            if (logradouro && cep) {
              results.push({ logradouro, bairro, cidade, cep });
            }
          }
        });

        return results;
      });

      // Salvar cada CEP encontrado
      for (const cepData of cepList.slice(0, maxResults)) {
        try {
          await this.saveCepData({
            ...cepData,
            estado: state,
            complemento: ''
          });
          results.push(cepData);
          found++;
        } catch (error) {
          console.error(`Erro ao salvar CEP ${cepData.cep}:`, error.message);
        }
      }
    } finally {
      await browser.close();
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              city: cityName,
              state,
              found,
              results: results.slice(0, 20), // Mostrar primeiros 20
              summary: `Encontrados ${found} CEPs para ${cityName}/${state}`
            },
            null,
            2
          )
        }
      ]
    };
  }

  async validateCepData({ batchSize = 50 }) {
    return new Promise((resolve) => {
      const db = getDatabase();

      db.all(
        'SELECT * FROM enderecos WHERE logradouro_sem_acento IS NULL OR logradouro_sem_acento = "" LIMIT ?',
        [batchSize],
        async (err, rows) => {
          if (err) {
            resolve({
              content: [{ type: 'text', text: `Erro: ${err.message}` }],
              isError: true
            });
            return;
          }

          let updated = 0;
          for (const row of rows) {
            try {
              const updateSQL = `
                UPDATE enderecos SET 
                  logradouro_sem_acento = ?,
                  bairro_sem_acento = ?,
                  cidade_sem_acento = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `;

              await new Promise((resolve, reject) => {
                db.run(
                  updateSQL,
                  [
                    removeAccents(row.logradouro),
                    removeAccents(row.bairro || ''),
                    removeAccents(row.cidade),
                    row.id
                  ],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });

              updated++;
            } catch (error) {
              console.error(`Erro ao atualizar registro ${row.id}:`, error.message);
            }
          }

          resolve({
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    processed: rows.length,
                    updated,
                    summary: `Validados ${updated} registros de ${rows.length} processados`
                  },
                  null,
                  2
                )
              }
            ]
          });
        }
      );
    });
  }

  async saveCepData(data) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      // Verificar se já existe
      db.get('SELECT id FROM enderecos WHERE cep = ?', [data.cep], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          // Atualizar
          const updateSQL = `
            UPDATE enderecos SET 
              logradouro = ?, logradouro_sem_acento = ?,
              bairro = ?, bairro_sem_acento = ?,
              cidade = ?, cidade_sem_acento = ?,
              estado = ?, complemento = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE cep = ?
          `;

          db.run(
            updateSQL,
            [
              data.logradouro,
              removeAccents(data.logradouro),
              data.bairro,
              removeAccents(data.bairro),
              data.cidade,
              removeAccents(data.cidade),
              data.estado,
              data.complemento,
              data.cep
            ],
            (err) => {
              if (err) reject(err);
              else resolve('updated');
            }
          );
        } else {
          // Inserir
          const insertSQL = `
            INSERT INTO enderecos (
              cep, logradouro, logradouro_sem_acento,
              bairro, bairro_sem_acento,
              cidade, cidade_sem_acento,
              estado, complemento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(
            insertSQL,
            [
              data.cep,
              data.logradouro,
              removeAccents(data.logradouro),
              data.bairro,
              removeAccents(data.bairro),
              data.cidade,
              removeAccents(data.cidade),
              data.estado,
              data.complemento
            ],
            (err) => {
              if (err) reject(err);
              else resolve('inserted');
            }
          );
        }
      });
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CEP Scraper MCP Server rodando...');
  }
}

// Executar servidor se chamado diretamente
if (require.main === module) {
  const server = new CEPScraperMCPServer();
  server.run().catch(console.error);
}

module.exports = CEPScraperMCPServer;
