#!/usr/bin/env node

/**
 * Script de teste para adicionar novos CEPs à base unificada
 */

const fs = require('fs');
const path = require('path');

// Simular novos CEPs extraídos
const newExtractions = [
  // Novos CEPs de São Paulo
  { cep: '01234-567', logradouro: 'Rua Nova Teste', bairro: 'Vila Teste', cidade: 'São Paulo', estado: 'SP' },
  { cep: '01234-568', logradouro: 'Avenida Teste Brasil', bairro: 'Centro Teste', cidade: 'São Paulo', estado: 'SP' },
  
  // Novos CEPs do Ceará (estado novo)
  { cep: '60010-000', logradouro: 'Rua Major Facundo', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '60020-181', logradouro: 'Avenida Dom Luís', bairro: 'Meireles', cidade: 'Fortaleza', estado: 'CE' },
  { cep: '60030-002', logradouro: 'Rua Barão do Rio Branco', bairro: 'Centro', cidade: 'Fortaleza', estado: 'CE' },
  
  // Novos CEPs de Santa Catarina (estado novo)
  { cep: '88010-000', logradouro: 'Rua Felipe Schmidt', bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' },
  { cep: '88020-300', logradouro: 'Avenida Beira Mar Norte', bairro: 'Centro', cidade: 'Florianópolis', estado: 'SC' },
  
  // Novos CEPs de Goiás (estado novo)
  { cep: '74010-000', logradouro: 'Avenida Goiás', bairro: 'Centro', cidade: 'Goiânia', estado: 'GO' },
  { cep: '74020-100', logradouro: 'Rua 3', bairro: 'Centro', cidade: 'Goiânia', estado: 'GO' }
];

async function testAddExtractions() {
  try {
    console.log('🧪 Testando adição de novas extrações...\n');

    // Ler base atual
    const jsonPath = path.join(__dirname, '../public/ceps.json');
    let currentData = [];
    
    if (fs.existsSync(jsonPath)) {
      currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`📊 Base atual: ${currentData.length} registros`);
    }

    // Estatísticas antes
    const statsBefore = {};
    currentData.forEach(record => {
      statsBefore[record.estado] = (statsBefore[record.estado] || 0) + 1;
    });

    console.log('\n📈 Estados antes da adição:');
    Object.entries(statsBefore)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} registros`);
      });

    // Adicionar novos registros
    console.log('\n🔄 Adicionando novos CEPs...\n');
    
    let added = 0;
    let duplicates = 0;
    const existingCeps = new Set(currentData.map(r => r.cep));

    newExtractions.forEach(newCep => {
      if (existingCeps.has(newCep.cep)) {
        console.log(`⏭️  ${newCep.cep} já existe`);
        duplicates++;
      } else {
        const newRecord = {
          cep: newCep.cep,
          logradouro: newCep.logradouro,
          bairro: newCep.bairro,
          cidade: newCep.cidade,
          estado: newCep.estado,
          localidade: `${newCep.cidade}/${newCep.estado}`
        };
        
        currentData.push(newRecord);
        existingCeps.add(newCep.cep);
        console.log(`✅ ${newCep.cep} - ${newCep.logradouro}, ${newCep.cidade}/${newCep.estado}`);
        added++;
      }
    });

    // Ordenar por estado, cidade, logradouro
    currentData.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado.localeCompare(b.estado);
      if (a.cidade !== b.cidade) return a.cidade.localeCompare(b.cidade);
      return a.logradouro.localeCompare(b.logradouro);
    });

    // Salvar base atualizada
    fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2));

    // Estatísticas depois
    const statsAfter = {};
    currentData.forEach(record => {
      statsAfter[record.estado] = (statsAfter[record.estado] || 0) + 1;
    });

    console.log('\n📊 Resumo da operação:');
    console.log(`   ✅ Adicionados: ${added}`);
    console.log(`   ⏭️  Duplicatas: ${duplicates}`);
    console.log(`   📈 Total processados: ${newExtractions.length}`);
    console.log(`   📊 Total na base: ${currentData.length}`);

    console.log('\n📈 Estados após a adição:');
    Object.entries(statsAfter)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        const before = statsBefore[state] || 0;
        const diff = count - before;
        const diffText = diff > 0 ? ` (+${diff})` : '';
        console.log(`   ${state}: ${count} registros${diffText}`);
      });

    console.log('\n🎉 Teste de adição concluído com sucesso!');
    console.log(`✅ Arquivo atualizado: ${jsonPath}`);

    return {
      added,
      duplicates,
      total: currentData.length,
      newStates: Object.keys(statsAfter).filter(state => !statsBefore[state])
    };

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAddExtractions().catch(console.error);
}

module.exports = { testAddExtractions, newExtractions };
