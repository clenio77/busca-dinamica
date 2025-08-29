/* eslint-env node */
const sequelize = require('./connection');
const Endereco = require('../models/endereco');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Instância do banco SQLite para compatibilidade com scripts legados
let sqliteDb = null;

// Função para remover acentos, continua útil
function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

async function importInitialData() {
  // Dados extraídos do HTML existente
  const initialData = [
    { logradouro: 'Rua Belizario Dias', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Boa Viagem', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Educacao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Do Lavrador', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Domingues Alves', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
  ];

  const formattedData = initialData.map(data => ({
    ...data,
    logradouro_sem_acento: removeAccents(data.logradouro),
    bairro_sem_acento: removeAccents(data.bairro),
    cidade_sem_acento: removeAccents(data.cidade),
    estado: 'MG',
  }));

  try {
    await Endereco.bulkCreate(formattedData);
    console.log(`${formattedData.length} registros iniciais importados`);
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
  }
}

async function initDatabase() {
  try {
    // O { force: false } garante que as tabelas não sejam recriadas se já existirem.
    await sequelize.sync({ force: false });
    console.log('Tabela enderecos sincronizada com sucesso');

    // Verificar se há dados, se não, importar dados iniciais
    const count = await Endereco.count();
    if (count === 0) {
      console.log('Importando dados iniciais...');
      await importInitialData();
    } else {
      console.log(`Base de dados já contém ${count} registros`);
    }
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error; // Lança o erro para ser tratado no server.js
  }
}

// Função para obter instância do banco SQLite (compatibilidade com scripts legados)
function getDatabase() {
  if (!sqliteDb) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'ceps.db');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar com SQLite:', err.message);
      }
    });
  }
  return sqliteDb;
}

async function closeDatabase() {
  try {
    await sequelize.close();
    if (sqliteDb) {
      sqliteDb.close();
      sqliteDb = null;
    }
    console.log('Conexão com banco de dados fechada');
  } catch (error) {
    console.error('Erro ao fechar banco de dados:', error);
  }
}

module.exports = {
  initDatabase,
  closeDatabase,
  removeAccents,
  getDatabase,
  sequelize,
};