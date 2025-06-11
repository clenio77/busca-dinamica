const express = require('express');
const router = express.Router();
const { getDatabase, removeAccents } = require('../database/init');

// Buscar endereços
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ 
        success: false, 
        message: 'Query deve ter pelo menos 2 caracteres',
        data: [] 
      });
    }

    const searchTerm = removeAccents(q.trim());
    const db = getDatabase();

    // Query para busca flexível
    const sql = `
      SELECT 
        cep, logradouro, bairro, cidade, complemento,
        (CASE 
          WHEN logradouro_sem_acento LIKE ? THEN 3
          WHEN bairro_sem_acento LIKE ? THEN 2
          WHEN cidade_sem_acento LIKE ? THEN 1
          ELSE 0
        END) as relevancia
      FROM enderecos 
      WHERE 
        logradouro_sem_acento LIKE ? OR 
        bairro_sem_acento LIKE ? OR 
        cidade_sem_acento LIKE ? OR
        cep LIKE ?
      ORDER BY relevancia DESC, logradouro
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const exactPattern = `${searchTerm}%`;

    db.all(sql, [
      exactPattern, exactPattern, exactPattern,
      searchPattern, searchPattern, searchPattern, searchPattern,
      parseInt(limit), parseInt(offset)
    ], (err, rows) => {
      if (err) {
        console.error('Erro na busca:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro interno do servidor' 
        });
      }

      res.json({
        success: true,
        data: rows,
        total: rows.length,
        query: q
      });
    });

  } catch (error) {
    console.error('Erro na rota de busca:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Buscar por CEP específico
router.get('/:cep', async (req, res) => {
  try {
    const { cep } = req.params;
    
    // Validar formato do CEP
    const cepPattern = /^\d{5}-?\d{3}$/;
    if (!cepPattern.test(cep)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de CEP inválido' 
      });
    }

    const cleanCep = cep.replace('-', '');
    const formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    
    const db = getDatabase();
    
    db.get(
      'SELECT * FROM enderecos WHERE cep = ? OR cep = ?', 
      [cep, formattedCep],
      (err, row) => {
        if (err) {
          console.error('Erro na busca por CEP:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
          });
        }

        if (!row) {
          return res.status(404).json({ 
            success: false, 
            message: 'CEP não encontrado' 
          });
        }

        res.json({
          success: true,
          data: row
        });
      }
    );

  } catch (error) {
    console.error('Erro na rota de CEP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Estatísticas da base
router.get('/stats/info', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.all(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT cidade) as cidades,
        COUNT(DISTINCT bairro) as bairros,
        MIN(created_at) as primeira_importacao,
        MAX(updated_at) as ultima_atualizacao
      FROM enderecos
    `, (err, rows) => {
      if (err) {
        console.error('Erro ao buscar estatísticas:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro interno do servidor' 
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    });

  } catch (error) {
    console.error('Erro na rota de estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
