const request = require('supertest');
const express = require('express');
const cepRoutes = require('../cep');

const app = express();
app.use(express.json());
app.use('/api/cep', cepRoutes);

describe('CEP API Integration Tests', () => {
  describe('GET /api/cep/search', () => {
    it('deve retornar endereços para busca válida', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'rua' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('deve filtrar por cidade', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'rua', cidade: 'São Paulo' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(address => {
        expect(address.cidade).toBe('São Paulo');
      });
    });

    it('deve filtrar por estado', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'rua', estado: 'SP' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(address => {
        expect(address.estado).toBe('SP');
      });
    });

    it('deve retornar erro para busca muito curta', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'a' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('mínimo');
    });

    it('deve retornar erro para busca vazia', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cep/:cep', () => {
    it('deve retornar endereço para CEP válido', async () => {
      const response = await request(app)
        .get('/api/cep/12345678')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('cep', '12345678');
    });

    it('deve retornar erro para CEP inválido', async () => {
      const response = await request(app)
        .get('/api/cep/123')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('CEP');
    });

    it('deve retornar 404 para CEP não encontrado', async () => {
      const response = await request(app)
        .get('/api/cep/99999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('GET /api/cep/cities', () => {
    it('deve retornar lista de cidades', async () => {
      const response = await request(app)
        .get('/api/cep/cities')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/cep/states', () => {
    it('deve retornar lista de estados', async () => {
      const response = await request(app)
        .get('/api/cep/states')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    it('deve aplicar rate limiting após muitas requisições', async () => {
      const requests = Array(31).fill().map(() => 
        request(app)
          .get('/api/cep/search')
          .query({ q: 'test' })
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toHaveProperty('error');
    });
  });

  describe('Input Validation', () => {
    it('deve sanitizar entrada maliciosa', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: '<script>alert("xss")</script>' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('deve rejeitar SQL injection', async () => {
      const response = await request(app)
        .get('/api/cep/search')
        .query({ q: 'union select' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
