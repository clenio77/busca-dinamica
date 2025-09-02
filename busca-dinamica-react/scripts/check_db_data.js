const sequelize = require('../database/connection');
const Endereco = require('../models/endereco');
const { Op } = require('sequelize');

async function checkDbData() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    const problematicCeps = await Endereco.findAll({
      where: {
        [Op.or]: [
          { logradouro: { [Op.or]: { [Op.is]: null, [Op.eq]: '' } } },
          { cidade: { [Op.or]: { [Op.is]: null, [Op.eq]: '' } } },
          { estado: { [Op.or]: { [Op.is]: null, [Op.eq]: '' } } },
          { bairro: { [Op.or]: { [Op.is]: null, [Op.eq]: '' } } },
          { complemento: { [Op.or]: { [Op.is]: null, [Op.eq]: '' } } },
        ],
      },
      limit: 20, // Limitar para não sobrecarregar a saída
    });

    if (problematicCeps.length > 0) {
      console.log('\nRegistros com campos nulos ou ausentes:');
      problematicCeps.forEach(endereco => {
        console.log(`
          CEP: ${endereco.cep}
          Logradouro: ${endereco.logradouro}
          Bairro: ${endereco.bairro}
          Cidade: ${endereco.cidade}
          Estado: ${endereco.estado}
          Complemento: ${endereco.complemento}
        `);
      });
    } else {
      console.log('\nNenhum registro com logradouro, cidade, estado, bairro ou complemento nulo encontrado.');
    }

  } catch (error) {
    console.error('Erro ao verificar dados do banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

checkDbData();
