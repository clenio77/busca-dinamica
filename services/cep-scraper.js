const axios = require('axios');
const { getDatabase, removeAccents } = require('../database/init');

class CEPScraper {
  constructor() {
    this.delay = parseInt(process.env.SCRAPER_DELAY_MS) || 1000;
    this.maxRequestsPerMinute = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkRateLimit() {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;
    
    if (timeSinceReset >= 60000) { // 1 minuto
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - timeSinceReset;
      console.log(`Rate limit atingido. Aguardando ${waitTime}ms...`);
      await this.sleep(waitTime);
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }
  }

  async fetchFromViaCEP(cep) {
    try {
      await this.checkRateLimit();
      
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Busca-Dinamica-CEP/2.0'
        }
      });
      
      this.requestCount++;
      
      if (response.data && !response.data.erro) {
        return {
          cep: response.data.cep,
          logradouro: response.data.logradouro || '',
          bairro: response.data.bairro || '',
          cidade: response.data.localidade || '',
          estado: response.data.uf || 'MG',
          complemento: response.data.complemento || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao buscar CEP ${cep} no ViaCEP:`, error.message);
      return null;
    }
  }

  async fetchFromBrasilAPI(cep) {
    try {
      await this.checkRateLimit();
      
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Busca-Dinamica-CEP/2.0'
        }
      });
      
      this.requestCount++;
      
      if (response.data) {
        return {
          cep: response.data.cep,
          logradouro: response.data.street || '',
          bairro: response.data.neighborhood || '',
          cidade: response.data.city || '',
          estado: response.data.state || 'MG',
          complemento: ''
        };
      }
      
      return null;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`Erro ao buscar CEP ${cep} no BrasilAPI:`, error.message);
      }
      return null;
    }
  }

  async fetchCEPData(cep) {
    // Tentar ViaCEP primeiro, depois BrasilAPI
    let data = await this.fetchFromViaCEP(cep);
    
    if (!data) {
      await this.sleep(this.delay);
      data = await this.fetchFromBrasilAPI(cep);
    }
    
    return data;
  }

  async saveCEPData(data) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // Verificar se já existe
      db.get('SELECT id FROM enderecos WHERE cep = ?', [data.cep], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Atualizar registro existente
          const updateSQL = `
            UPDATE enderecos SET 
              logradouro = ?, logradouro_sem_acento = ?,
              bairro = ?, bairro_sem_acento = ?,
              cidade = ?, cidade_sem_acento = ?,
              estado = ?, complemento = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE cep = ?
          `;
          
          db.run(updateSQL, [
            data.logradouro, removeAccents(data.logradouro),
            data.bairro, removeAccents(data.bairro),
            data.cidade, removeAccents(data.cidade),
            data.estado, data.complemento,
            data.cep
          ], (err) => {
            if (err) reject(err);
            else resolve('updated');
          });
        } else {
          // Inserir novo registro
          const insertSQL = `
            INSERT INTO enderecos (
              cep, logradouro, logradouro_sem_acento,
              bairro, bairro_sem_acento,
              cidade, cidade_sem_acento,
              estado, complemento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          db.run(insertSQL, [
            data.cep,
            data.logradouro, removeAccents(data.logradouro),
            data.bairro, removeAccents(data.bairro),
            data.cidade, removeAccents(data.cidade),
            data.estado, data.complemento
          ], (err) => {
            if (err) reject(err);
            else resolve('inserted');
          });
        }
      });
    });
  }

  async scrapeMGCEPs(options = {}) {
    const { 
      startFrom = 30000000, 
      maxCEPs = 1000,
      onProgress = null 
    } = options;
    
    console.log(`🚀 Iniciando coleta de CEPs de MG a partir de ${startFrom}`);
    
    let processed = 0;
    let found = 0;
    let errors = 0;
    
    for (let cepNum = startFrom; cepNum <= 39999999 && processed < maxCEPs; cepNum++) {
      const cepStr = cepNum.toString().padStart(8, '0');
      const formattedCEP = `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
      
      try {
        const data = await this.fetchCEPData(formattedCEP);
        
        if (data && data.estado === 'MG' && data.logradouro) {
          const result = await this.saveCEPData(data);
          found++;
          console.log(`✅ ${formattedCEP}: ${data.logradouro}, ${data.cidade} (${result})`);
        }
        
        processed++;
        
        if (onProgress) {
          onProgress({ processed, found, errors, currentCEP: formattedCEP });
        }
        
        // Delay entre requisições
        await this.sleep(this.delay);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erro ao processar CEP ${formattedCEP}:`, error.message);
      }
      
      // Log de progresso a cada 100 CEPs
      if (processed % 100 === 0) {
        console.log(`📊 Progresso: ${processed} processados, ${found} encontrados, ${errors} erros`);
      }
    }
    
    console.log(`🏁 Coleta finalizada: ${processed} processados, ${found} encontrados, ${errors} erros`);
    
    return { processed, found, errors };
  }
}

module.exports = CEPScraper;
