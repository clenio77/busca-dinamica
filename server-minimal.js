const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares mínimos
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('.'));

// Base de dados em memória (para conta gratuita)
let enderecos = [
  { cep: '38439-500', logradouro: 'Rua Belizario Dias', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA BELIZARIO DIAS', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Boa Viagem', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA BOA VIAGEM', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Educacao', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA EDUCACAO', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Do Lavrador', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA DO LAVRADOR', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Domingues Alves', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA DOMINGUES ALVES', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Eclipse', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA ECLIPSE', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Francisco de Assis', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA FRANCISCO DE ASSIS', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Joao Claudio Peixoto', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA JOAO CLAUDIO PEIXOTO', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Jose Camin', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA JOSE CAMIN', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  { cep: '38439-500', logradouro: 'Rua Sao Joao', bairro: '', cidade: 'Cruzeiro dos Peixotos', logradouro_sem_acento: 'RUA SAO JOAO', cidade_sem_acento: 'CRUZEIRO DOS PEIXOTOS' },
  
  // Martinesia
  { cep: '38439-800', logradouro: 'Rua Abadia', bairro: '', cidade: 'Martinesia', logradouro_sem_acento: 'RUA ABADIA', cidade_sem_acento: 'MARTINESIA' },
  { cep: '38439-800', logradouro: 'Rua Central', bairro: '', cidade: 'Martinesia', logradouro_sem_acento: 'RUA CENTRAL', cidade_sem_acento: 'MARTINESIA' },
  { cep: '38439-800', logradouro: 'Rua Da Felicidade', bairro: '', cidade: 'Martinesia', logradouro_sem_acento: 'RUA DA FELICIDADE', cidade_sem_acento: 'MARTINESIA' },
  { cep: '38439-800', logradouro: 'Avenida Da Fortuna', bairro: '', cidade: 'Martinesia', logradouro_sem_acento: 'AVENIDA DA FORTUNA', cidade_sem_acento: 'MARTINESIA' },
  { cep: '38439-800', logradouro: 'Rua Uberlandia', bairro: '', cidade: 'Martinesia', logradouro_sem_acento: 'RUA UBERLANDIA', cidade_sem_acento: 'MARTINESIA' },
  
  // Tapuirama
  { cep: '38439-600', logradouro: 'Rua Adolfo Fonseca', bairro: '', cidade: 'Tapuirama', logradouro_sem_acento: 'RUA ADOLFO FONSECA', cidade_sem_acento: 'TAPUIRAMA' },
  { cep: '38439-600', logradouro: 'Rua Gonzaga', bairro: '', cidade: 'Tapuirama', logradouro_sem_acento: 'RUA GONZAGA', cidade_sem_acento: 'TAPUIRAMA' },
  { cep: '38439-600', logradouro: 'Rua Governador Valadares', bairro: '', cidade: 'Tapuirama', logradouro_sem_acento: 'RUA GOVERNADOR VALADARES', cidade_sem_acento: 'TAPUIRAMA' },
  { cep: '38439-600', logradouro: 'Avenida Jose Custodio de Oliveira', bairro: '', cidade: 'Tapuirama', logradouro_sem_acento: 'AVENIDA JOSE CUSTODIO DE OLIVEIRA', cidade_sem_acento: 'TAPUIRAMA' },
  { cep: '38439-600', logradouro: 'Rua Medeiros', bairro: '', cidade: 'Tapuirama', logradouro_sem_acento: 'RUA MEDEIROS', cidade_sem_acento: 'TAPUIRAMA' },
  
  // Uberlândia
  { cep: '38408-384', logradouro: 'Rua Olegario Maciel', bairro: 'Vigilato Pereira', cidade: 'Uberlandia', logradouro_sem_acento: 'RUA OLEGARIO MACIEL', cidade_sem_acento: 'UBERLANDIA' },
  { cep: '38410-238', logradouro: 'Rua Antonio Paiva Catalao', bairro: 'Laranjeiras', cidade: 'Uberlandia', logradouro_sem_acento: 'RUA ANTONIO PAIVA CATALAO', cidade_sem_acento: 'UBERLANDIA' },
  { cep: '38433-001', logradouro: 'Avenida Vereda', bairro: 'Vila Marielza', cidade: 'Uberlandia', logradouro_sem_acento: 'AVENIDA VEREDA', cidade_sem_acento: 'UBERLANDIA' },
  { cep: '38411-430', logradouro: 'Rua SP 09', bairro: 'Shopping Park', cidade: 'Uberlandia', logradouro_sem_acento: 'RUA SP 09', cidade_sem_acento: 'UBERLANDIA' },
  { cep: '38412-691', logradouro: 'Rua 01', bairro: 'Morada Nova', cidade: 'Uberlandia', logradouro_sem_acento: 'RUA 01', cidade_sem_acento: 'UBERLANDIA' }
];

// Função para remover acentos
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

// API de busca
app.get('/api/cep/search', (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: false, message: 'Query muito curta', data: [] });
    }

    const searchTerm = removeAccents(q.trim());
    
    const results = enderecos.filter(endereco => 
      endereco.logradouro_sem_acento.includes(searchTerm) ||
      endereco.cidade_sem_acento.includes(searchTerm) ||
      endereco.cep.includes(q.trim())
    ).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: results,
      total: results.length,
      query: q
    });

  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Buscar por CEP específico
app.get('/api/cep/:cep', (req, res) => {
  try {
    const { cep } = req.params;
    const result = enderecos.find(e => e.cep === cep);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'CEP não encontrado' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Estatísticas
app.get('/api/cep/stats/info', (req, res) => {
  const cidades = [...new Set(enderecos.map(e => e.cidade))];
  const bairros = [...new Set(enderecos.map(e => e.bairro).filter(b => b))];
  
  res.json({
    success: true,
    data: {
      total: enderecos.length,
      cidades: cidades.length,
      bairros: bairros.length,
      ultima_atualizacao: new Date().toISOString()
    }
  });
});

// Adicionar CEP via API (para expandir a base)
app.post('/api/cep/add', (req, res) => {
  try {
    const { cep, logradouro, bairro, cidade } = req.body;
    
    if (!cep || !logradouro || !cidade) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios: cep, logradouro, cidade' });
    }

    const novoEndereco = {
      cep,
      logradouro,
      bairro: bairro || '',
      cidade,
      logradouro_sem_acento: removeAccents(logradouro),
      cidade_sem_acento: removeAccents(cidade)
    };

    // Verificar se já existe
    const existe = enderecos.find(e => e.cep === cep && e.logradouro === logradouro);
    if (existe) {
      return res.json({ success: false, message: 'Endereço já existe' });
    }

    enderecos.push(novoEndereco);
    
    res.json({ 
      success: true, 
      message: 'Endereço adicionado',
      total: enderecos.length 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao adicionar' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    total_enderecos: enderecos.length,
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
});

// Servir arquivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-minimal.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor MINIMAL rodando na porta ${PORT}`);
  console.log(`📊 Base inicial: ${enderecos.length} endereços`);
  console.log(`💾 Memória: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Encerrando servidor...');
  process.exit(0);
});
