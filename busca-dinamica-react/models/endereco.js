// models/endereco.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Endereco = sequelize.define('Endereco', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cep: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logradouro: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logradouro_sem_acento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bairro: {
    type: DataTypes.STRING,
  },
  bairro_sem_acento: {
    type: DataTypes.STRING,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cidade_sem_acento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'MG',
  },
  complemento: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'enderecos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Endereco;
