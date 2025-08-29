console.log('🚀 Teste simples iniciado');

const { chromium } = require('playwright');

async function testeSimples() {
  console.log('📦 Playwright carregado');
  
  try {
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 2000
    });
    
    console.log('🌐 Browser iniciado');
    
    const page = await browser.newPage();
    console.log('📄 Nova página criada');
    
    await page.goto('https://buscacepintra.correios.com.br/app/localidade/index.php');
    console.log('🔗 Navegou para o site dos Correios');
    
    await page.waitForTimeout(10000); // 10 segundos para ver
    console.log('⏰ Aguardou 10 segundos');
    
    await browser.close();
    console.log('✅ Browser fechado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testeSimples();
