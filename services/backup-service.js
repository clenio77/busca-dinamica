const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { getDatabase } = require('../database/init');

class BackupService {
  constructor() {
    this.backupDir = './backups';
    this.maxBackups = 7; // Manter 7 backups
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.db`);
      
      // Copiar arquivo do banco
      const dbPath = process.env.DB_PATH || './database/ceps.db';
      
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupFile);
        console.log(`✅ Backup criado: ${backupFile}`);
        
        // Criar backup em JSON também
        await this.createJSONBackup(timestamp);
        
        // Limpar backups antigos
        this.cleanOldBackups();
        
        return backupFile;
      } else {
        throw new Error('Arquivo de banco não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  async createJSONBackup(timestamp) {
    try {
      const db = getDatabase();
      const jsonFile = path.join(this.backupDir, `backup-${timestamp}.json`);
      
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM enderecos ORDER BY id', (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          const backup = {
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            total_records: rows.length,
            data: rows
          };
          
          fs.writeFileSync(jsonFile, JSON.stringify(backup, null, 2));
          console.log(`✅ Backup JSON criado: ${jsonFile}`);
          resolve(jsonFile);
        });
      });
    } catch (error) {
      console.error('❌ Erro ao criar backup JSON:', error);
    }
  }

  cleanOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Remover backups excedentes
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          // Remover JSON correspondente
          const jsonFile = file.path.replace('.db', '.json');
          if (fs.existsSync(jsonFile)) {
            fs.unlinkSync(jsonFile);
          }
          console.log(`🗑️ Backup antigo removido: ${file.name}`);
        });
      }
    } catch (error) {
      console.error('❌ Erro ao limpar backups antigos:', error);
    }
  }

  async restoreBackup(backupFile) {
    try {
      const dbPath = process.env.DB_PATH || './database/ceps.db';
      
      if (!fs.existsSync(backupFile)) {
        throw new Error('Arquivo de backup não encontrado');
      }
      
      // Criar backup do estado atual antes de restaurar
      await this.createBackup();
      
      // Restaurar backup
      fs.copyFileSync(backupFile, dbPath);
      console.log(`✅ Backup restaurado: ${backupFile}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            sizeFormatted: this.formatBytes(stats.size)
          };
        })
        .sort((a, b) => b.created - a.created);

      return files;
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      return [];
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  startScheduledBackups() {
    // Backup diário às 3h da manhã
    cron.schedule('0 3 * * *', () => {
      console.log('🔄 Iniciando backup automático...');
      this.createBackup();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });

    console.log('⏰ Backup automático agendado para 3h da manhã');
  }

  getBackupStats() {
    const backups = this.listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      total: backups.length,
      totalSize: this.formatBytes(totalSize),
      latest: backups.length > 0 ? backups[0].created : null,
      oldest: backups.length > 0 ? backups[backups.length - 1].created : null
    };
  }
}

let backupService;

function startBackupService() {
  if (!backupService) {
    backupService = new BackupService();
    backupService.startScheduledBackups();
  }
  return backupService;
}

function getBackupService() {
  return backupService;
}

module.exports = {
  startBackupService,
  getBackupService,
  BackupService
};
