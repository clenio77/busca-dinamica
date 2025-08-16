const express = require('express');
const { Op } = require('sequelize');
const { query, validationResult } = require('express-validator');
const Endereco = require('../models/endereco');
const { removeAccents } = require('../database/init');
const sequelize = require('../database/connection');

const router = express.Router();

// Função wrapper para tratar erros em rotas assíncronas
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Regras de validação para a rota de busca
const searchValidationRules = [
  query('q')
    .isString().withMessage('Query deve ser um texto')
    .trim()
    .isLength({ min: 2 }).withMessage('Query deve ter pelo menos 2 caracteres'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser um número entre 1 e 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset deve ser um número positivo')
    .toInt(),
];

// Rota de busca
router.get('/search', searchValidationRules, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { q, limit = 50, offset = 0 } = req.query;

  const searchTerm = removeAccents(q);
  const searchPattern = `%${searchTerm}%`;

  const { count, rows } = await Endereco.findAndCountAll({
    where: {
      [Op.or]: [
        { logradouro_sem_acento: { [Op.like]: searchPattern } },
        { bairro_sem_acento: { [Op.like]: searchPattern } },
        { cidade_sem_acento: { [Op.like]: searchPattern } },
        { cep: { [Op.like]: searchPattern } },
      ],
    },
    order: [
      ['logradouro', 'ASC']
    ],
    limit: limit,
    offset: offset,
  });

  const formattedRows = rows.map(endereco => ({
    street: endereco.logradouro,
    neighborhood: endereco.bairro,
    city: endereco.cidade,
    state: endereco.estado,
    cep: endereco.cep,
    complement: endereco.complemento,
  }));

  res.json({
    success: true,
    data: formattedRows,
    total: count,
    query: q,
  });
}));

// Rota por CEP específico
router.get('/:cep', asyncHandler(async (req, res) => {
  const { cep } = req.params;
  const cepPattern = /^\d{5}-?\d{3}$/;
  if (!cepPattern.test(cep)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de CEP inválido',
    });
  }

  const cleanCep = cep.replace('-', '');
  const formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;

  const endereco = await Endereco.findOne({
    where: {
      [Op.or]: [
          { cep: cep },
          { cep: formattedCep }
      ]
    },
  });

  if (!endereco) {
    return res.status(404).json({
      success: false,
      message: 'CEP não encontrado',
    });
  }

  res.json({
    success: true,
    data: {
      street: endereco.logradouro,
      neighborhood: endereco.bairro,
      city: endereco.cidade,
      state: endereco.estado,
      cep: endereco.cep,
      complement: endereco.complemento,
    },
  });
}));

// Rota de estatísticas
router.get('/stats/info', asyncHandler(async (req, res) => {
  const stats = await Endereco.findOne({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('cidade'))), 'cidades'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('bairro'))), 'bairros'],
      [sequelize.fn('MIN', sequelize.col('created_at')), 'primeira_importacao'],
      [sequelize.fn('MAX', sequelize.col('updated_at')), 'ultima_atualizacao'],
    ],
    raw: true,
  });

  res.json({
    success: true,
    data: stats,
  });
}));

module.exports = router;