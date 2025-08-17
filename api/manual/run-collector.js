/**
 * Endpoint Manual para Execução de Scripts de Coleta
 * Permite executar scripts manualmente via API
 */

const { UltraConservativeCEPCollector } = require('../../scripts/ultra-conservative-collector');
const { WeeklyUpdateService } = require('../../services/weekly-update');
const { initDatabase } = require('../../database/init');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, params = {} } = req.body;

  // Verificar autenticação (opcional - adicione sua própria lógica)
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (authToken !== process.env.MANUAL_EXECUTION_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log(`🔄 Executando ação manual: ${action}`);

  try {
    await initDatabase();
    let result;

    switch (action) {
      case 'ultra-collect':
        const collector = new UltraConservativeCEPCollector();
        await collector.init();
        result = await collector.collectUltraConservatively(
          params.startCep || 38400000,
          params.maxCeps || 20
        );
        break;

      case 'weekly-update':
        const updateService = new WeeklyUpdateService();
        await updateService.checkForUpdates();
        result = updateService.getStatus();
        break;

      case 'generate-json':
        // Importar e executar geração de JSON
        const { generateJSONFromDB } = require('../../scripts/generate-json-from-db');
        result = await generateJSONFromDB();
        break;

      default:
        return res.status(400).json({ 
          error: 'Ação inválida',
          availableActions: ['ultra-collect', 'weekly-update', 'generate-json']
        });
    }

    return res.status(200).json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Erro ao executar ${action}:`, error);
    
    return res.status(500).json({
      success: false,
      action,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
