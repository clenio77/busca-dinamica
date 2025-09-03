const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Usar PostgreSQL no Render
const cepRoutes = require('./routes/cep-postgres');
const { initDatabase } = require('./database/postgres-init');

// Importar serviços de automação
const { startWeeklyUpdate } = require('./services/weekly-update');
const { UltraConservativeCEPCollector } = require('./scripts/ultra-conservative-collector');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(compression());
app.use(cors());

// Rate limiting mais restritivo para Render
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por IP por janela
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Mover arquivos existentes para public
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/image', express.static(path.join(__dirname, 'image')));

// Rotas da API
app.use('/api/cep', cepRoutes);

// Rota principal - servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check para Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cronEnabled: process.env.DISABLE_CRON !== 'true'
  });
});

// API simplificada para admin (sem autenticação para demo)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { getDatabase } = require('./database/postgres-init');
    const db = await getDatabase();
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT cidade) as cidades,
        COUNT(DISTINCT bairro) as bairros,
        MAX(updated_at) as ultima_atualizacao
      FROM enderecos
    `);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Endpoint para execução manual de cron jobs
app.post('/api/admin/cron/execute', async (req, res) => {
  try {
    const { action, params = {} } = req.body;
    
    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ação não especificada' 
      });
    }

    console.log(`🔄 Executando ação manual: ${action}`);

    switch (action) {
      case 'collect-ceps':
        // Executar coleta de CEPs
        const { startFrom = 38400010, maxCEPs = 10 } = params;
        
        const collector = new UltraConservativeCEPCollector();
        await collector.init();
        
        const results = await collector.collectUltraConservatively(
          parseInt(startFrom),
          Math.min(parseInt(maxCEPs), 50) // Limite máximo de 50
        );
        
        res.json({
          success: true,
          message: 'Coleta manual executada com sucesso',
          results,
          timestamp: new Date().toISOString()
        });
        break;

      case 'weekly-update':
        // Executar atualização semanal
        const { getUpdateService } = require('./services/weekly-update');
        const updateService = getUpdateService();
        
        if (updateService) {
          await updateService.checkForUpdates();
          const status = updateService.getStatus();
          
          res.json({
            success: true,
            message: 'Atualização semanal executada com sucesso',
            status,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Serviço de atualização não disponível'
          });
        }
        break;

      case 'status':
        // Retornar status dos serviços
        const { getUpdateService: getUpdateStatus } = require('./services/weekly-update');
        const updateStatus = getUpdateStatus();
        
        res.json({
          success: true,
          data: {
            cronEnabled: process.env.DISABLE_CRON !== 'true',
            updateService: updateStatus ? updateStatus.getStatus() : null,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
          }
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: `Ação '${action}' não reconhecida. Ações válidas: collect-ceps, weekly-update, status`
        });
    }

  } catch (error) {
    console.error('Erro ao executar ação manual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao executar ação',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
});

// Endpoint para verificar status dos cron jobs
app.get('/api/admin/cron/status', (req, res) => {
  try {
    const { getUpdateService } = require('./services/weekly-update');
    const updateService = getUpdateService();
    
    res.json({
      success: true,
      data: {
        cronEnabled: process.env.DISABLE_CRON !== 'true',
        updateService: updateService ? updateService.getStatus() : null,
        schedules: {
          weeklyUpdate: process.env.UPDATE_SCHEDULE || '0 2 * * 1',
          dailyCollect: process.env.COLLECT_SCHEDULE || '0 6 * * *'
        },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status dos cron jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status'
    });
  }
});

// Endpoint para executar scraper (limitado)
app.post('/api/admin/scraper', async (req, res) => {
  try {
    const { startFrom = 30000000, maxCEPs = 100 } = req.body;
    
    // Limitar para evitar timeout no Render
    const limitedMax = Math.min(parseInt(maxCEPs), 100);
    
    const CEPScraper = require('./services/cep-scraper-postgres');
    const scraper = new CEPScraper();
    
    // Executar em background com timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 25000) // 25s timeout
    );
    
    const scraperPromise = scraper.scrapeMGCEPs({
      startFrom: parseInt(startFrom),
      maxCEPs: limitedMax
    });
    
    Promise.race([scraperPromise, timeoutPromise])
      .then(result => {
        console.log('Scraper concluído:', result);
      })
      .catch(error => {
        console.log('Scraper interrompido:', error.message);
      });

    res.json({
      success: true,
      message: `Scraper iniciado (máx: ${limitedMax} CEPs)`,
      note: 'Processo limitado para ambiente Render'
    });

  } catch (error) {
    console.error('Erro ao iniciar scraper:', error);
    res.status(500).json({ success: false, message: 'Erro ao iniciar scraper' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor Render...');
    
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL não configurada. Usando SQLite local para desenvolvimento.');
      // Fallback para SQLite em desenvolvimento
      const { initDatabase: initSQLite } = require('./database/init');
      const cepRoutesSQLite = require('./routes/cep');
      app.use('/api/cep', cepRoutesSQLite);
      await initSQLite();
    } else {
      // Usar PostgreSQL no Render
      await initDatabase();
      console.log('✅ PostgreSQL inicializado');
    }

    // Inicializar cron jobs se habilitados
    if (process.env.DISABLE_CRON !== 'true') {
      console.log('⏰ Inicializando cron jobs...');
      
      try {
        // Iniciar serviço de atualização semanal
        const updateService = startWeeklyUpdate();
        console.log('✅ Serviço de atualização semanal iniciado');
        
        // Configurar cron jobs locais como fallback
        const cron = require('node-cron');
        
        // Cron job para coleta diária (6h da manhã)
        const collectSchedule = process.env.COLLECT_SCHEDULE || '0 6 * * *';
        cron.schedule(collectSchedule, async () => {
          console.log('🔄 Executando coleta diária automática...');
          try {
            const collector = new UltraConservativeCEPCollector();
            await collector.init();
            
            const results = await collector.collectUltraConservatively(
              38400010, // CEP inicial (Uberlândia)
              10        // Máximo de 10 CEPs por execução
            );
            
            console.log('✅ Coleta diária concluída:', results);
          } catch (error) {
            console.error('❌ Erro na coleta diária:', error);
          }
        }, {
          scheduled: true,
          timezone: "America/Sao_Paulo"
        });
        
        console.log(`✅ Cron job de coleta configurado: ${collectSchedule}`);
        
      } catch (error) {
        console.error('⚠️ Erro ao inicializar cron jobs:', error);
        console.log('ℹ️ Cron jobs desabilitados, mas endpoints manuais funcionam');
      }
    } else {
      console.log('ℹ️ Cron jobs desabilitados por configuração');
    }

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Busca CEP: http://localhost:${PORT}`);
      console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
      console.log(`⏰ Cron jobs: ${process.env.DISABLE_CRON !== 'true' ? 'Habilitados' : 'Desabilitados'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor...');
  try {
    if (process.env.DATABASE_URL) {
      const { closeDatabase } = require('./database/postgres-init');
      await closeDatabase();
    }
    process.exit(0);
  } catch (error) {
    console.error('Erro durante shutdown:', error);
    process.exit(1);
  }
});

startServer();
