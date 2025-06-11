const axios = require('axios');
const { getDatabase, removeAccents } = require('../database/postgres-init');

class CEPScraperPostgres {
  constructor() {
    this.delay = parseInt(process.env.SCRAPER_DELAY_MS) || 2000; // Mais conservador no Render
    this.maxRequestsPerMinute = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 30; // Reduzido
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
        timeout: 10000, // Timeout maior para Render
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
      if (error.code !== 'ECONNABORTED') {
        console.error(`Erro ao buscar CEP ${cep} no ViaCEP:`, error.message);
      }
      return null;
    }
  }

  async fetchFromBrasilAPI(cep) {
    try {
      await this.checkRateLimit();
      
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
        timeout: 10000,
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
      if (error.response?.status !== 404 && error.code !== 'ECONNABORTED') {
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
    try {
      const db = await getDatabase();
      
      // Verificar se já existe
      const existingResult = await db.query('SELECT id FROM enderecos WHERE cep = $1', [data.cep]);
      
      if (existingResult.rows.length > 0) {
        // Atualizar registro existente
        await db.query(`
          UPDATE enderecos SET 
            logradouro = $1, logradouro_sem_acento = $2,
            bairro = $3, bairro_sem_acento = $4,
            cidade = $5, cidade_sem_acento = $6,
            estado = $7, complemento = $8,
            updated_at = CURRENT_TIMESTAMP
          WHERE cep = $9
        `, [
          data.logradouro, removeAccents(data.logradouro),
          data.bairro, removeAccents(data.bairro),
          data.cidade, removeAccents(data.cidade),
          data.estado, data.complemento,
          data.cep
        ]);
        
        return 'updated';
      } else {
        // Inserir novo registro
        await db.query(`
          INSERT INTO enderecos (
            cep, logradouro, logradouro_sem_acento,
            bairro, bairro_sem_acento,
            cidade, cidade_sem_acento,
            estado, complemento
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          data.cep,
          data.logradouro, removeAccents(data.logradouro),
          data.bairro, removeAccents(data.bairro),
          data.cidade, removeAccents(data.cidade),
          data.estado, data.complemento
        ]);
        
        return 'inserted';
      }
    } catch (error) {
      console.error('Erro ao salvar CEP:', error);
      throw error;
    }
  }

  async scrapeMGCEPs(options = {}) {
    const { 
      startFrom = 30000000, 
      maxCEPs = 500, // Reduzido para Render
      onProgress = null 
    } = options;
    
    console.log(`🚀 Iniciando coleta de CEPs de MG a partir de ${startFrom} (máx: ${maxCEPs})`);
    
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
        
        // Delay entre requisições (mais conservador)
        await this.sleep(this.delay);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erro ao processar CEP ${formattedCEP}:`, error.message);
      }
      
      // Log de progresso a cada 50 CEPs
      if (processed % 50 === 0) {
        console.log(`📊 Progresso: ${processed} processados, ${found} encontrados, ${errors} erros`);
      }
    }
    
    console.log(`🏁 Coleta finalizada: ${processed} processados, ${found} encontrados, ${errors} erros`);
    
    return { processed, found, errors };
  }
}

module.exports = CEPScraperPostgres;
