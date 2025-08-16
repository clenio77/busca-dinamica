const { Pool } = require('pg');

// Configuração do PostgreSQL para Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

let isInitialized = false;

async function getDatabase() {
  if (!isInitialized) {
    await initDatabase();
  }
  return pool;
}

async function initDatabase() {
  try {
    console.log('🔄 Inicializando PostgreSQL...');
    
    // Criar tabela de endereços
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enderecos (
        id SERIAL PRIMARY KEY,
        cep VARCHAR(10) NOT NULL,
        logradouro TEXT NOT NULL,
        logradouro_sem_acento TEXT NOT NULL,
        bairro TEXT,
        bairro_sem_acento TEXT,
        cidade TEXT NOT NULL,
        cidade_sem_acento TEXT NOT NULL,
        estado VARCHAR(2) NOT NULL DEFAULT 'MG',
        complemento TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cep ON enderecos(cep)',
      'CREATE INDEX IF NOT EXISTS idx_logradouro_sem_acento ON enderecos(logradouro_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_bairro_sem_acento ON enderecos(bairro_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_cidade_sem_acento ON enderecos(cidade_sem_acento)',
      'CREATE INDEX IF NOT EXISTS idx_search ON enderecos(logradouro_sem_acento, bairro_sem_acento, cidade_sem_acento)'
    ];

    for (const indexSQL of indexes) {
      await pool.query(indexSQL);
    }

    console.log('✅ Tabelas e índices criados');

    // Verificar se há dados, se não, importar dados iniciais
    const result = await pool.query('SELECT COUNT(*) as count FROM enderecos');
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log('📥 Importando dados iniciais...');
      await importInitialData();
    } else {
      console.log(`ℹ️ Base já contém ${count} registros`);
    }

    isInitialized = true;
    console.log('✅ PostgreSQL inicializado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao inicializar PostgreSQL:', error);
    throw error;
  }
}

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

async function importInitialData() {
  const initialData = [
    { logradouro: 'Rua Belizario Dias', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Boa Viagem', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Educacao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Do Lavrador', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Domingues Alves', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Eclipse', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Francisco de Assis', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Joao Claudio Peixoto', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Joaquim Antonio de Freitas', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Jose Camin', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Nova Republica', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Praça Santo Agostinho', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Querubina da Costa Camim', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Sao Joao', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    { logradouro: 'Rua Sol Nascente', cep: '38439-500', bairro: '', cidade: 'Cruzeiro dos Peixotos' },
    
    // Martinesia
    { logradouro: 'Rua Abadia', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
    { logradouro: 'Rua Aniceto Antonio Da Silva', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
    { logradouro: 'Rua Central', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
    { logradouro: 'Rua Cutelaria', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
    { logradouro: 'Rua Da Felicidade', cep: '38439-800', bairro: '', cidade: 'Martinesia' },
    
    // Uberlândia - alguns exemplos
    { logradouro: 'Rua Olegario Maciel', cep: '38408-384', bairro: 'Vigilato Pereira', cidade: 'Uberlandia' },
    { logradouro: 'Rua Antonio Paiva Catalao', cep: '38410-238', bairro: 'Laranjeiras', cidade: 'Uberlandia' },
    { logradouro: 'Avenida Vereda', cep: '38433-001', bairro: 'Vila Marielza', cidade: 'Uberlandia' },
    { logradouro: 'Rua SP 09', cep: '38411-430', bairro: 'Shopping Park', cidade: 'Uberlandia' },
    { logradouro: 'Rua 01', cep: '38412-691', bairro: 'Morada Nova', cidade: 'Uberlandia' }
  ];

  for (const data of initialData) {
    await pool.query(`
      INSERT INTO enderecos (
        cep, logradouro, logradouro_sem_acento,
        bairro, bairro_sem_acento,
        cidade, cidade_sem_acento, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      data.cep,
      data.logradouro,
      removeAccents(data.logradouro),
      data.bairro,
      removeAccents(data.bairro),
      data.cidade,
      removeAccents(data.cidade),
      'MG'
    ]);
  }

  console.log(`✅ ${initialData.length} registros iniciais importados`);
}

async function closeDatabase() {
  await pool.end();
  console.log('🔌 Conexão PostgreSQL fechada');
}

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase,
  removeAccents
};
