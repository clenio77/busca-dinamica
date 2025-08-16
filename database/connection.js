// database/connection.js
const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'ceps.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Mude para console.log para ver as queries SQL
});

module.exports = sequelize;
