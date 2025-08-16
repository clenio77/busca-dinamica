#!/usr/bin/env node

/**
 * Script para adicionar outras cidades de MG
 * Coleta CEPs de Araguari, Patos de Minas, Ituiutaba, etc.
 */

const { UltraConservativeCEPCollector } = require('./ultra-conservative-collector');

class MultiCityCEPCollector extends UltraConservativeCEPCollector {
  constructor() {
    super();
    this.cities = [
      { name: 'Araguari', cepStart: 38440000, cepEnd: 38449999 },
      { name: 'Patos de Minas', cepStart: 38700000, cepEnd: 38709999 },
      { name: 'Ituiutaba', cepStart: 38300000, cepEnd: 38309999 },
      { name: 'Uberaba', cepStart: 38000000, cepEnd: 38099999 },
      { name: 'Montes Claros', cepStart: 39400000, cepEnd: 39409999 }
    ];
  }

  async collectFromMultipleCities(maxCepsPerCity = 50) {
    console.log('🏙️  Iniciando coleta de múltiplas cidades de MG...\n');

    const results = {
      totalProcessed: 0,
      totalFound: 0,
      citiesResults: {}
    };

    for (const cityInfo of this.cities) {
      console.log(`\n📍 === COLETANDO: ${cityInfo.name.toUpperCase()} ===`);
      console.log(
        `🎯 Faixa de CEPs: ${this.formatCep(cityInfo.cepStart)} - ${this.formatCep(cityInfo.cepEnd)}`
      );

      try {
        const cityResult = await this.collectCityRange(
          cityInfo.cepStart,
          cityInfo.cepEnd,
          cityInfo.name,
          maxCepsPerCity
        );

        results.citiesResults[cityInfo.name] = cityResult;
        results.totalProcessed += cityResult.processed;
        results.totalFound += cityResult.found;

        console.log(`✅ ${cityInfo.name}: ${cityResult.found} CEPs coletados`);

        // Pausa entre cidades para não sobrecarregar APIs
        if (this.cities.indexOf(cityInfo) < this.cities.length - 1) {
          console.log('⏸️  Pausando 30s antes da próxima cidade...');
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error(`❌ Erro ao coletar ${cityInfo.name}:`, error.message);
        results.citiesResults[cityInfo.name] = { processed: 0, found: 0, error: error.message };
      }
    }

    return results;
  }

  async collectCityRange(startCep, endCep, expectedCity, maxCeps) {
    let currentCep = startCep;
    let processed = 0;
    let found = 0;
    let attempts = 0;
    const maxAttempts = maxCeps * 3; // Tentar 3x mais CEPs para encontrar os válidos

    while (found < maxCeps && attempts < maxAttempts && currentCep <= endCep) {
      const formattedCep = this.formatCep(currentCep);
      attempts++;

      try {
        // Verificar se já existe
        const exists = await this.cepExistsInDB(formattedCep);
        if (exists) {
          currentCep += 10; // Pular alguns CEPs se já existe
          continue;
        }

        // Buscar CEP
        const cepData = await this.fetchCepData(formattedCep);
        processed++;

        if (cepData && cepData.cidade) {
          // Verificar se é da cidade esperada (busca flexível)
          const cityMatch =
            cepData.cidade.toLowerCase().includes(expectedCity.toLowerCase()) ||
            expectedCity.toLowerCase().includes(cepData.cidade.toLowerCase());

          if (cityMatch) {
            await this.saveCepData(cepData);
            found++;
            console.log(
              `✅ ${formattedCep}: ${cepData.logradouro || 'N/A'}, ${cepData.bairro}, ${cepData.cidade}`
            );
          } else {
            console.log(`ℹ️  ${formattedCep}: ${cepData.cidade} (cidade diferente)`);
          }
        }

        // Incremento inteligente baseado na densidade de CEPs
        if (found > 0 && found % 10 === 0) {
          currentCep += 1; // Incremento menor quando encontrando CEPs
        } else {
          currentCep += Math.floor(Math.random() * 20) + 5; // Incremento aleatório 5-25
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, this.delay));
      } catch (error) {
        console.error(`❌ Erro ${formattedCep}:`, error.message);
        currentCep += 50; // Pular mais CEPs em caso de erro
      }

      // Log de progresso
      if (attempts % 20 === 0) {
        console.log(`📊 ${expectedCity}: ${attempts} tentativas, ${found} encontrados`);
      }
    }

    return { processed, found, attempts };
  }

  async printMultiCityStats(results) {
    console.log(`\n\n🎉 === COLETA MULTI-CIDADES FINALIZADA ===`);
    console.log(`📊 Resumo Geral:`);
    console.log(`   - Total processado: ${results.totalProcessed}`);
    console.log(`   - Total encontrado: ${results.totalFound}`);

    console.log(`\n🏙️  Resultados por Cidade:`);
    for (const [cityName, cityResult] of Object.entries(results.citiesResults)) {
      if (cityResult.error) {
        console.log(`   ❌ ${cityName}: Erro - ${cityResult.error}`);
      } else {
        console.log(
          `   ✅ ${cityName}: ${cityResult.found} CEPs (${cityResult.processed} processados)`
        );
      }
    }

    // Estatísticas finais da base
    const totalInDB = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM enderecos', (err, row) => {
        resolve(row ? row.count : 0);
      });
    });

    const citiesInDB = await new Promise((resolve) => {
      this.db.all(
        'SELECT cidade, COUNT(*) as count FROM enderecos GROUP BY cidade ORDER BY count DESC',
        (err, rows) => {
          resolve(rows || []);
        }
      );
    });

    console.log(`\n📊 Base de Dados Atualizada:`);
    console.log(`   - Total de CEPs: ${totalInDB}`);
    console.log(`   - Cidades na base:`);
    citiesInDB.forEach((city, index) => {
      console.log(`     ${index + 1}. ${city.cidade}: ${city.count} CEPs`);
    });
  }
}

async function collectMultipleCities() {
  const collector = new MultiCityCEPCollector();

  try {
    await collector.init();

    const results = await collector.collectFromMultipleCities(30); // 30 CEPs por cidade
    await collector.printMultiCityStats(results);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  collectMultipleCities()
    .then(() => {
      console.log('\n✅ Coleta multi-cidades finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { MultiCityCEPCollector, collectMultipleCities };
