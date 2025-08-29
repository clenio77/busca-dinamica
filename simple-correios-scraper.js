#!/usr/bin/env node

/**
 * Scraper simples para o site dos Correios usando Playwright
 * Integra com o banco de dados SQLite existente
 */

const { chromium } = require('playwright');

// Função simples para remover acentos
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

class CorreiosScraper {
  constructor() {
    this.delay = 3000; // 3 segundos entre requisições
    this.db = null;
  }

  async init() {
    // Por enquanto, apenas log - sem banco de dados
    console.log('✅ Scraper inicializado (modo teste - sem banco de dados)');
  }

  async scrapeCEP(cep) {
    const browser = await chromium.launch({ 
      headless: false, // Deixar visível para debug
      slowMo: 1000 // Slow motion para ver o que está acontecendo
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();

    try {
      console.log(`🔍 Buscando CEP: ${cep}`);
      
      // Navegar para o site dos Correios
      await page.goto('https://buscacepintra.correios.com.br/app/endereco/index.php', {
        waitUntil: 'networkidle'
      });

      // Aguardar o campo de entrada aparecer
      await page.waitForSelector('input[name="endereco"]', { timeout: 10000 });

      // Preencher o CEP
      await page.fill('input[name="endereco"]', cep);

      // Aguardar um pouco antes de clicar
      await page.waitForTimeout(1000);

      // Tentar diferentes seletores para o botão
      try {
        await page.click('input[value="Pesquisar"]');
      } catch (error) {
        console.log('Tentando seletor alternativo para o botão...');
        await page.click('input[type="submit"]');
      }

      // Aguardar resultado
      await page.waitForTimeout(5000);

      // Extrair dados da página de resultado
      const cepData = await page.evaluate(() => {
        const result = {};

        // Procurar por tabelas com dados
        const tables = document.querySelectorAll('table');
        
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const label = cells[0]?.textContent?.trim();
              const value = cells[1]?.textContent?.trim();

              if (label && value) {
                if (label.toLowerCase().includes('logradouro')) {
                  result.logradouro = value;
                }
                if (label.toLowerCase().includes('bairro')) {
                  result.bairro = value;
                }
                if (label.toLowerCase().includes('localidade')) {
                  result.cidade = value;
                }
                if (label.toLowerCase().includes('cep')) {
                  result.cep = value;
                }
              }
            }
          }
        }

        // Também tentar extrair de divs ou outros elementos
        const allText = document.body.textContent;
        console.log('Texto da página:', allText.substring(0, 500));

        return result;
      });

      console.log('📋 Dados extraídos:', cepData);

      if (cepData.logradouro && cepData.cidade) {
        // Por enquanto, apenas log dos dados encontrados
        const dadosCompletos = {
          cep: cep,
          logradouro: cepData.logradouro,
          bairro: cepData.bairro || '',
          cidade: cepData.cidade,
          estado: 'MG',
          complemento: ''
        };

        console.log('✅ Dados encontrados:', JSON.stringify(dadosCompletos, null, 2));
        return cepData;
      } else {
        console.log('❌ CEP não encontrado ou dados incompletos');
        return null;
      }

    } catch (error) {
      console.error(`❌ Erro ao processar CEP ${cep}:`, error.message);
      return null;
    } finally {
      await browser.close();
    }
  }

  // Função removida temporariamente - sem banco de dados para teste

  async scrapeCEPRange(startCep, endCep, maxResults = 10) {
    await this.init();
    
    const results = [];
    let processed = 0;
    let found = 0;

    // Converter CEPs para números
    const startNum = parseInt(startCep.replace('-', ''));
    const endNum = parseInt(endCep.replace('-', ''));

    console.log(`🚀 Iniciando scraping de ${startCep} até ${endCep} (máximo ${maxResults} resultados)`);

    for (let cepNum = startNum; cepNum <= endNum && processed < maxResults; cepNum++) {
      const cepStr = cepNum.toString().padStart(8, '0');
      const formattedCep = `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;

      const result = await this.scrapeCEP(formattedCep);
      
      if (result) {
        results.push(result);
        found++;
      }

      processed++;

      // Delay entre requisições
      if (processed < maxResults) {
        console.log(`⏳ Aguardando ${this.delay}ms antes da próxima requisição...`);
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    console.log(`\n🎉 Scraping concluído! Processados: ${processed}, Encontrados: ${found}`);
    return { processed, found, results };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🚀 Iniciando teste do scraper...');

  const scraper = new CorreiosScraper();

  // Testar com alguns CEPs de Uberlândia
  scraper.scrapeCEPRange('38400-000', '38400-005', 3)
    .then(result => {
      console.log('\n📊 Resultado final:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro:', error);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });
}

module.exports = CorreiosScraper;
