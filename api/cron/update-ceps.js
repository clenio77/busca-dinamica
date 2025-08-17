/**
 * Vercel Cron Job - Atualização Semanal de CEPs
 * Executa toda segunda-feira às 2h da manhã
 */

const { initDatabase } = require('../../database/init');
const { WeeklyUpdateService } = require('../../services/weekly-update');

export default async function handler(req, res) {
  // Verificar se é uma requisição de cron do Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Iniciando atualização semanal via Vercel Cron...');
  
  try {
    // Inicializar banco de dados
    await initDatabase();
    console.log('✅ Banco de dados inicializado');

    // Criar e executar serviço de atualização
    const updateService = new WeeklyUpdateService();
    await updateService.checkForUpdates();

    const status = updateService.getStatus();
    
    console.log('✅ Atualização semanal concluída via Vercel');
    
    return res.status(200).json({
      success: true,
      message: 'Atualização semanal executada com sucesso',
      timestamp: new Date().toISOString(),
      stats: status.stats
    });

  } catch (error) {
    console.error('❌ Erro durante atualização semanal:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
