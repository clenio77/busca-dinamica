const request = require('supertest');
const express = require('express');
const cepRoutes = require('../cep');

// Mock do modelo Endereco
jest.mock('../../models/endereco');
const Endereco = require('../../models/endereco');

// Mock do sequelize
jest.mock('../../database/connection', () => ({
  fn: jest.fn(),
  col: jest.fn(),
  Op: {
    or: Symbol('or'),
    like: Symbol('like')
  }
}));

const app = express();
app.use(express.json());
app.use('/api/cep', cepRoutes);

describe('CEP Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cep/search', () => {
    it('should return 400 for query less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/cep/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should search addresses successfully', async () => {
      const mockAddresses = [
        {
          logradouro: 'Rua Teste',
          bairro: 'Centro',
          cidade: 'Uberlandia',
          estado: 'MG',
          cep: '38400-000',
          complemento: null
        }
      ];

      Endereco.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAddresses
      });

      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'teste', limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });

    it('should handle database errors gracefully', async () => {
      Endereco.findAndCountAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'teste' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cep/:cep', () => {
    it('should return 400 for invalid CEP format', async () => {
      const response = await request(app)
        .get('/api/cep/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should find address by CEP successfully', async () => {
      const mockAddress = {
        logradouro: 'Rua Teste',
        bairro: 'Centro',
        cidade: 'Uberlandia',
        estado: 'MG',
        cep: '38400-000',
        complemento: null
      };

      Endereco.findOne.mockResolvedValue(mockAddress);

      const response = await request(app)
        .get('/api/cep/38400-000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cep).toBe('38400-000');
    });

    it('should return 404 for non-existent CEP', async () => {
      Endereco.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cep/99999-999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle CEP with and without dash', async () => {
      const mockAddress = {
        logradouro: 'Rua Teste',
        bairro: 'Centro',
        cidade: 'Uberlandia',
        estado: 'MG',
        cep: '38400-000',
        complemento: null
      };

      Endereco.findOne.mockResolvedValue(mockAddress);

      const response = await request(app)
        .get('/api/cep/38400000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/cep/stats/info', () => {
    it('should return statistics successfully', async () => {
      const mockStats = {
        total: 1000,
        cidades: 50,
        bairros: 200,
        primeira_importacao: '2024-01-01',
        ultima_atualizacao: '2024-12-01'
      };

      Endereco.findOne.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/cep/stats/info');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(1000);
    });
  });
});
