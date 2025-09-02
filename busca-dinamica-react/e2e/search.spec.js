const { test, expect } = require('@playwright/test');

test.describe('Busca Dinâmica E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('deve carregar a página inicial corretamente', async ({ page }) => {
    // Verificar título
    await expect(page).toHaveTitle(/Busca Dinâmica/);
    
    // Verificar elementos principais
    await expect(page.locator('h1')).toContainText('Busca Dinâmica 2.0');
    await expect(page.locator('input[placeholder*="buscar"]')).toBeVisible();
    
    // Verificar que não há resultados inicialmente
    await expect(page.locator('text=resultados encontrados')).not.toBeVisible();
  });

  test('deve realizar busca e mostrar resultados', async ({ page }) => {
    // Digitar termo de busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    
    // Aguardar resultados
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que há resultados
    const resultsText = await page.locator('text=resultados encontrados').textContent();
    expect(resultsText).toMatch(/\d+ resultados encontrados/);
    
    // Verificar que os resultados contêm o termo buscado
    const firstResult = await page.locator('.address-item').first();
    await expect(firstResult).toContainText('rua', { ignoreCase: true });
  });

  test('deve filtrar por cidade', async ({ page }) => {
    // Selecionar cidade
    await page.selectOption('select[name="cidade"]', 'São Paulo');
    
    // Digitar termo de busca
    await page.fill('input[placeholder*="buscar"]', 'avenida');
    
    // Aguardar resultados
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que todos os resultados são de São Paulo
    const results = await page.locator('.address-item').all();
    for (const result of results) {
      await expect(result).toContainText('São Paulo');
    }
  });

  test('deve filtrar por estado', async ({ page }) => {
    // Selecionar estado
    await page.selectOption('select[name="estado"]', 'SP');
    
    // Digitar termo de busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    
    // Aguardar resultados
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que todos os resultados são do estado SP
    const results = await page.locator('.address-item').all();
    for (const result of results) {
      await expect(result).toContainText('SP');
    }
  });

  test('deve mostrar mensagem para busca muito curta', async ({ page }) => {
    // Digitar termo muito curto
    await page.fill('input[placeholder*="buscar"]', 'a');
    
    // Verificar mensagem de erro
    await expect(page.locator('text=Digite pelo menos 2 caracteres')).toBeVisible();
  });

  test('deve copiar endereço para clipboard', async ({ page }) => {
    // Realizar busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Clicar no botão de copiar do primeiro resultado
    const copyButton = await page.locator('.address-item button[title*="copiar"]').first();
    await copyButton.click();
    
    // Verificar toast de sucesso
    await expect(page.locator('text=Endereço copiado')).toBeVisible();
  });

  test('deve alternar tema escuro/claro', async ({ page }) => {
    // Verificar tema inicial (claro)
    await expect(page.locator('body')).not.toHaveAttribute('data-theme', 'dark');
    
    // Clicar no botão de alternar tema
    const themeButton = await page.locator('button[title*="tema"]');
    await themeButton.click();
    
    // Verificar que mudou para tema escuro
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
    
    // Clicar novamente para voltar ao tema claro
    await themeButton.click();
    await expect(page.locator('body')).not.toHaveAttribute('data-theme', 'dark');
  });

  test('deve funcionar em dispositivos móveis', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que a interface móvel está sendo usada
    await expect(page.locator('.mobile-header')).toBeVisible();
    
    // Realizar busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que os resultados são responsivos
    await expect(page.locator('.address-item')).toBeVisible();
  });

  test('deve mostrar loading durante busca', async ({ page }) => {
    // Interceptar requisição para simular delay
    await page.route('**/api/cep/search', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              cep: '12345678',
              logradouro: 'Rua Teste',
              bairro: 'Centro',
              cidade: 'São Paulo',
              estado: 'SP'
            }
          ]
        })
      });
    });
    
    // Digitar termo de busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    
    // Verificar que o loading aparece
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // Aguardar resultados
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que o loading desapareceu
    await expect(page.locator('.loading-spinner')).not.toBeVisible();
  });

  test('deve lidar com erros de rede', async ({ page }) => {
    // Interceptar requisição para simular erro
    await page.route('**/api/cep/search', route => {
      route.abort('failed');
    });
    
    // Digitar termo de busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    
    // Verificar mensagem de erro
    await expect(page.locator('text=Erro ao buscar')).toBeVisible();
  });

  test('deve manter histórico de buscas', async ({ page }) => {
    // Realizar primeira busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Limpar busca
    await page.fill('input[placeholder*="buscar"]', '');
    
    // Realizar segunda busca
    await page.fill('input[placeholder*="buscar"]', 'avenida');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Verificar que o histórico foi mantido (se implementado)
    // Este teste pode ser expandido quando o histórico for implementado
  });

  test('deve exportar resultados', async ({ page }) => {
    // Realizar busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Clicar no botão de exportar
    const exportButton = await page.locator('button[title*="exportar"]');
    await exportButton.click();
    
    // Verificar que o menu de exportação aparece
    await expect(page.locator('text=Exportar CSV')).toBeVisible();
    await expect(page.locator('text=Exportar JSON')).toBeVisible();
  });

  test('deve compartilhar endereço', async ({ page }) => {
    // Realizar busca
    await page.fill('input[placeholder*="buscar"]', 'rua');
    await page.waitForSelector('text=resultados encontrados', { timeout: 10000 });
    
    // Clicar no botão de compartilhar do primeiro resultado
    const shareButton = await page.locator('.address-item button[title*="compartilhar"]').first();
    await shareButton.click();
    
    // Verificar que o menu de compartilhamento aparece
    await expect(page.locator('text=WhatsApp')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
  });
});
