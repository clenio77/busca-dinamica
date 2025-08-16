const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { getBackupService } = require('../services/backup-service');
const { getUpdateService } = require('../services/weekly-update');
const CEPScraper = require('../services/cep-scraper');

// Middleware de autenticação simples (em produção, usar algo mais robusto)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const validToken = process.env.ADMIN_TOKEN || 'admin123';
  
  if (!authHeader || authHeader !== `Bearer ${validToken}`) {
    return res.status(401).json({ error: 'Acesso negado' });
  }
  
  next();
};

// Estatísticas detalhadas
router.get('/stats/detailed', adminAuth, async (req, res) => {
  try {
    const db = getDatabase();
    
    // Estatísticas básicas
    const basicStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT cidade) as cidades,
          COUNT(DISTINCT bairro) as bairros,
          MIN(created_at) as primeira_importacao,
          MAX(updated_at) as ultima_atualizacao
        FROM enderecos
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Top 10 cidades
    const topCidades = await new Promise((resolve, reject) => {
      db.all(`
        SELECT cidade, COUNT(*) as total
        FROM enderecos 
        GROUP BY cidade 
        ORDER BY total DESC 
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Estatísticas por faixa de CEP
    const cepRanges = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          SUBSTR(cep, 1, 2) as faixa,
          COUNT(*) as total
        FROM enderecos 
        GROUP BY SUBSTR(cep, 1, 2)
        ORDER BY faixa
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Status dos serviços
    const updateService = getUpdateService();
    const backupService = getBackupService();
    
    const serviceStatus = {
      updateService: updateService ? updateService.getStatus() : null,
      backupStats: backupService ? backupService.getBackupStats() : null
    };

    res.json({
      success: true,
      data: {
        basic: basicStats,
        topCidades,
        cepRanges,
        services: serviceStatus
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Executar scraper
router.post('/scraper/run', adminAuth, async (req, res) => {
  try {
    const { startFrom = 30000000, maxCEPs = 1000 } = req.body;
    
    const scraper = new CEPScraper();
    
    // Executar em background
    scraper.scrapeMGCEPs({
      startFrom: parseInt(startFrom),
      maxCEPs: parseInt(maxCEPs),
      onProgress: (progress) => {
        // Em uma implementação real, usaria WebSockets para progresso em tempo real
        console.log(`Progresso: ${progress.processed}/${maxCEPs}`);
      }
    }).then(result => {
      console.log('Scraper concluído:', result);
    }).catch(error => {
      console.error('Erro no scraper:', error);
    });

    res.json({
      success: true,
      message: 'Scraper iniciado em background',
      config: { startFrom, maxCEPs }
    });

  } catch (error) {
    console.error('Erro ao iniciar scraper:', error);
    res.status(500).json({ success: false, message: 'Erro ao iniciar scraper' });
  }
});

// Executar atualização manual
router.post('/update/run', adminAuth, async (req, res) => {
  try {
    const updateService = getUpdateService();
    
    if (!updateService) {
      return res.status(500).json({ 
        success: false, 
        message: 'Serviço de atualização não disponível' 
      });
    }

    // Executar em background
    updateService.checkForUpdates().then(() => {
      console.log('Atualização manual concluída');
    }).catch(error => {
      console.error('Erro na atualização manual:', error);
    });

    res.json({
      success: true,
      message: 'Atualização iniciada em background'
    });

  } catch (error) {
    console.error('Erro ao iniciar atualização:', error);
    res.status(500).json({ success: false, message: 'Erro ao iniciar atualização' });
  }
});

// Criar backup manual
router.post('/backup/create', adminAuth, async (req, res) => {
  try {
    const backupService = getBackupService();
    
    if (!backupService) {
      return res.status(500).json({ 
        success: false, 
        message: 'Serviço de backup não disponível' 
      });
    }

    const backupFile = await backupService.createBackup();

    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      file: backupFile
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar backup' });
  }
});

// Listar backups
router.get('/backup/list', adminAuth, async (req, res) => {
  try {
    const backupService = getBackupService();
    
    if (!backupService) {
      return res.status(500).json({ 
        success: false, 
        message: 'Serviço de backup não disponível' 
      });
    }

    const backups = backupService.listBackups();

    res.json({
      success: true,
      data: backups
    });

  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar backups' });
  }
});

// Logs do sistema
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const logFile = process.env.LOG_FILE || './logs/app.log';
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8');
      const lines = logs.split('\n').slice(-100); // Últimas 100 linhas
      
      res.json({
        success: true,
        data: lines.filter(line => line.trim())
      });
    } else {
      res.json({
        success: true,
        data: ['Arquivo de log não encontrado']
      });
    }

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar logs' });
  }
});

// Exportar dados
router.get('/export/:format', adminAuth, async (req, res) => {
  try {
    const { format } = req.params;
    const { limit = 10000 } = req.query;
    
    const db = getDatabase();
    
    const data = await new Promise((resolve, reject) => {
      db.all(`
        SELECT cep, logradouro, bairro, cidade, estado, complemento
        FROM enderecos 
        ORDER BY cidade, logradouro
        LIMIT ?
      `, [parseInt(limit)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=enderecos.json');
      res.json(data);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=enderecos.csv');
      
      const csv = [
        'CEP,Logradouro,Bairro,Cidade,Estado,Complemento',
        ...data.map(row => 
          `"${row.cep}","${row.logradouro}","${row.bairro}","${row.cidade}","${row.estado}","${row.complemento || ''}"`
        )
      ].join('\n');
      
      res.send(csv);
    } else {
      res.status(400).json({ success: false, message: 'Formato não suportado' });
    }

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ success: false, message: 'Erro ao exportar dados' });
  }
});

module.exports = router;
