const cron = require('node-cron');
const { getDatabase } = require('../database/init');
const CEPScraper = require('./cep-scraper');

class WeeklyUpdateService {
  constructor() {
    this.scraper = new CEPScraper();
    this.isRunning = false;
    this.lastUpdate = null;
    this.updateStats = {
      totalChecked: 0,
      newFound: 0,
      updated: 0,
      errors: 0
    };
  }

  async getLastUpdateInfo() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          MAX(updated_at) as last_update,
          COUNT(*) as total_records
        FROM enderecos
      `, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getRandomCEPSample(limit = 100) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT cep 
        FROM enderecos 
        ORDER BY RANDOM() 
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.cep));
        }
      });
    });
  }

  async checkForUpdates() {
    if (this.isRunning) {
      console.log('⚠️ Atualização já está em execução');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Iniciando verificação semanal de atualizações...');

    try {
      const lastUpdateInfo = await this.getLastUpdateInfo();
      console.log(`📊 Base atual: ${lastUpdateInfo.total_records} registros`);
      console.log(`📅 Última atualização: ${lastUpdateInfo.last_update || 'Nunca'}`);

      // Reset das estatísticas
      this.updateStats = {
        totalChecked: 0,
        newFound: 0,
        updated: 0,
        errors: 0
      };

      // 1. Verificar uma amostra de CEPs existentes para mudanças
      await this.checkExistingCEPs();

      // 2. Buscar novos CEPs em faixas não exploradas
      await this.searchNewCEPs();

      // 3. Gerar relatório
      await this.generateUpdateReport();

      this.lastUpdate = new Date();
      console.log('✅ Verificação semanal concluída');

    } catch (error) {
      console.error('❌ Erro durante atualização semanal:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async checkExistingCEPs() {
    console.log('🔍 Verificando CEPs existentes para mudanças...');
    
    try {
      const sampleCEPs = await this.getRandomCEPSample(50);
      
      for (const cep of sampleCEPs) {
        try {
          const newData = await this.scraper.fetchCEPData(cep);
          
          if (newData && newData.estado === 'MG') {
            const result = await this.scraper.saveCEPData(newData);
            
            if (result === 'updated') {
              this.updateStats.updated++;
              console.log(`🔄 Atualizado: ${cep}`);
            }
          }
          
          this.updateStats.totalChecked++;
          
        } catch (error) {
          this.updateStats.errors++;
          console.error(`❌ Erro ao verificar ${cep}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Erro ao verificar CEPs existentes:', error);
    }
  }

  async searchNewCEPs() {
    console.log('🔍 Buscando novos CEPs...');
    
    try {
      // Buscar em faixas específicas que podem ter novos CEPs
      const targetRanges = [
        { start: 30100000, end: 30199999 }, // Belo Horizonte
        { start: 31100000, end: 31199999 }, // Contagem
        { start: 32400000, end: 32499999 }, // Juiz de Fora
        { start: 35700000, end: 35799999 }, // Sete Lagoas
        { start: 38400000, end: 38499999 }, // Uberlândia
        { start: 39100000, end: 39199999 }  // Montes Claros
      ];

      for (const range of targetRanges) {
        console.log(`🎯 Verificando faixa ${range.start} - ${range.end}`);
        
        // Verificar alguns CEPs aleatórios nesta faixa
        for (let i = 0; i < 20; i++) {
          const randomCEP = Math.floor(Math.random() * (range.end - range.start)) + range.start;
          const cepStr = randomCEP.toString().padStart(8, '0');
          const formattedCEP = `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
          
          try {
            // Verificar se já existe na base
            const exists = await this.checkCEPExists(formattedCEP);
            
            if (!exists) {
              const newData = await this.scraper.fetchCEPData(formattedCEP);
              
              if (newData && newData.estado === 'MG' && newData.logradouro) {
                await this.scraper.saveCEPData(newData);
                this.updateStats.newFound++;
                console.log(`🆕 Novo CEP encontrado: ${formattedCEP} - ${newData.logradouro}`);
              }
            }
            
            this.updateStats.totalChecked++;
            
          } catch (error) {
            this.updateStats.errors++;
            console.error(`❌ Erro ao buscar ${formattedCEP}:`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar novos CEPs:', error);
    }
  }

  async checkCEPExists(cep) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get('SELECT id FROM enderecos WHERE cep = ?', [cep], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  async generateUpdateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.updateStats,
      summary: `Verificação concluída: ${this.updateStats.totalChecked} CEPs verificados, ${this.updateStats.newFound} novos encontrados, ${this.updateStats.updated} atualizados, ${this.updateStats.errors} erros`
    };

    console.log('\n📋 RELATÓRIO DE ATUALIZAÇÃO SEMANAL');
    console.log('=====================================');
    console.log(`📅 Data: ${report.timestamp}`);
    console.log(`🔍 CEPs verificados: ${report.stats.totalChecked}`);
    console.log(`🆕 Novos encontrados: ${report.stats.newFound}`);
    console.log(`🔄 Atualizados: ${report.stats.updated}`);
    console.log(`❌ Erros: ${report.stats.errors}`);
    console.log('=====================================\n');

    // Salvar relatório em arquivo (opcional)
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logsDir = './logs';
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const reportFile = path.join(logsDir, `update-report-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📄 Relatório salvo em: ${reportFile}`);
      
    } catch (error) {
      console.error('Erro ao salvar relatório:', error.message);
    }
  }

  start() {
    // Executar toda segunda-feira às 2h da manhã
    const schedule = process.env.UPDATE_SCHEDULE || '0 2 * * 1';
    
    console.log(`⏰ Agendamento de atualização semanal configurado: ${schedule}`);
    
    cron.schedule(schedule, () => {
      this.checkForUpdates();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });

    // Executar uma verificação inicial se a base estiver vazia
    this.getLastUpdateInfo().then(info => {
      if (info.total_records === 0) {
        console.log('🚀 Base vazia detectada, executando primeira coleta...');
        setTimeout(() => this.checkForUpdates(), 5000);
      }
    });
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      stats: this.updateStats
    };
  }
}

let updateService;

function startWeeklyUpdate() {
  if (!updateService) {
    updateService = new WeeklyUpdateService();
    updateService.start();
  }
  return updateService;
}

function getUpdateService() {
  return updateService;
}

module.exports = {
  startWeeklyUpdate,
  getUpdateService,
  WeeklyUpdateService
};
