#!/usr/bin/env node

/**
 * Teste simples para verificar se conseguimos acessar o site dos Correios
 */

console.log('🔧 Carregando Playwright...');
const { chromium } = require('playwright');
console.log('✅ Playwright carregado com sucesso');

async function testCorreiosAccess() {
  console.log('🚀 Iniciando teste de acesso ao site dos Correios...');
  
  const browser = await chromium.launch({ 
    headless: false, // Deixar visível para debug
    slowMo: 1000 // Slow motion para ver o que está acontecendo
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  const page = await context.newPage();

  try {
    console.log('📄 Navegando para a página...');
    
    // Navegar para a página de busca por localidade
    await page.goto('https://buscacepintra.correios.com.br/app/localidade/index.php', {
      waitUntil: 'networkidle'
    });

    console.log('✅ Página carregada');

    // Aguardar o select do estado aparecer
    console.log('🔍 Procurando campo UF...');
    await page.waitForSelector('select[name="uf"]', { timeout: 15000 });
    console.log('✅ Campo UF encontrado');

    // Selecionar o estado MG
    console.log('🏛️ Selecionando estado MG...');
    await page.selectOption('select[name="uf"]', 'MG');
    console.log('✅ Estado MG selecionado');
    
    // Aguardar um pouco para a página processar
    await page.waitForTimeout(3000);

    // Verificar se as letras apareceram
    console.log('🔤 Verificando se as letras apareceram...');
    
    const letrasDisponiveis = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      const letras = [];
      
      for (const link of links) {
        const texto = link.textContent?.trim();
        if (texto && texto.length === 1 && /[A-Z]/.test(texto)) {
          letras.push({
            letra: texto,
            href: link.href,
            onclick: link.getAttribute('onclick')
          });
        }
      }
      
      return letras;
    });

    console.log(`📋 Letras encontradas: ${letrasDisponiveis.length}`);
    letrasDisponiveis.forEach(letra => {
      console.log(`  - ${letra.letra}: ${letra.href || letra.onclick}`);
    });

    if (letrasDisponiveis.length > 0) {
      console.log('\n🔤 Testando clique na letra A...');
      
      // Tentar clicar na letra A
      const letraA = letrasDisponiveis.find(l => l.letra === 'A');
      if (letraA) {
        await page.click(`a:has-text("A")`);
        console.log('✅ Clicou na letra A');
        
        // Aguardar resultado
        await page.waitForTimeout(5000);
        
        // Verificar se apareceu alguma tabela
        const tabelas = await page.evaluate(() => {
          const tables = document.querySelectorAll('table');
          const info = [];
          
          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const rows = table.querySelectorAll('tr');
            info.push({
              index: i,
              rows: rows.length,
              firstRowText: rows[0]?.textContent?.trim().substring(0, 100)
            });
          }
          
          return info;
        });
        
        console.log(`📊 Tabelas encontradas após clicar em A: ${tabelas.length}`);
        tabelas.forEach(tabela => {
          console.log(`  - Tabela ${tabela.index}: ${tabela.rows} linhas, primeira linha: "${tabela.firstRowText}"`);
        });
      }
    }

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await browser.close();
  }
}

// Executar o teste
testCorreiosAccess()
  .then(() => {
    console.log('🎉 Teste finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
