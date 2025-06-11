const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/ceps.db';

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
      } else {
        console.log('Conectado ao banco de dados SQLite');
      }
    });
  }
  return db;
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
        console.error('Erro ao criar tabela:', err.message);
        reject(err);
      } else {
        console.log('Tabela enderecos criada/verificada com sucesso');
        
        // Criar índices para melhor performance
        createIndexes(database)
          .then(() => {
            // Verificar se há dados, se não, importar dados existentes
            checkAndImportInitialData(database)
              .then(() => resolve())
              .catch(reject);
          })
          .catch(reject);
      }
    });
  });
}

async function createIndexes(database) {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cep ON enderecos(cep)',
      'CREATE INDEX IF NOT EXISTS idx_logradouro_sem_acento ON enderecos(logradouro_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_bairro_sem_acento ON enderecos(bairro_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_cidade_sem_acento ON enderecos(cidade_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_search ON enderecos(logradouro_sem_acento, bairro_sem_acento, cidade_sem_acento)'
    ];

    let completed = 0;
    indexes.forEach(indexSQL => {
      database.run(indexSQL, (err) => {
        if (err) {
          console.error('Erro ao criar índice:', err.message);
          reject(err);
        } else {
          completed++;
          if (completed === indexes.length) {
            console.log('Índices criados com sucesso');
            resolve();
          }
        }
      });
    });
  });
}

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

async function checkAndImportInitialData(database) {
  return new Promise((resolve, reject) => {
    // Verificar se já existem dados
    database.get('SELECT COUNT(*) as count FROM enderecos', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('Importando dados iniciais...');
        importInitialData(database)
          .then(() => resolve())
          .catch(reject);
      } else {
        console.log(`Base de dados já contém ${row.count} registros`);
        resolve();
      }
    });
  });
}

async function importInitialData(database) {
  // Dados extraídos do HTML existente
  const initialData = [
    { logradouro: 'Rua Belizario Dias', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Boa Viagem', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Educacao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Do Lavrador', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Domingues Alves', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    // Adicionar mais dados conforme necessário...
  ];

  return new Promise((resolve, reject) => {
    const stmt = database.prepare(`
      INSERT INTO enderecos (
        cep, logradouro, logradouro_sem_acento, 
        bairro, bairro_sem_acento, 
        cidade, cidade_sem_acento, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    initialData.forEach(data => {
      stmt.run([
        data.cep,
        data.logradouro,
        removeAccents(data.logradouro),
        data.bairro,
        removeAccents(data.bairro),
        data.cidade,
        removeAccents(data.cidade),
        'MG'
      ], (err) => {
        if (err) {
          console.error('Erro ao inserir dados iniciais:', err.message);
        }
        completed++;
        if (completed === initialData.length) {
          stmt.finalize();
          console.log(`${initialData.length} registros iniciais importados`);
          resolve();
        }
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
