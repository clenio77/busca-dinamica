/**
 * Vercel Cron Job - Coleta Diária de CEPs
 * Executa todos os dias às 6h da manhã
 */

const { UltraConservativeCEPCollector } = require('../../scripts/ultra-conservative-collector');

export default async function handler(req, res) {
  // Verificar se é uma requisição de cron do Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Iniciando coleta diária via Vercel Cron...');
  
  try {
    const collector = new UltraConservativeCEPCollector();
    await collector.init();

    // Coleta conservadora: 10 CEPs por execução
    const results = await collector.collectUltraConservatively(
      38400000, // CEP inicial (Uberlândia)
      10        // Máximo de CEPs por execução
    );

    console.log('✅ Coleta diária concluída via Vercel');
    
    return res.status(200).json({
      success: true,
      message: 'Coleta diária executada com sucesso',
      timestamp: new Date().toISOString(),
      results: {
        collected: results.collected || 0,
        processed: results.processed || 0,
        errors: results.errors || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro durante coleta diária:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
