#!/usr/bin/env node

/**
 * Extrator de CEPs do arquivo HTML original
 * Extrai e adiciona CEPs na base de dados
 */

const fs = require('fs');
const path = require('path');
const { getDatabase, removeAccents, initDatabase } = require('../database/init');

class HTMLCEPExtractor {
  constructor() {
    this.db = null;
    this.stats = {
      extracted: 0,
      added: 0,
      duplicates: 0,
      errors: 0
    };
  }

  async init() {
    await initDatabase();
    this.db = getDatabase();
    console.log('📄 Extrator de CEPs do HTML inicializado\n');
  }

  extractCEPsFromHTML(htmlContent) {
    const ceps = [];
    
    // Regex para encontrar padrões de CEP no HTML
    // Procura por: |38xxx-xxx| ou |   38xxx-xxx   | ou similar
    const cepRegex = /\|\s*(\d{5}-?\d{3})\s*\|/g;
    
    // Regex para extrair informações completas das linhas <li>
    const lineRegex = /<li>\s*<a[^>]*>\s*([^<]+)<strong[^>]*>\s*\|[^|]*\|[^<]*<\/strong>\s*([^<]+)\s*<\/a><\/li>/g;
    
    let match;
    
    // Extrair linhas completas
    while ((match = lineRegex.exec(htmlContent)) !== null) {
      const fullText = match[0];
      const beforeStrong = match[1].trim();
      const afterStrong = match[2].trim();
      
      // Extrair CEP da linha
      const cepMatch = fullText.match(/\|\s*(\d{5}-?\d{3})\s*\|/);
      
      if (cepMatch) {
        let cep = cepMatch[1];
        
        // Normalizar CEP (adicionar hífen se não tiver)
        if (!cep.includes('-')) {
          cep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
        }
        
        // Extrair logradouro (antes do <strong>)
        let logradouro = beforeStrong
          .replace(/^\s*Rua\s+/, 'Rua ')
          .replace(/^\s*Avenida\s+/, 'Avenida ')
          .replace(/^\s*Pc\s+/, 'Praça ')
          .replace(/^\s*Frua\s+/, 'Rua ')
          .trim();
        
        // Extrair bairro/cidade (depois do </strong>)
        let location = afterStrong.trim();
        
        // Tentar separar bairro de cidade se possível
        let bairro = '';
        let cidade = 'Uberlândia'; // Padrão
        
        // Se a localização contém informações específicas
        if (location) {
          // Casos especiais conhecidos
          if (location.includes('Cruzeiro dos Peixotos')) {
            bairro = 'Cruzeiro dos Peixotos';
          } else if (location.includes('Martinesia')) {
            bairro = 'Martinesia';
          } else if (location.includes('Tapuirama')) {
            bairro = 'Tapuirama';
          } else if (location.includes('Miraporanga')) {
            bairro = 'Miraporanga';
          } else if (location.includes('Shopping Park')) {
            bairro = 'Shopping Park';
          } else if (location.includes('Vigilato Pereira')) {
            bairro = 'Vigilato Pereira';
          } else if (location.includes('Laranjeiras')) {
            bairro = 'Laranjeiras';
          } else if (location.includes('Vila Marielza')) {
            bairro = 'Vila Marielza';
          } else {
            bairro = location;
          }
        }
        
        // Validar se é um CEP válido de Uberlândia (38xxx-xxx)
        if (cep.startsWith('384')) {
          ceps.push({
            cep: cep,
            logradouro: logradouro,
            bairro: bairro,
            cidade: cidade,
            estado: 'MG',
            complemento: ''
          });
        }
      }
    }
    
    return ceps;
  }

  async cepExistsInDB(cep) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM enderecos WHERE cep = ?', [cep], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }

  async saveCepData(data) {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO enderecos (
          cep, logradouro, logradouro_sem_acento,
          bairro, bairro_sem_acento,
          cidade, cidade_sem_acento,
          estado, complemento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(insertSQL, [
        data.cep,
        data.logradouro, removeAccents(data.logradouro),
        data.bairro, removeAccents(data.bairro),
        data.cidade, removeAccents(data.cidade),
        data.estado, data.complemento
      ], (err) => {
        if (err) reject(err);
        else resolve('inserted');
      });
    });
  }

  async processHTMLFile(filePath) {
    console.log(`📂 Lendo arquivo: ${filePath}`);
    
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ Arquivo lido com sucesso (${htmlContent.length} caracteres)\n`);
      
      // Extrair CEPs do HTML
      console.log('🔍 Extraindo CEPs do HTML...');
      const extractedCeps = this.extractCEPsFromHTML(htmlContent);
      this.stats.extracted = extractedCeps.length;
      
      console.log(`📊 CEPs extraídos: ${extractedCeps.length}\n`);
      
      // Processar cada CEP
      for (const cepData of extractedCeps) {
        try {
          // Verificar se já existe
          const exists = await this.cepExistsInDB(cepData.cep);
          
          if (exists) {
            this.stats.duplicates++;
            console.log(`⏭️  ${cepData.cep} já existe na base`);
          } else {
            // Adicionar à base
            await this.saveCepData(cepData);
            this.stats.added++;
            console.log(`✅ ${cepData.cep}: ${cepData.logradouro}, ${cepData.bairro}`);
          }
          
        } catch (error) {
          this.stats.errors++;
          console.error(`❌ Erro ao processar ${cepData.cep}:`, error.message);
        }
      }
      
      return this.stats;
      
    } catch (error) {
      console.error('❌ Erro ao ler arquivo:', error.message);
      throw error;
    }
  }

  async printFinalStats() {
    // Estatísticas da base após importação
    const totalInDB = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM enderecos WHERE cidade_sem_acento LIKE ?', 
        ['%UBERLANDIA%'], (err, row) => {
          resolve(row ? row.count : 0);
        });
    });

    console.log(`\n🎉 Extração do HTML finalizada!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - CEPs extraídos do HTML: ${this.stats.extracted}`);
    console.log(`   - CEPs adicionados à base: ${this.stats.added}`);
    console.log(`   - CEPs duplicados (ignorados): ${this.stats.duplicates}`);
    console.log(`   - Erros: ${this.stats.errors}`);
    console.log(`   - Total na base (Uberlândia): ${totalInDB}`);
    
    if (this.stats.added > 0) {
      console.log(`\n📋 Alguns CEPs adicionados:`);
      const recentCeps = await new Promise((resolve) => {
        this.db.all(`
          SELECT * FROM enderecos 
          WHERE cidade_sem_acento LIKE '%UBERLANDIA%' 
          ORDER BY id DESC 
          LIMIT 5
        `, (err, rows) => {
          resolve(rows || []);
        });
      });

      recentCeps.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.cep}: ${row.logradouro}, ${row.bairro}`);
      });
    }
  }
}

async function extractHTMLCeps() {
  const extractor = new HTMLCEPExtractor();
  
  try {
    await extractor.init();
    
    // Caminho para o arquivo HTML
    const htmlFilePath = path.join(__dirname, '../../temp-repo/index.html');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(htmlFilePath)) {
      throw new Error(`Arquivo não encontrado: ${htmlFilePath}`);
    }
    
    // Processar arquivo
    await extractor.processHTMLFile(htmlFilePath);
    await extractor.printFinalStats();
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  extractHTMLCeps()
    .then(() => {
      console.log('\n✅ Extração finalizada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { HTMLCEPExtractor, extractHTMLCeps };