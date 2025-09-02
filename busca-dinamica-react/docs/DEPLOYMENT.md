# 🚀 Guia de Deploy e Monitoramento

> **Guia completo para deploy e monitoramento do Busca Dinâmica 2.0 em produção**

## 📋 **Índice**

1. [Preparação para Deploy](#preparação-para-deploy)
2. [Deploy na Render.com](#deploy-na-rendercom)
3. [Deploy no Vercel](#deploy-no-vercel)
4. [Deploy no Netlify](#deploy-no-netlify)
5. [Deploy no Heroku](#deploy-no-heroku)
6. [Deploy no AWS](#deploy-no-aws)
7. [Monitoramento](#monitoramento)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Escalabilidade](#escalabilidade)

## 🔧 **Preparação para Deploy**

### **Checklist Pré-Deploy**

```bash
# ✅ Verificar se todos os testes passam
npm run test:all

# ✅ Verificar cobertura de testes
npm run test:coverage

# ✅ Verificar linting
npm run lint

# ✅ Verificar segurança
npm run security

# ✅ Build de produção
npm run build

# ✅ Teste local da build
npm run dev:render
```

### **Variáveis de Ambiente de Produção**

```env
# Servidor
NODE_ENV=production
PORT=3000

# Banco de dados
DATABASE_URL=postgresql://user:pass@host:5432/busca_dinamica
DB_TYPE=postgres

# Segurança
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://yourdomain.com

# Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Monitoramento
MONITORING_USERNAME=admin
MONITORING_PASSWORD=secure-password-here

# Redis (opcional)
REDIS_URL=redis://host:6379

# Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### **Configuração de Domínio**

```bash
# DNS Records
A     @     123.456.789.123
CNAME www   yourdomain.com
CNAME api   api.yourdomain.com

# SSL Certificate
# Configurar certificado SSL automático ou manual
```

## ☁️ **Deploy na Render.com**

### **Configuração Inicial**

1. **Conecte seu repositório GitHub**
2. **Configure o serviço**:
   - **Name**: `busca-dinamica`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `busca-dinamica-react`

### **Variáveis de Ambiente**

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/busca_dinamica
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
MONITORING_USERNAME=admin
MONITORING_PASSWORD=secure-password
```

### **Configuração de Banco**

```bash
# Criar banco PostgreSQL no Render
# Configurar DATABASE_URL
# Executar migrações

npm run setup-db
```

### **Deploy Automático**

```yaml
# render.yaml
services:
  - type: web
    name: busca-dinamica
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: busca-dinamica-db
          property: connectionString
```

## ⚡ **Deploy no Vercel**

### **Configuração**

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **Deploy via CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
```

## 🌐 **Deploy no Netlify**

### **Configuração**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Funções Serverless**

```javascript
// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Configurar rotas da API
app.use('/api', require('../routes/cep'));

exports.handler = serverless(app);
```

## 🏗️ **Deploy no Heroku**

### **Configuração**

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Criar app
heroku create busca-dinamica

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku master
```

### **Procfile**

```
web: npm start
```

## ☁️ **Deploy no AWS**

### **EC2 Setup**

```bash
# Conectar via SSH
ssh -i key.pem ubuntu@your-ec2-instance

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clone do repositório
git clone https://github.com/clenio77/busca-dinamica.git
cd busca-dinamica/busca-dinamica-react

# Instalar dependências
npm install
npm run build

# Configurar PM2
pm2 start server.js --name "busca-dinamica"
pm2 startup
pm2 save
```

### **RDS Database**

```bash
# Conectar ao RDS
psql -h your-rds-endpoint -U username -d database_name

# Executar migrações
\i migrations/001_initial_schema.sql
```

### **Load Balancer**

```yaml
# AWS Application Load Balancer
Target Group:
  - Port: 3000
  - Protocol: HTTP
  - Health Check Path: /health

Listener:
  - Port: 80
  - Protocol: HTTP
  - Default Action: Forward to Target Group
```

## 📊 **Monitoramento**

### **Health Checks**

```bash
# Health check básico
curl https://yourdomain.com/health

# Health check detalhado
curl https://yourdomain.com/health/detailed

# Resposta esperada
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 15
  },
  "memory": {
    "used": 128,
    "total": 512
  }
}
```

### **Métricas de Sistema**

```bash
# Acessar métricas
curl -u admin:password https://yourdomain.com/monitoring/summary

# Resposta esperada
{
  "system": {
    "uptime": 3600,
    "cpu": 25.5,
    "memory": 45.2
  },
  "application": {
    "requests": 1500,
    "errors": 5,
    "responseTime": 125
  },
  "business": {
    "searches": 1200,
    "successRate": 98.5
  },
  "security": {
    "attacks": 0,
    "rateLimits": 12
  }
}
```

### **Logs Estruturados**

```javascript
// Exemplo de log estruturado
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Busca de endereços realizada",
  "query": "avenida paulista",
  "resultsCount": 15,
  "responseTime": 125,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "requestId": "req-123456"
}
```

### **Alertas Automáticos**

```javascript
// Configuração de alertas
const alertConfig = {
  rules: [
    {
      name: "High Response Time",
      condition: "responseTime > 1000",
      severity: "warning",
      cooldown: 300000 // 5 minutos
    },
    {
      name: "High Error Rate",
      condition: "errorRate > 5",
      severity: "critical",
      cooldown: 60000 // 1 minuto
    },
    {
      name: "High CPU Usage",
      condition: "cpu > 80",
      severity: "warning",
      cooldown: 300000
    }
  ]
};
```

## 💾 **Backup e Recuperação**

### **Backup do Banco de Dados**

```bash
# Backup PostgreSQL
pg_dump -h host -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup SQLite
cp database/addresses.db backup_$(date +%Y%m%d_%H%M%S).db

# Backup automático (cron)
0 2 * * * /usr/bin/pg_dump -h host -U username -d database_name > /backups/backup_$(date +\%Y\%m\%d).sql
```

### **Backup de Arquivos**

```bash
# Backup de logs
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/

# Backup de configurações
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env package.json
```

### **Script de Recuperação**

```bash
#!/bin/bash
# recovery.sh

echo "Iniciando recuperação..."

# Restaurar banco de dados
psql -h host -U username -d database_name < backup_20240115_143000.sql

# Restaurar arquivos
tar -xzf logs_backup_20240115.tar.gz
tar -xzf config_backup_20240115.tar.gz

# Reiniciar aplicação
pm2 restart busca-dinamica

echo "Recuperação concluída!"
```

## 📈 **Escalabilidade**

### **Horizontal Scaling**

```yaml
# Docker Compose para múltiplas instâncias
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      replicas: 3
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: busca_dinamica
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### **Load Balancing**

```nginx
# nginx.conf
upstream busca_dinamica {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://busca_dinamica;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Cache Strategy**

```javascript
// Estratégia de cache em camadas
const cacheStrategy = {
  // Cache de aplicação (Redis)
  application: {
    ttl: 3600, // 1 hora
    maxSize: 1000
  },
  
  // Cache de CDN
  cdn: {
    ttl: 86400, // 24 horas
    headers: {
      'Cache-Control': 'public, max-age=86400'
    }
  },
  
  // Cache de navegador
  browser: {
    ttl: 300, // 5 minutos
    headers: {
      'Cache-Control': 'private, max-age=300'
    }
  }
};
```

## 🔍 **Troubleshooting**

### **Problemas Comuns**

```bash
# 1. Aplicação não inicia
pm2 logs busca-dinamica
pm2 restart busca-dinamica

# 2. Banco de dados não conecta
psql -h host -U username -d database_name
# Verificar DATABASE_URL

# 3. Rate limiting muito agressivo
# Ajustar configurações em middleware/rateLimit.js

# 4. Logs muito verbosos
# Ajustar LOG_LEVEL para 'warn' ou 'error'
```

### **Comandos Úteis**

```bash
# Verificar status da aplicação
pm2 status
pm2 monit

# Verificar logs em tempo real
pm2 logs busca-dinamica --lines 100

# Verificar uso de recursos
htop
df -h
free -h

# Verificar conectividade
curl -I https://yourdomain.com/health
ping yourdomain.com
nslookup yourdomain.com
```

## 📞 **Suporte**

### **Contatos de Emergência**

- **Email**: suporte@buscadinamica.com
- **Discord**: [Servidor da Comunidade](https://discord.gg/buscadinamica)
- **GitHub Issues**: [Issues](https://github.com/clenio77/busca-dinamica/issues)

### **Documentação Adicional**

- [README.md](../README.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [API Documentation](./api-swagger.yaml)

---

**Deploy bem-sucedido! 🚀**
