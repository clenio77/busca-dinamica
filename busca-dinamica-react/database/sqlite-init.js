const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ceps.db');

// Garantir que o diretório existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
      }
    });
  }
  return db;
}

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

async function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    // Criar tabela de endereços
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS enderecos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cep TEXT NOT NULL,
        logradouro TEXT NOT NULL,
        logradouro_sem_acento TEXT NOT NULL,
        bairro TEXT,
        bairro_sem_acento TEXT,
        cidade TEXT NOT NULL,
        cidade_sem_acento TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'MG',
        complemento TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    database.run(createTableSQL, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Criar índices
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_cep ON enderecos(cep)',
        'CREATE INDEX IF NOT EXISTS idx_logradouro_sem_acento ON enderecos(logradouro_sem_acento)',
        'CREATE INDEX IF NOT EXISTS idx_bairro_sem_acento ON enderecos(bairro_sem_acento)',
        'CREATE INDEX IF NOT EXISTS idx_cidade_sem_acento ON enderecos(cidade_sem_acento)'
      ];

      let indexCount = 0;
      indexes.forEach(indexSQL => {
        database.run(indexSQL, (err) => {
          if (err) {
            console.error('Erro ao criar índice:', err);
          }
          indexCount++;
          if (indexCount === indexes.length) {
            console.log('✅ Tabela e índices SQLite criados');
            resolve();
          }
        });
      });
    });
  });
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco de dados:', err.message);
      } else {
        console.log('Conexão com banco de dados fechada');
      }
    });
  }
}

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase,
  removeAccents
};
