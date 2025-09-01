const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Mock data para demonstração
const mockAddresses = [
  {
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    complemento: ""
  },
  {
    cep: "20040-007",
    logradouro: "Avenida Rio Branco",
    bairro: "Centro",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    complemento: ""
  },
  {
    cep: "30112-970",
    logradouro: "Rua da Bahia",
    bairro: "Centro",
    cidade: "Belo Horizonte",
    estado: "MG",
    complemento: ""
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Search addresses
app.get('/search', (req, res) => {
  const { q, cidade, estado, limit = 50, offset = 0 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Termo de busca deve ter pelo menos 2 caracteres"
    });
  }

  let results = mockAddresses.filter(address => 
    address.logradouro.toLowerCase().includes(q.toLowerCase()) ||
    address.bairro.toLowerCase().includes(q.toLowerCase()) ||
    address.cidade.toLowerCase().includes(q.toLowerCase())
  );

  if (cidade) {
    results = results.filter(address => 
      address.cidade.toLowerCase() === cidade.toLowerCase()
    );
  }

  if (estado) {
    results = results.filter(address => 
      address.estado.toUpperCase() === estado.toUpperCase()
    );
  }

  const paginatedResults = results.slice(offset, offset + parseInt(limit));

  res.json({
    success: true,
    data: paginatedResults,
    total: results.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
    query: q
  });
});

// Get address by CEP
app.get('/:cep', (req, res) => {
  const { cep } = req.params;
  
  if (!/^\d{5}-?\d{3}$/.test(cep)) {
    return res.status(400).json({
      success: false,
      message: "CEP inválido. Use o formato 12345-678 ou 12345678"
    });
  }

  const cleanCEP = cep.replace(/\D/g, '');
  const address = mockAddresses.find(addr => 
    addr.cep.replace(/\D/g, '') === cleanCEP
  );

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "CEP não encontrado"
    });
  }

  res.json({
    success: true,
    data: address
  });
});

// Get cities
app.get('/cities', (req, res) => {
  const { estado } = req.query;
  
  let cities = [...new Set(mockAddresses.map(addr => addr.cidade))];
  
  if (estado) {
    cities = mockAddresses
      .filter(addr => addr.estado.toUpperCase() === estado.toUpperCase())
      .map(addr => addr.cidade);
    cities = [...new Set(cities)];
  }

  res.json({
    success: true,
    data: cities,
    total: cities.length
  });
});

// Get states
app.get('/states', (req, res) => {
  const states = [...new Set(mockAddresses.map(addr => addr.estado))];
  
  res.json({
    success: true,
    data: states
  });
});

module.exports = app;
