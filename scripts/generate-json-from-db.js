const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/ceps.db');
const outputPath = path.resolve(__dirname, '../public/ceps.json');

console.log('Iniciando a geração do arquivo JSON a partir do banco de dados...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados de CEPs.');
});

const sql = `SELECT * FROM enderecos`;

db.all(sql, [], (err, rows) => {
  if (err) {
    console.error('Erro ao buscar dados:', err.message);
    process.exit(1);
  }

  console.log(`Encontrados ${rows.length} registros. Escrevendo em ${outputPath}...`);

  fs.writeFile(outputPath, JSON.stringify(rows, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever o arquivo JSON:', err.message);
      process.exit(1);
    }
    console.log('Arquivo ceps.json gerado com sucesso!');
  });
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  }
  console.log('Conexão com o banco de dados fechada.');
});
