#!/usr/bin/env node

/**
 * Script para adicionar novos CEPs de extrações à base unificada
 * Suporta CSV, JSON e dados diretos
 */

const { getDatabase, initDatabase } = require('../database/init');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class ExtractionAdder {
  constructor() {
    this.db = null;
    this.stats = {
      processed: 0,
      added: 0,
      duplicates: 0,
      errors: 0
    };
  }

  async init() {
    console.log('🔄 Inicializando adicionador de extrações...\n');
    await initDatabase();
    this.db = getDatabase();
  }

  // Normalizar dados de entrada
  normalizeData(rawData) {
    return {
      cep: this.normalizeCep(rawData.cep),
      logradouro: rawData.logradouro?.trim() || '',
      bairro: rawData.bairro?.trim() || '',
      cidade: rawData.cidade?.trim() || rawData.localidade?.split('/')[0]?.trim() || '',
      estado: rawData.estado?.trim() || rawData.localidade?.split('/')[1]?.trim() || '',
      localidade: rawData.localidade?.trim() || `${rawData.cidade}/${rawData.estado}`
    };
  }

  // Normalizar CEP (remover caracteres especiais)
  normalizeCep(cep) {
    if (!cep) return '';
    return cep.toString().replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  // Validar dados
  validateData(data) {
    if (!data.cep || data.cep.length < 8) return false;
    if (!data.logradouro) return false;
    if (!data.cidade) return false;
    if (!data.estado) return false;
    return true;
  }

  // Adicionar um registro
  async addRecord(rawData) {
    try {
      const data = this.normalizeData(rawData);
      
      if (!this.validateData(data)) {
        console.log(`⚠️  Dados inválidos: ${JSON.stringify(rawData)}`);
        this.stats.errors++;
        return false;
      }

      // Verificar duplicata
      const existing = this.db.prepare(`
        SELECT id FROM enderecos WHERE cep = ?
      `).get(data.cep);

      if (existing) {
        console.log(`⏭️  ${data.cep} já existe`);
        this.stats.duplicates++;
        return false;
      }

      // Inserir novo registro
      this.db.prepare(`
        INSERT INTO enderecos (cep, logradouro, bairro, cidade, estado, localidade)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        data.cep,
        data.logradouro,
        data.bairro,
        data.cidade,
        data.estado,
        data.localidade
      );

      console.log(`✅ ${data.cep} - ${data.logradouro}, ${data.cidade}/${data.estado}`);
      this.stats.added++;
      return true;

    } catch (error) {
      console.error(`❌ Erro ao adicionar registro:`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  // Adicionar de arquivo CSV
  async addFromCSV(filePath) {
    console.log(`📄 Processando arquivo CSV: ${filePath}\n`);
    
    return new Promise((resolve, reject) => {
      const records = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          records.push(data);
        })
        .on('end', async () => {
          console.log(`📊 Encontrados ${records.length} registros no CSV\n`);
          
          for (const record of records) {
            await this.addRecord(record);
            this.stats.processed++;
          }
          
          resolve();
        })
        .on('error', reject);
    });
  }

  // Adicionar de arquivo JSON
  async addFromJSON(filePath) {
    console.log(`📄 Processando arquivo JSON: ${filePath}\n`);
    
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const records = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    console.log(`📊 Encontrados ${records.length} registros no JSON\n`);
    
    for (const record of records) {
      await this.addRecord(record);
      this.stats.processed++;
    }
  }

  // Adicionar dados diretos (array)
  async addFromArray(records) {
    console.log(`📊 Processando ${records.length} registros diretos\n`);
    
    for (const record of records) {
      await this.addRecord(record);
      this.stats.processed++;
    }
  }

  // Regenerar arquivo JSON da aplicação
  async regenerateJSON() {
    console.log('\n🔄 Regenerando arquivo JSON da aplicação...');
    
    const allRecords = this.db.prepare(`
      SELECT cep, logradouro, bairro, cidade, estado, localidade
      FROM enderecos
      ORDER BY estado, cidade, logradouro
    `).all();

    const jsonData = allRecords.map(record => ({
      cep: record.cep,
      logradouro: record.logradouro,
      bairro: record.bairro,
      cidade: record.cidade,
      estado: record.estado,
      localidade: record.localidade
    }));

    const jsonPath = path.join(__dirname, '../public/ceps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Arquivo JSON atualizado: ${jsonPath}`);
    console.log(`📊 Total de registros: ${jsonData.length}`);

    return jsonData.length;
  }

  // Mostrar estatísticas
  showStats() {
    console.log('\n📈 Estatísticas da operação:');
    console.log(`   📊 Processados: ${this.stats.processed}`);
    console.log(`   ✅ Adicionados: ${this.stats.added}`);
    console.log(`   ⏭️  Duplicatas: ${this.stats.duplicates}`);
    console.log(`   ❌ Erros: ${this.stats.errors}`);
    console.log(`   📈 Taxa de sucesso: ${((this.stats.added / this.stats.processed) * 100).toFixed(1)}%`);
  }

  // Método principal
  async addExtractions(source, type = 'auto') {
    try {
      await this.init();
      
      // Detectar tipo automaticamente se não especificado
      if (type === 'auto' && typeof source === 'string') {
        if (source.endsWith('.csv')) type = 'csv';
        else if (source.endsWith('.json')) type = 'json';
        else type = 'file';
      }

      // Processar baseado no tipo
      switch (type) {
        case 'csv':
          await this.addFromCSV(source);
          break;
        case 'json':
          await this.addFromJSON(source);
          break;
        case 'array':
          await this.addFromArray(source);
          break;
        default:
          throw new Error(`Tipo não suportado: ${type}`);
      }

      // Regenerar JSON da aplicação
      const totalRecords = await this.regenerateJSON();
      
      // Mostrar estatísticas
      this.showStats();
      
      console.log(`\n🎉 Extração adicionada com sucesso!`);
      console.log(`📊 Total na base: ${totalRecords} registros`);
      
      return this.stats;
      
    } catch (error) {
      console.error('❌ Erro ao adicionar extrações:', error);
      throw error;
    }
  }
}

// Função de conveniência para uso direto
async function addExtractions(source, type = 'auto') {
  const adder = new ExtractionAdder();
  return await adder.addExtractions(source, type);
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Uso:');
    console.log('  node add-new-extractions.js <arquivo.csv>');
    console.log('  node add-new-extractions.js <arquivo.json>');
    console.log('  node add-new-extractions.js <arquivo> <tipo>');
    process.exit(1);
  }

  const [source, type] = args;
  addExtractions(source, type).catch(console.error);
}

module.exports = { ExtractionAdder, addExtractions };
