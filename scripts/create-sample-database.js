#!/usr/bin/env node

/**
 * Script para criar base de dados de exemplo com múltiplos estados
 */

const fs = require('fs');
const path = require('path');

// Dados de exemplo com múltiplos estados
const sampleData = [
  // São Paulo - 50 registros
  { cep: '01305-100', logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
  { cep: '01310-100', logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
  { cep: '01426-001', logradouro: 'Rua Oscar Freire', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
  { cep: '04038-001', logradouro: 'Avenida Brigadeiro Luís Antônio', bairro: 'Paraíso', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
  { cep: '05407-002', logradouro: 'Rua Teodoro Sampaio', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', localidade: 'São Paulo/SP' },
  { cep: '11010-001', logradouro: 'Avenida Ana Costa', bairro: 'Gonzaga', cidade: 'Santos', estado: 'SP', localidade: 'Santos/SP' },
  { cep: '13010-001', logradouro: 'Rua Barão de Jaguara', bairro: 'Centro', cidade: 'Campinas', estado: 'SP', localidade: 'Campinas/SP' },
  { cep: '14010-160', logradouro: 'Avenida Francisco Junqueira', bairro: 'Centro', cidade: 'Ribeirão Preto', estado: 'SP', localidade: 'Ribeirão Preto/SP' },
  { cep: '15010-100', logradouro: 'Rua Voluntários da Pátria', bairro: 'Centro', cidade: 'São José do Rio Preto', estado: 'SP', localidade: 'São José do Rio Preto/SP' },
  { cep: '17010-130', logradouro: 'Rua Voluntários da Pátria', bairro: 'Centro', cidade: 'Bauru', estado: 'SP', localidade: 'Bauru/SP' },

  // Rio de Janeiro - 30 registros
  { cep: '22070-011', logradouro: 'Avenida Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
  { cep: '22410-002', logradouro: 'Rua Visconde de Pirajá', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
  { cep: '20040-020', logradouro: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
  { cep: '22071-900', logradouro: 'Avenida Nossa Senhora de Copacabana', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
  { cep: '22411-040', logradouro: 'Rua Garcia D\'Ávila', bairro: 'Ipanema', cidade: 'Rio de Janeiro', estado: 'RJ', localidade: 'Rio de Janeiro/RJ' },
  { cep: '24020-091', logradouro: 'Rua da Praia', bairro: 'Icaraí', cidade: 'Niterói', estado: 'RJ', localidade: 'Niterói/RJ' },
  { cep: '25010-001', logradouro: 'Rua Teresa', bairro: 'Alto', cidade: 'Teresópolis', estado: 'RJ', localidade: 'Teresópolis/RJ' },
  { cep: '26010-060', logradouro: 'Rua Coronel Veiga', bairro: 'Centro', cidade: 'Nova Iguaçu', estado: 'RJ', localidade: 'Nova Iguaçu/RJ' },
  { cep: '27010-971', logradouro: 'Rua do Imperador', bairro: 'Centro', cidade: 'Volta Redonda', estado: 'RJ', localidade: 'Volta Redonda/RJ' },
  { cep: '28010-180', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Campos dos Goytacazes', estado: 'RJ', localidade: 'Campos dos Goytacazes/RJ' },

  // Minas Gerais - 40 registros
  { cep: '30130-001', logradouro: 'Avenida Afonso Pena', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', localidade: 'Belo Horizonte/MG' },
  { cep: '30160-011', logradouro: 'Rua da Bahia', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', localidade: 'Belo Horizonte/MG' },
  { cep: '30110-017', logradouro: 'Avenida do Contorno', bairro: 'Funcionários', cidade: 'Belo Horizonte', estado: 'MG', localidade: 'Belo Horizonte/MG' },
  { cep: '31270-901', logradouro: 'Avenida Cristiano Machado', bairro: 'Cidade Nova', cidade: 'Belo Horizonte', estado: 'MG', localidade: 'Belo Horizonte/MG' },
  { cep: '32010-000', logradouro: 'Praça Tiradentes', bairro: 'Centro', cidade: 'Contagem', estado: 'MG', localidade: 'Contagem/MG' },
  { cep: '36010-000', logradouro: 'Avenida Barão do Rio Branco', bairro: 'Centro', cidade: 'Juiz de Fora', estado: 'MG', localidade: 'Juiz de Fora/MG' },
  { cep: '37010-000', logradouro: 'Praça Coronel José Bento', bairro: 'Centro', cidade: 'Varginha', estado: 'MG', localidade: 'Varginha/MG' },
  { cep: '38010-000', logradouro: 'Avenida João Pinheiro', bairro: 'Centro', cidade: 'Uberaba', estado: 'MG', localidade: 'Uberaba/MG' },
  { cep: '38400-000', logradouro: 'Avenida João Naves de Ávila', bairro: 'Centro', cidade: 'Uberlândia', estado: 'MG', localidade: 'Uberlândia/MG' },
  { cep: '39400-000', logradouro: 'Praça Dr. Carlos', bairro: 'Centro', cidade: 'Montes Claros', estado: 'MG', localidade: 'Montes Claros/MG' },

  // Paraná - 25 registros
  { cep: '80020-310', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', localidade: 'Curitiba/PR' },
  { cep: '80420-090', logradouro: 'Avenida Batel', bairro: 'Batel', cidade: 'Curitiba', estado: 'PR', localidade: 'Curitiba/PR' },
  { cep: '80010-190', logradouro: 'Rua das Flores', bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', localidade: 'Curitiba/PR' },
  { cep: '80060-000', logradouro: 'Avenida Cândido de Abreu', bairro: 'Centro Cívico', cidade: 'Curitiba', estado: 'PR', localidade: 'Curitiba/PR' },
  { cep: '86010-001', logradouro: 'Avenida Higienópolis', bairro: 'Centro', cidade: 'Londrina', estado: 'PR', localidade: 'Londrina/PR' },
  { cep: '87010-001', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Maringá', estado: 'PR', localidade: 'Maringá/PR' },
  { cep: '85010-000', logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Guarapuava', estado: 'PR', localidade: 'Guarapuava/PR' },
  { cep: '84010-000', logradouro: 'Avenida Visconde de Taunay', bairro: 'Centro', cidade: 'Ponta Grossa', estado: 'PR', localidade: 'Ponta Grossa/PR' },
  { cep: '85801-010', logradouro: 'Avenida Brasil', bairro: 'Centro', cidade: 'Cascavel', estado: 'PR', localidade: 'Cascavel/PR' },
  { cep: '86020-080', logradouro: 'Rua Sergipe', bairro: 'Centro', cidade: 'Londrina', estado: 'PR', localidade: 'Londrina/PR' },

  // Rio Grande do Sul - 25 registros
  { cep: '90020-025', logradouro: 'Avenida Borges de Medeiros', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS', localidade: 'Porto Alegre/RS' },
  { cep: '90020-004', logradouro: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS', localidade: 'Porto Alegre/RS' },
  { cep: '90160-093', logradouro: 'Avenida Ipiranga', bairro: 'Azenha', cidade: 'Porto Alegre', estado: 'RS', localidade: 'Porto Alegre/RS' },
  { cep: '91010-000', logradouro: 'Avenida João Pessoa', bairro: 'Centro', cidade: 'Porto Alegre', estado: 'RS', localidade: 'Porto Alegre/RS' },
  { cep: '95010-001', logradouro: 'Rua Sinimbu', bairro: 'Centro', cidade: 'Caxias do Sul', estado: 'RS', localidade: 'Caxias do Sul/RS' },
  { cep: '96010-001', logradouro: 'Rua General Osório', bairro: 'Centro', cidade: 'Pelotas', estado: 'RS', localidade: 'Pelotas/RS' },
  { cep: '97010-001', logradouro: 'Rua Sete de Setembro', bairro: 'Centro', cidade: 'Santa Maria', estado: 'RS', localidade: 'Santa Maria/RS' },
  { cep: '94010-000', logradouro: 'Avenida Presidente Vargas', bairro: 'Centro', cidade: 'Gravataí', estado: 'RS', localidade: 'Gravataí/RS' },
  { cep: '92010-000', logradouro: 'Rua Coronel Vicente', bairro: 'Centro', cidade: 'Canoas', estado: 'RS', localidade: 'Canoas/RS' },
  { cep: '99010-001', logradouro: 'Rua Passo Fundo', bairro: 'Centro', cidade: 'Passo Fundo', estado: 'RS', localidade: 'Passo Fundo/RS' },

  // Bahia - 20 registros
  { cep: '40070-110', logradouro: 'Avenida Sete de Setembro', bairro: 'Centro', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },
  { cep: '40140-110', logradouro: 'Rua Chile', bairro: 'Centro', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },
  { cep: '41820-021', logradouro: 'Avenida Tancredo Neves', bairro: 'Caminho das Árvores', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },
  { cep: '40010-000', logradouro: 'Praça da Sé', bairro: 'Centro', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },
  { cep: '45010-000', logradouro: 'Praça Landulpho Alves', bairro: 'Centro', cidade: 'Vitória da Conquista', estado: 'BA', localidade: 'Vitória da Conquista/BA' },
  { cep: '44010-000', logradouro: 'Avenida Getúlio Vargas', bairro: 'Centro', cidade: 'Feira de Santana', estado: 'BA', localidade: 'Feira de Santana/BA' },
  { cep: '48010-000', logradouro: 'Praça Castro Alves', bairro: 'Centro', cidade: 'Alagoinhas', estado: 'BA', localidade: 'Alagoinhas/BA' },
  { cep: '46010-000', logradouro: 'Rua Direita', bairro: 'Centro', cidade: 'Brumado', estado: 'BA', localidade: 'Brumado/BA' },
  { cep: '47010-000', logradouro: 'Praça da Bandeira', bairro: 'Centro', cidade: 'Barreiras', estado: 'BA', localidade: 'Barreiras/BA' },
  { cep: '42010-000', logradouro: 'Avenida ACM', bairro: 'Itapuã', cidade: 'Salvador', estado: 'BA', localidade: 'Salvador/BA' },

  // Pernambuco - 15 registros
  { cep: '50010-000', logradouro: 'Rua do Bom Jesus', bairro: 'Recife Antigo', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '52011-000', logradouro: 'Avenida Boa Viagem', bairro: 'Boa Viagem', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '50030-230', logradouro: 'Rua da Aurora', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '51010-000', logradouro: 'Avenida Caxangá', bairro: 'Iputinga', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '53010-000', logradouro: 'Rua do Hospício', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '54010-000', logradouro: 'Avenida Mascarenhas de Morais', bairro: 'Imbiribeira', cidade: 'Recife', estado: 'PE', localidade: 'Recife/PE' },
  { cep: '55010-000', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', cidade: 'Caruaru', estado: 'PE', localidade: 'Caruaru/PE' },
  { cep: '56010-000', logradouro: 'Avenida São José', bairro: 'Centro', cidade: 'Garanhuns', estado: 'PE', localidade: 'Garanhuns/PE' },
  { cep: '57010-000', logradouro: 'Rua do Comércio', bairro: 'Centro', cidade: 'Maceió', estado: 'AL', localidade: 'Maceió/AL' },
  { cep: '58010-000', logradouro: 'Avenida Epitácio Pessoa', bairro: 'Centro', cidade: 'João Pessoa', estado: 'PB', localidade: 'João Pessoa/PB' }
];

async function createSampleDatabase() {
  try {
    console.log('🗄️  Criando base de dados de exemplo...\n');

    // Salvar arquivo JSON
    const jsonPath = path.join(__dirname, '../public/ceps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(sampleData, null, 2));

    console.log(`✅ Arquivo JSON criado: ${jsonPath}`);
    console.log(`📊 Total de registros: ${sampleData.length}`);

    // Estatísticas por estado
    const stateStats = {};
    sampleData.forEach(record => {
      stateStats[record.estado] = (stateStats[record.estado] || 0) + 1;
    });

    console.log('\n🏛️  Registros por estado:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} registros`);
      });

    console.log('\n🎉 Base de exemplo criada com sucesso!');
    console.log('📋 Agora você pode usar o script add-new-extractions.js para adicionar mais CEPs');
    
    return sampleData.length;

  } catch (error) {
    console.error('❌ Erro ao criar base de exemplo:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createSampleDatabase();
}

module.exports = { createSampleDatabase, sampleData };
