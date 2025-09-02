#!/usr/bin/env node

/**
 * Script para verificar status da coleta de CEPs
 * Mostra estatísticas e progresso atual
 */

const { getDatabase } = require('../database/sqlite-init');
const fs = require('fs');
const path = require('path');

class CollectionStatusChecker {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = getDatabase();
  }

  async getCityStatistics() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          cidade,
          COUNT(*) as total_ceps,
          COUNT(CASE WHEN logradouro != '' THEN 1 END) as ceps_with_street,
          MIN(created_at) as first_added,
          MAX(updated_at) as last_updated
        FROM enderecos 
        GROUP BY cidade 
        ORDER BY total_ceps DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getRecentActivity(days = 7) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as ceps_added,
          COUNT(DISTINCT cidade) as cities_found
        FROM enderecos 
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getCEPRangeProgress() {
    const ranges = [
      { name: 'Uberlândia', start: '38400-000', end: '38499-999' },
      { name: 'Araguari', start: '38440-000', end: '38449-999' },
      { name: 'Patos de Minas', start: '38700-000', end: '38799-999' },
      { name: 'Ituiutaba', start: '38300-000', end: '38399-999' }
    ];

    const progress = [];

    for (const range of ranges) {
      const result = await new Promise((resolve, reject) => {
        this.db.get(`
          SELECT 
            COUNT(*) as found_ceps,
            MIN(cep) as first_cep,
            MAX(cep) as last_cep
          FROM enderecos 
          WHERE cep >= ? AND cep <= ?
        `, [range.start, range.end], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Calcular progresso estimado
      const startNum = parseInt(range.start.replace('-', ''));
      const endNum = parseInt(range.end.replace('-', ''));
      const totalPossible = endNum - startNum + 1;
      const progressPercent = ((result.found_ceps / totalPossible) * 100).toFixed(2);

      progress.push({
        ...range,
        ...result,
        total_possible: totalPossible,
        progress_percent: progressPercent
      });
    }

    return progress;
  }

  async getSystemInfo() {
    const dbPath = path.join(process.cwd(), 'database', 'ceps.db');
    const jsonPath = path.join(process.cwd(), 'public', 'ceps.json');
    
    const info = {
      database_exists: fs.existsSync(dbPath),
      json_exists: fs.existsSync(jsonPath),
      database_size: 0,
      json_size: 0,
      last_json_update: null
    };

    if (info.database_exists) {
      const dbStats = fs.statSync(dbPath);
      info.database_size = (dbStats.size / 1024 / 1024).toFixed(2); // MB
    }

    if (info.json_exists) {
      const jsonStats = fs.statSync(jsonPath);
      info.json_size = (jsonStats.size / 1024 / 1024).toFixed(2); // MB
      info.last_json_update = jsonStats.mtime.toISOString();
    }

    return info;
  }

  async checkLogFiles() {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFiles = [];

    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        logFiles.push({
          name: file,
          size: (stats.size / 1024).toFixed(2), // KB
          modified: stats.mtime.toISOString(),
          lines: this.countLines(filePath)
        });
      }
    }

    return logFiles;
  }

  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  }

  async generateReport() {
    console.log('📊 RELATÓRIO DE STATUS DA COLETA DE CEPs\n');
    console.log('=' .repeat(60));

    // Informações do sistema
    const systemInfo = await this.getSystemInfo();
    console.log('\n🔧 INFORMAÇÕES DO SISTEMA:');
    console.log(`   Database: ${systemInfo.database_exists ? '✅' : '❌'} (${systemInfo.database_size} MB)`);
    console.log(`   JSON público: ${systemInfo.json_exists ? '✅' : '❌'} (${systemInfo.json_size} MB)`);
    console.log(`   Última atualização JSON: ${this.formatDate(systemInfo.last_json_update)}`);

    // Estatísticas por cidade
    const cityStats = await this.getCityStatistics();
    console.log('\n🏙️  ESTATÍSTICAS POR CIDADE:');
    cityStats.forEach(city => {
      const completeness = ((city.ceps_with_street / city.total_ceps) * 100).toFixed(1);
      console.log(`   ${city.cidade}:`);
      console.log(`      Total: ${city.total_ceps} CEPs`);
      console.log(`      Com logradouro: ${city.ceps_with_street} (${completeness}%)`);
      console.log(`      Primeira adição: ${this.formatDate(city.first_added)}`);
      console.log(`      Última atualização: ${this.formatDate(city.last_updated)}`);
      console.log('');
    });

    // Progresso por faixa de CEP
    const rangeProgress = await this.getCEPRangeProgress();
    console.log('\n📈 PROGRESSO POR FAIXA DE CEP:');
    rangeProgress.forEach(range => {
      console.log(`   ${range.name} (${range.start} - ${range.end}):`);
      console.log(`      Encontrados: ${range.found_ceps} de ~${range.total_possible} possíveis`);
      console.log(`      Progresso: ${range.progress_percent}%`);
      console.log(`      Primeiro CEP: ${range.first_cep || 'N/A'}`);
      console.log(`      Último CEP: ${range.last_cep || 'N/A'}`);
      console.log('');
    });

    // Atividade recente
    const recentActivity = await this.getRecentActivity(7);
    console.log('\n📅 ATIVIDADE DOS ÚLTIMOS 7 DIAS:');
    if (recentActivity.length > 0) {
      recentActivity.forEach(day => {
        console.log(`   ${day.date}: ${day.ceps_added} CEPs adicionados (${day.cities_found} cidades)`);
      });
    } else {
      console.log('   Nenhuma atividade recente');
    }

    // Logs
    const logFiles = await this.checkLogFiles();
    console.log('\n📋 ARQUIVOS DE LOG:');
    if (logFiles.length > 0) {
      logFiles.forEach(log => {
        console.log(`   ${log.name}: ${log.size} KB, ${log.lines} linhas`);
        console.log(`      Modificado: ${this.formatDate(log.modified)}`);
      });
    } else {
      console.log('   Nenhum arquivo de log encontrado');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Relatório gerado em:', new Date().toLocaleString('pt-BR'));
  }
}

async function main() {
  const checker = new CollectionStatusChecker();
  
  try {
    await checker.init();
    await checker.generateReport();
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CollectionStatusChecker };
