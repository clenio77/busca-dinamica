#!/bin/bash

echo "🚀 Iniciando Busca Dinâmica CEP 2.0..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 16+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o banco de dados existe
if [ ! -f "database/ceps.db" ]; then
    echo "🔧 Configurando banco de dados inicial..."
    npm run setup-db
fi

echo "✅ Tudo pronto! Iniciando servidor..."
npm start
