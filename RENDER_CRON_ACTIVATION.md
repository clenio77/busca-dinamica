# 🚀 Ativação de Cron Jobs no Render - Guia Completo

## 📋 **Visão Geral**

Este guia detalha como ativar a **extração automática de CEPs** no ambiente Render, transformando a aplicação de estática para totalmente automatizada.

## ✅ **O que será ativado:**

1. **Coleta Diária Automática**: 10 CEPs por dia às 6h da manhã
2. **Atualização Semanal**: Verificação de mudanças às 2h de segunda-feira
3. **Execução Manual**: Endpoints para controle via API
4. **Monitoramento**: Status em tempo real dos cron jobs

## 🔧 **Passo a Passo para Ativação**

### **Passo 1: Executar Script de Configuração**

```bash
# No diretório do projeto
npm run setup-render
```

Este comando irá:
- ✅ Gerar tokens de segurança únicos
- ✅ Criar arquivo `.env.render` com configurações
- ✅ Mostrar todas as variáveis necessárias
- ✅ Fornecer exemplos de uso

### **Passo 2: Configurar Variáveis no Render Dashboard**

1. **Acesse**: [Dashboard do Render](https://dashboard.render.com)
2. **Selecione**: Seu Web Service "busca-cep"
3. **Vá em**: "Environment" > "Environment Variables"
4. **Adicione**: Cada variável mostrada pelo script

**Variáveis Essenciais:**
```bash
NODE_ENV=production
DISABLE_CRON=false
CRON_SECRET=<token-gerado>
MANUAL_EXECUTION_TOKEN=<token-gerado>
UPDATE_SCHEDULE=0 2 * * 1
COLLECT_SCHEDULE=0 6 * * *
```

### **Passo 3: Fazer Deploy das Alterações**

```bash
# Commit das mudanças
git add .
git commit -m "Ativar cron jobs no Render"
git push origin main
```

O Render fará deploy automático e os cron jobs serão ativados.

## 🔍 **Verificação da Ativação**

### **1. Health Check**
```bash
curl https://seu-app.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "cronEnabled": true,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### **2. Status dos Cron Jobs**
```bash
curl https://seu-app.onrender.com/api/admin/cron/status
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "cronEnabled": true,
    "updateService": {
      "isRunning": false,
      "lastUpdate": "2024-01-15T02:00:00.000Z"
    },
    "schedules": {
      "weeklyUpdate": "0 2 * * 1",
      "dailyCollect": "0 6 * * *"
    }
  }
}
```

### **3. Logs do Servidor**
No dashboard do Render, verifique os logs para mensagens como:
```
⏰ Inicializando cron jobs...
✅ Serviço de atualização semanal iniciado
✅ Cron job de coleta configurado: 0 6 * * *
⏰ Cron jobs: Habilitados
```

## 🧪 **Teste dos Cron Jobs**

### **Teste de Coleta Manual**
```bash
curl -X POST https://seu-app.onrender.com/api/admin/cron/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "collect-ceps", "params": {"maxCEPs": 5}}'
```

### **Teste de Atualização Semanal**
```bash
curl -X POST https://seu-app.onrender.com/api/admin/cron/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "weekly-update"}'
```

## 📊 **Monitoramento e Logs**

### **Logs Automáticos**
Os cron jobs geram logs automáticos:
- ✅ Início de execução
- ✅ Progresso da coleta
- ✅ CEPs encontrados
- ✅ Erros e warnings
- ✅ Estatísticas finais

### **Métricas Disponíveis**
```bash
# Estatísticas gerais
GET /api/admin/stats

# Status dos cron jobs
GET /api/admin/cron/status

# Health check
GET /health
```

## ⚠️ **Troubleshooting Comum**

### **Problema 1: Cron jobs não iniciam**
**Sintoma**: Logs mostram "Cron jobs desabilitados"
**Solução**: Verificar se `DISABLE_CRON=false` está configurado

### **Problema 2: Erro de timeout**
**Sintoma**: Coleta para após 25 segundos
**Solução**: Reduzir `maxCEPs` para valores menores (5-10)

### **Problema 3: Erro de conexão com banco**
**Sintoma**: "PostgreSQL não inicializado"
**Solução**: Verificar se `DATABASE_URL` está configurada

### **Problema 4: Rate limiting das APIs**
**Sintoma**: Muitos erros 429 ou timeouts
**Solução**: Aumentar `SCRAPER_DELAY_MS` para 3000-5000

## 🔒 **Segurança e Limitações**

### **Proteções Implementadas**
- ✅ Rate limiting por IP
- ✅ Tokens de autenticação únicos
- ✅ Timeout de execução
- ✅ Validação de parâmetros
- ✅ Logs de auditoria

### **Limitações do Render Free**
- ⚠️ Timeout máximo: 30 segundos
- ⚠️ Memória limitada
- ⚠️ Sem cron jobs nativos
- ⚠️ Filesystem efêmero

## 📈 **Otimizações Recomendadas**

### **Para Ambiente Free**
```bash
SCRAPER_DELAY_MS=3000          # 3s entre requisições
MAX_REQUESTS_PER_MINUTE=20     # Reduzir para 20/min
```

### **Para Ambiente Pago**
```bash
SCRAPER_DELAY_MS=1000          # 1s entre requisições
MAX_REQUESTS_PER_MINUTE=60     # Aumentar para 60/min
```

## 🎯 **Resultado Final**

Após a ativação, sua aplicação terá:

✅ **Coleta automática diária** de novos CEPs
✅ **Atualização semanal** de dados existentes
✅ **Execução manual** via API
✅ **Monitoramento completo** em tempo real
✅ **Logs detalhados** de todas as operações
✅ **Segurança robusta** com autenticação

## 🚀 **Próximos Passos**

1. **Monitorar execução** dos primeiros cron jobs
2. **Ajustar parâmetros** conforme necessário
3. **Expandir para outras cidades** de MG
4. **Implementar alertas** para falhas
5. **Adicionar dashboard** de métricas

---

**🎉 Parabéns!** Sua aplicação agora está totalmente automatizada no Render!

Para suporte adicional, consulte:
- 📖 [Documentação Completa](README.md)
- 🐛 [Issues no GitHub](https://github.com/clenio77/busca-dinamica/issues)
- 📧 [Email de Suporte](mailto:clenioti@gmail.com)