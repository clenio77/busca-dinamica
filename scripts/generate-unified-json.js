#!/usr/bin/env node

/**
 * Script simples para gerar JSON unificado da base de dados
 */

const { getDatabase, initDatabase } = require('../database/init');
const fs = require('fs');
const path = require('path');

async function generateUnifiedJSON() {
  try {
    console.log('🗄️  Conectando à base de dados...\n');
    await initDatabase();
    const db = getDatabase();

    // Buscar todos os registros
    console.log('📊 Buscando registros...');
    const allRecords = db.prepare(`
      SELECT cep, logradouro, bairro, cidade, estado
      FROM enderecos
      ORDER BY estado, cidade, logradouro
      LIMIT 1000
    `).all();

    console.log(`📋 Encontrados ${allRecords ? allRecords.length : 0} registros`);

    if (!allRecords || allRecords.length === 0) {
      console.log('⚠️  Nenhum registro encontrado na base de dados');
      // Usar apenas dados de exemplo
      allRecords = [];
    }

    // Converter para formato JSON da aplicação
    const jsonData = (allRecords || []).map(record => ({
      cep: record.cep || '',
      logradouro: record.logradouro || '',
      bairro: record.bairro || '',
      cidade: record.cidade || '',
      estado: record.estado || 'MG',
      localidade: `${record.cidade || ''}/${record.estado || 'MG'}`
    }));

    // Adicionar alguns dados de exemplo de outros estados
    const sampleData = [
      { cep: '01305-100', logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
      { cep: '01310-100', logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
      { cep: '22070-011', logradouro: 'Avenida Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
      { cep: '22410-002', logradouro: 'Rua Visconde de Pirajá', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
      { cep: '80020-310', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', localidade: 'Curitiba/PR' },
      { cep: '90020-025', logradouro: 'Avenida Borges de Medeiros', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS', localidade: 'Porto Alegre/RS' },
      { cep: '40070-110', logradouro: 'Avenida Sete de Setembro', bairro: 'Centro', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },
      { cep: '50010-000', logradouro: 'Rua do Bom Jesus', bairro: 'Recife Antigo', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' }
    ];

    // Adicionar dados de exemplo (apenas se não existirem)
    const existingCeps = new Set((jsonData || []).map(r => r.cep));
    sampleData.forEach(sample => {
      if (!existingCeps.has(sample.cep)) {
        jsonData.push(sample);
      }
    });

    // Salvar arquivo JSON
    const jsonPath = path.join(__dirname, '../public/ceps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Arquivo JSON criado: ${jsonPath}`);
    console.log(`📊 Total de registros: ${jsonData.length}`);

    // Estatísticas por estado
    const stateStats = {};
    jsonData.forEach(record => {
      stateStats[record.estado] = (stateStats[record.estado] || 0) + 1;
    });

    console.log('\n🏛️  Registros por estado:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} registros`);
      });

    console.log('\n🎉 JSON unificado gerado com sucesso!');
    return jsonData.length;

  } catch (error) {
    console.error('❌ Erro ao gerar JSON:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateUnifiedJSON();
}

module.exports = { generateUnifiedJSON };
