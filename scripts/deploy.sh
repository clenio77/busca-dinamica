#!/bin/bash

echo "🚀 Deploy - Busca Dinâmica CEP 2.0"
echo "=================================="

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

# Verificar PM2 (para produção)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Backup da base atual (se existir)
if [ -f "database/ceps.db" ]; then
    echo "💾 Criando backup da base atual..."
    mkdir -p backups
    cp database/ceps.db "backups/backup-deploy-$(date +%Y%m%d-%H%M%S).db"
fi

# Instalar/atualizar dependências
echo "📦 Instalando dependências..."
npm ci --production

# Configurar ambiente de produção
echo "⚙️ Configurando ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Arquivo .env criado. Configure as variáveis necessárias."
fi

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."
npm run setup-db

# Testar sistema
echo "🧪 Testando sistema..."
node test-system.js
if [ $? -ne 0 ]; then
    echo "❌ Testes falharam. Verifique a configuração."
    exit 1
fi

# Configurar PM2
echo "🔧 Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'busca-cep',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Criar diretórios necessários
mkdir -p logs backups

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js

# Configurar inicialização automática
echo "⚡ Configurando inicialização automática..."
pm2 startup
pm2 save

# Configurar nginx (opcional)
if command -v nginx &> /dev/null; then
    echo "🌐 Configurando Nginx..."
    cat > /tmp/busca-cep-nginx.conf << EOF
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    echo "📝 Configuração do Nginx criada em /tmp/busca-cep-nginx.conf"
    echo "   Copie para /etc/nginx/sites-available/ e ative conforme necessário"
fi

# Configurar firewall (opcional)
if command -v ufw &> /dev/null; then
    echo "🔒 Configurando firewall..."
    ufw allow 22    # SSH
    ufw allow 80    # HTTP
    ufw allow 443   # HTTPS
    echo "   Firewall configurado para portas 22, 80, 443"
fi

# Mostrar status
echo ""
echo "✅ Deploy concluído com sucesso!"
echo "================================"
echo "📊 Status da aplicação:"
pm2 status

echo ""
echo "🔗 URLs:"
echo "   - Aplicação: http://localhost:3000"
echo "   - Admin: http://localhost:3000/admin.html"

echo ""
echo "📋 Comandos úteis:"
echo "   - Ver logs: pm2 logs busca-cep"
echo "   - Reiniciar: pm2 restart busca-cep"
echo "   - Parar: pm2 stop busca-cep"
echo "   - Status: pm2 status"

echo ""
echo "🔧 Próximos passos:"
echo "   1. Configure o arquivo .env com suas preferências"
echo "   2. Execute 'npm run scraper' para coletar mais CEPs"
echo "   3. Configure SSL/HTTPS se necessário"
echo "   4. Configure backup externo da base de dados"

echo ""
echo "🎉 Sistema pronto para produção!"
