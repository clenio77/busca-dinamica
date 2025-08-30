#!/usr/bin/env node

/**
 * Script para gerar base COMPLETA unificada
 * Inclui TODOS os registros do SQLite + dados de outros estados
 */

const { getDatabase, initDatabase } = require('../database/init');
const fs = require('fs');
const path = require('path');

// Dados adicionais de outros estados para complementar MG
const additionalStatesData = [
  // São Paulo - Principais cidades
  { cep: '01310-100', logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  { cep: '01305-100', logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
  { cep: '01426-001', logradouro: 'Rua Oscar Freire', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
  { cep: '04038-001', logradouro: 'Avenida Brigadeiro Luís Antônio', bairro: 'Paraíso', cidade: 'São Paulo', estado: 'SP' },
  { cep: '05407-002', logradouro: 'Rua Teodoro Sampaio', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
  { cep: '11010-001', logradouro: 'Avenida Ana Costa', bairro: 'Gonzaga', cidade: 'Santos', estado: 'SP' },
  { cep: '13010-001', logradouro: 'Rua Barão de Jaguara', bairro: 'Centro', cidade: 'Campinas', estado: 'SP' },
  { cep: '14010-160', logradouro: 'Avenida Francisco Junqueira', bairro: 'Centro', cidade: 'Ribeirão Preto', estado: 'SP' },
  { cep: '15010-100', logradouro: 'Rua Voluntários da Pátria', bairro: 'Centro', cidade: 'São José do Rio Preto', estado: 'SP' },
  { cep: '17010-130', logradouro: 'Rua Voluntários da Pátria', bairro: 'Centro', cidade: 'Bauru', estado: 'SP' },
  { cep: '18010-000', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Sorocaba', estado: 'SP' },
  { cep: '19010-080', logradouro: 'Rua Sete de Setembro', bairro: 'Centro', cidade: 'Presidente Prudente', estado: 'SP' },
  { cep: '12010-160', logradouro: 'Avenida São José', bairro: 'Centro', cidade: 'Taubaté', estado: 'SP' },
  { cep: '16010-000', logradouro: 'Rua General Glicério', bairro: 'Centro', cidade: 'Araçatuba', estado: 'SP' },
  { cep: '09010-160', logradouro: 'Rua Marechal Deodoro', bairro: 'Centro', cidade: 'Santo André', estado: 'SP' },

  // Rio de Janeiro - Principais cidades
  { cep: '20040-020', logradouro: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '22070-011', logradouro: 'Avenida Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '22410-002', logradouro: 'Rua Visconde de Pirajá', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '22071-900', logradouro: 'Avenida Nossa Senhora de Copacabana', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '22411-040', logradouro: 'Rua Garcia D\'Ávila', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '24020-091', logradouro: 'Rua da Praia', bairro: 'Icaraí', cidade: 'Niterói', estado: 'RJ' },
  { cep: '25010-001', logradouro: 'Rua Teresa', bairro: 'Alto', cidade: 'Teresópolis', estado: 'RJ' },
  { cep: '26010-060', logradouro: 'Rua Coronel Veiga', bairro: 'Centro', cidade: 'Nova Iguaçu', estado: 'RJ' },
  { cep: '27010-971', logradouro: 'Rua do Imperador', bairro: 'Centro', cidade: 'Volta Redonda', estado: 'RJ' },
  { cep: '28010-180', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Campos dos Goytacazes', estado: 'RJ' },
  { cep: '23010-200', logradouro: 'Rua General Severiano', bairro: 'Urca', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cep: '21010-021', logradouro: 'Rua São Francisco Xavier', bairro: 'Tijuca', cidade: 'Rio de Janeiro', estado: 'RJ' },

  // Paraná - Principais cidades
  { cep: '80020-310', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR' },
  { cep: '80420-090', logradouro: 'Avenida Batel', bairro: 'Batel', cidade: 'Curitiba', estado: 'PR' },
  { cep: '80010-190', logradouro: 'Rua das Flores', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR' },
  { cep: '80060-000', logradouro: 'Avenida Cândido de Abreu', bairro: 'Centro Cívico', cidade: 'Curitiba', estado: 'PR' },
  { cep: '86010-001', logradouro: 'Avenida Higienópolis', bairro: 'Centro', cidade: 'Londrina', estado: 'PR' },
  { cep: '87010-001', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Maringá', estado: 'PR' },
  { cep: '85010-000', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Guarapuava', estado: 'PR' },
  { cep: '84010-000', logradouro: 'Avenida Visconde de Taunay', bairro: 'Centro', cidade: 'Ponta Grossa', estado: 'PR' },
  { cep: '85801-010', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Cascavel', estado: 'PR' },
  { cep: '86020-080', logradouro: 'Rua Sergipe', bairro: 'Centro', cidade: 'Londrina', estado: 'PR' },

  // Rio Grande do Sul - Principais cidades
  { cep: '90020-025', logradouro: 'Avenida Borges de Medeiros', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '90020-004', logradouro: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '90160-093', logradouro: 'Avenida Ipiranga', bairro: 'Azenha', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '91010-000', logradouro: 'Avenida João Pessoa', bairro: 'Centro', cidade: 'Porto Alegre', estado: 'RS' },
  { cep: '95010-001', logradouro: 'Rua Sinimbu', bairro: 'Centro', cidade: 'Caxias do Sul', estado: 'RS' },
  { cep: '96010-001', logradouro: 'Rua General Osório', bairro: 'Centro', cidade: 'Pelotas', estado: 'RS' },
  { cep: '97010-001', logradouro: 'Rua Sete de Setembro', bairro: 'Centro', cidade: 'Santa Maria', estado: 'RS' },
  { cep: '94010-000', logradouro: 'Avenida Presidente Vargas', bairro: 'Centro', cidade: 'Gravataí', estado: 'RS' },
  { cep: '92010-000', logradouro: 'Rua Coronel Vicente', bairro: 'Centro', cidade: 'Canoas', estado: 'RS' },
  { cep: '99010-001', logradouro: 'Rua Passo Fundo', bairro: 'Centro', cidade: 'Passo Fundo', estado: 'RS' },

  // Bahia - Principais cidades
  { cep: '40070-110', logradouro: 'Avenida Sete de Setembro', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  { cep: '40140-110', logradouro: 'Rua Chile', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  { cep: '41820-021', logradouro: 'Avenida Tancredo Neves', bairro: 'Caminho das Árvores', cidade: 'Salvador', estado: 'BA' },
  { cep: '40010-000', logradouro: 'Praça da Sé', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  { cep: '45010-000', logradouro: 'Praça Landulpho Alves', bairro: 'Centro', cidade: 'Vitória da Conquista', estado: 'BA' },
  { cep: '44010-000', logradouro: 'Avenida Getúlio Vargas', bairro: 'Centro', cidade: 'Feira de Santana', estado: 'BA' },
  { cep: '48010-000', logradouro: 'Praça Castro Alves', bairro: 'Centro', cidade: 'Alagoinhas', estado: 'BA' },
  { cep: '46010-000', logradouro: 'Rua Direita', bairro: 'Centro', cidade: 'Brumado', estado: 'BA' },
  { cep: '47010-000', logradouro: 'Praça da Bandeira', bairro: 'Centro', cidade: 'Barreiras', estado: 'BA' },
  { cep: '42010-000', logradouro: 'Avenida ACM', bairro: 'Itapuã', cidade: 'Salvador', estado: 'BA' },

  // Pernambuco - Principais cidades
  { cep: '50010-000', logradouro: 'Rua do Bom Jesus', bairro: 'Recife Antigo', cidade: 'Recife', estado: 'PE' },
  { cep: '52011-000', logradouro: 'Avenida Boa Viagem', bairro: 'Boa Viagem', cidade: 'Recife', estado: 'PE' },
  { cep: '50030-230', logradouro: 'Rua da Aurora', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE' },
  { cep: '51010-000', logradouro: 'Avenida Caxangá', bairro: 'Iputinga', cidade: 'Recife', estado: 'PE' },
  { cep: '53010-000', logradouro: 'Rua do Hospício', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE' },
  { cep: '54010-000', logradouro: 'Avenida Mascarenhas de Morais', bairro: 'Imbiribeira', cidade: 'Recife', estado: 'PE' },
  { cep: '55010-000', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Caruaru', estado: 'PE' },
  { cep: '56010-000', logradouro: 'Avenida São José', bairro: 'Centro', cidade: 'Garanhuns', estado: 'PE' },

  // Ceará - Principais cidades
  { cep: '60010-000', logradouro: 'Rua Major Facundo', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '60020-181', logradouro: 'Avenida Dom Luís', bairro: 'Meireles', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '60030-002', logradouro: 'Rua Barão do Rio Branco', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '60040-111', logradouro: 'Avenida Beira Mar', bairro: 'Meireles', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '61010-000', logradouro: 'Rua São João', bairro: 'Centro', cidade: 'Caucaia', estado: 'CE' },

  // Santa Catarina - Principais cidades
  { cep: '88010-000', logradouro: 'Rua Felipe Schmidt', bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' },
  { cep: '88020-300', logradouro: 'Avenida Beira Mar Norte', bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' },
  { cep: '89010-000', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Blumenau', estado: 'SC' },
  { cep: '88701-000', logradouro: 'Avenida Marechal Deodoro', bairro: 'Centro', cidade: 'Tubarão', estado: 'SC' },

  // Goiás - Principais cidades
  { cep: '74010-000', logradouro: 'Avenida Goiás', bairro: 'Centro', cidade: 'Goiânia', estado: 'GO' },
  { cep: '74020-100', logradouro: 'Rua 3', bairro: 'Centro', cidade: 'Goiânia', estado: 'GO' },
  { cep: '75010-000', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Anápolis', estado: 'GO' }
];

async function generateCompleteDatabase() {
  try {
    console.log('🗄️  Gerando base COMPLETA unificada...\n');
    
    // Conectar ao banco SQLite
    await initDatabase();
    const db = getDatabase();

    console.log('📊 Buscando TODOS os registros do banco SQLite...');
    
    // Buscar TODOS os registros (sem LIMIT)
    const allRecords = db.prepare(`
      SELECT cep, logradouro, bairro, cidade, estado
      FROM enderecos
      ORDER BY cidade, logradouro
    `).all();

    console.log(`📋 Encontrados ${allRecords.length} registros no banco SQLite`);

    if (!allRecords || allRecords.length === 0) {
      console.log('⚠️  Nenhum registro encontrado no banco SQLite');
      return;
    }

    // Converter registros do SQLite para formato JSON
    const sqliteData = allRecords.map(record => ({
      cep: record.cep || '',
      logradouro: record.logradouro || '',
      bairro: record.bairro || '',
      cidade: record.cidade || '',
      estado: record.estado || 'MG',
      localidade: `${record.cidade || ''}/${record.estado || 'MG'}`
    }));

    console.log(`✅ Convertidos ${sqliteData.length} registros do SQLite`);

    // Adicionar dados de outros estados
    console.log(`🔄 Adicionando ${additionalStatesData.length} registros de outros estados...`);
    
    const additionalData = additionalStatesData.map(record => ({
      cep: record.cep,
      logradouro: record.logradouro,
      bairro: record.bairro,
      cidade: record.cidade,
      estado: record.estado,
      localidade: `${record.cidade}/${record.estado}`
    }));

    // Combinar todos os dados
    const allData = [...sqliteData, ...additionalData];

    // Remover duplicatas por CEP
    const uniqueData = [];
    const seenCeps = new Set();
    
    allData.forEach(record => {
      if (!seenCeps.has(record.cep)) {
        seenCeps.add(record.cep);
        uniqueData.push(record);
      }
    });

    console.log(`🔍 Removidas ${allData.length - uniqueData.length} duplicatas`);

    // Ordenar por estado, cidade, logradouro
    uniqueData.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado.localeCompare(b.estado);
      if (a.cidade !== b.cidade) return a.cidade.localeCompare(b.cidade);
      return a.logradouro.localeCompare(b.logradouro);
    });

    // Salvar arquivo JSON
    const jsonPath = path.join(__dirname, '../public/ceps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(uniqueData, null, 2));

    console.log(`✅ Arquivo JSON COMPLETO criado: ${jsonPath}`);
    console.log(`📊 Total de registros: ${uniqueData.length}`);

    // Estatísticas por estado
    const stateStats = {};
    uniqueData.forEach(record => {
      stateStats[record.estado] = (stateStats[record.estado] || 0) + 1;
    });

    console.log('\n🏛️  Registros por estado:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count.toLocaleString()} registros`);
      });

    console.log('\n🎉 Base COMPLETA unificada gerada com sucesso!');
    console.log(`📊 Total final: ${uniqueData.length.toLocaleString()} registros`);
    
    return uniqueData.length;

  } catch (error) {
    console.error('❌ Erro ao gerar base completa:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateCompleteDatabase().catch(console.error);
}

module.exports = { generateCompleteDatabase };
