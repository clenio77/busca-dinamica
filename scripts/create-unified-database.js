#!/usr/bin/env node

/**
 * Script para criar base unificada de CEPs
 * Combina dados existentes + dados de exemplo de múltiplos estados
 */

const { getDatabase, initDatabase } = require('../database/init');
const fs = require('fs');
const path = require('path');

// Dados de exemplo para múltiplos estados (para demonstração)
const sampleData = [
  // São Paulo
  { cep: '01305-100', logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
  { cep: '01310-100', logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  { cep: '01426-001', logradouro: 'Rua Oscar Freire', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
  { cep: '11010-001', logradouro: 'Avenida Ana Costa', bairro: 'Gonzaga', cidade: 'Santos', estado: 'SP' },
  { cep: '13010-001', logradouro: 'Rua Barão de Jaguara', bairro: 'Centro', cidade: 'Campinas', estado: 'SP' },

  // Rio de Janeiro
  { cep: '22070-011', logradouro: 'Avenida Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '22410-002', logradouro: 'Rua Visconde de Pirajá', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '20040-020', logradouro: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '24020-091', logradouro: 'Rua da Praia', bairro: 'Icaraí', cidade: 'Niterói', estado: 'RJ' },
  { cep: '25010-001', logradouro: 'Rua Teresa', bairro: 'Alto', cidade: 'Teresópolis', estado: 'RJ' },

  // Paraná
  { cep: '80020-310', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR' },
  { cep: '80420-090', logradouro: 'Avenida Batel', bairro: 'Batel', cidade: 'Curitiba', estado: 'PR' },
  { cep: '80010-190', logradouro: 'Rua das Flores', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR' },
  { cep: '86010-001', logradouro: 'Avenida Higienópolis', bairro: 'Centro', cidade: 'Londrina', estado: 'PR' },
  { cep: '87010-001', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Maringá', estado: 'PR' },

  // Rio Grande do Sul
  { cep: '90020-025', logradouro: 'Avenida Borges de Medeiros', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '90020-004', logradouro: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '90160-093', logradouro: 'Avenida Ipiranga', bairro: 'Azenha', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '95010-001', logradouro: 'Rua Sinimbu', bairro: 'Centro', cidade: 'Caxias do Sul', estado: 'RS' },
  { cep: '96010-001', logradouro: 'Rua General Osório', bairro: 'Centro', cidade: 'Pelotas', estado: 'RS' },

  // Bahia
  { cep: '40070-110', logradouro: 'Avenida Sete de Setembro', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  { cep: '40140-110', logradouro: 'Rua Chile', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  { cep: '41820-021', logradouro: 'Avenida Tancredo Neves', bairro: 'Caminho das Árvores', cidade: 'Salvador', estado: 'BA' },

  // Pernambuco
  { cep: '50010-000', logradouro: 'Rua do Bom Jesus', bairro: 'Recife Antigo', cidade: 'Recife', estado: 'PE' },
  { cep: '52011-000', logradouro: 'Avenida Boa Viagem', bairro: 'Boa Viagem', cidade: 'Recife', estado: 'PE' },
  { cep: '50030-230', logradouro: 'Rua da Aurora', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE' }
];

class UnifiedDatabaseCreator {
  constructor() {
    this.db = null;
  }

  // Função para remover acentos
  removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  async init() {
    console.log('🗄️  Inicializando criador de base unificada...\n');
    await initDatabase();
    this.db = getDatabase();
  }

  async addSampleData() {
    console.log('📊 Adicionando dados de exemplo de múltiplos estados...\n');
    
    let added = 0;
    let skipped = 0;

    for (const data of sampleData) {
      try {
        // Verificar se já existe
        const existing = this.db.prepare(`
          SELECT id FROM enderecos WHERE cep = ?
        `).get(data.cep);

        if (existing) {
          console.log(`⏭️  ${data.cep} já existe (${data.cidade}/${data.estado})`);
          skipped++;
          continue;
        }

        // Inserir novo registro
        this.db.prepare(`
          INSERT INTO enderecos (cep, logradouro, logradouro_sem_acento, bairro, bairro_sem_acento, cidade, cidade_sem_acento, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.cep,
          data.logradouro,
          this.removeAccents(data.logradouro),
          data.bairro,
          this.removeAccents(data.bairro),
          data.cidade,
          this.removeAccents(data.cidade),
          data.estado
        );

        console.log(`✅ ${data.cep} - ${data.logradouro}, ${data.cidade}/${data.estado}`);
        added++;

      } catch (error) {
        console.error(`❌ Erro ao adicionar ${data.cep}:`, error.message);
      }
    }

    console.log(`\n📈 Resumo da adição de dados de exemplo:`);
    console.log(`   - Adicionados: ${added}`);
    console.log(`   - Já existiam: ${skipped}`);
    console.log(`   - Total processados: ${sampleData.length}`);
  }

  async generateUnifiedJSON() {
    console.log('\n📄 Gerando arquivo JSON unificado...');
    
    // Buscar todos os registros
    const allRecords = this.db.prepare(`
      SELECT cep, logradouro, bairro, cidade, estado
      FROM enderecos
      ORDER BY estado, cidade, logradouro
    `).all();

    // Converter para formato JSON da aplicação
    const jsonData = allRecords.map(record => ({
      cep: record.cep,
      logradouro: record.logradouro,
      bairro: record.bairro,
      cidade: record.cidade,
      estado: record.estado,
      localidade: `${record.cidade}/${record.estado}`
    }));

    // Salvar arquivo JSON
    const jsonPath = path.join(__dirname, '../public/ceps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Arquivo JSON criado: ${jsonPath}`);
    console.log(`📊 Total de registros: ${jsonData.length}`);

    // Estatísticas por estado
    const stateStats = {};
    if (Array.isArray(jsonData)) {
      jsonData.forEach(record => {
        stateStats[record.estado] = (stateStats[record.estado] || 0) + 1;
      });
    }

    console.log('\n🏛️  Registros por estado:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} registros`);
      });

    return jsonData.length;
  }

  async run() {
    try {
      await this.init();
      await this.addSampleData();
      const totalRecords = await this.generateUnifiedJSON();
      
      console.log('\n🎉 Base unificada criada com sucesso!');
      console.log(`📊 Total final: ${totalRecords} registros`);
      
    } catch (error) {
      console.error('❌ Erro ao criar base unificada:', error);
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const creator = new UnifiedDatabaseCreator();
  creator.run();
}

module.exports = { UnifiedDatabaseCreator };
