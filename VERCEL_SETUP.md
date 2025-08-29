# 🚀 Configuração de Automação no Vercel

## 📋 Visão Geral

Este projeto está configurado para executar scripts de coleta de CEPs automaticamente no Vercel usando Cron Jobs.

## ⚙️ Configuração Inicial

### 1. Gerar Tokens de Segurança

```bash
node scripts/setup-vercel-env.js
```

Este comando irá gerar os tokens necessários para autenticação.

### 2. Configurar Variáveis de Ambiente no Vercel

Acesse o [Dashboard do Vercel](https://vercel.com/dashboard) e configure:

**Projeto > Settings > Environment Variables**

- `CRON_SECRET`: Token para autenticação dos cron jobs
- `MANUAL_EXECUTION_TOKEN`: Token para execução manual via API

### 3. Deploy do Projeto

```bash
vercel --prod
```

## 🕐 Cronogramas Automáticos

### Atualização Semanal
- **Quando**: Toda segunda-feira às 2h da manhã
- **Endpoint**: `/api/cron/update-ceps`
- **Função**: Verifica CEPs existentes e busca novos

### Coleta Diária
- **Quando**: Todos os dias às 6h da manhã  
- **Endpoint**: `/api/cron/collect-ceps`
- **Função**: Coleta conservadora de 10 CEPs por dia

## 🔧 Execução Manual

### Via API

```bash
# Coleta ultra conservadora
curl -X POST https://seu-projeto.vercel.app/api/manual/run-collector \
  -H "Authorization: Bearer SEU_MANUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "ultra-collect", "params": {"maxCeps": 20}}'

# Atualização semanal
curl -X POST https://seu-projeto.vercel.app/api/manual/run-collector \
  -H "Authorization: Bearer SEU_MANUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "weekly-update"}'

# Gerar JSON atualizado
curl -X POST https://seu-projeto.vercel.app/api/manual/run-collector \
  -H "Authorization: Bearer SEU_MANUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-json"}'
```

### Ações Disponíveis

- `ultra-collect`: Coleta conservadora de CEPs
- `weekly-update`: Atualização semanal completa
- `generate-json`: Gera arquivo JSON atualizado

## 📊 Monitoramento

### Logs do Vercel
- Acesse: Vercel Dashboard > Projeto > Functions
- Visualize logs em tempo real dos cron jobs

### Verificar Status
```bash
curl https://seu-projeto.vercel.app/api/manual/run-collector \
  -H "Authorization: Bearer SEU_MANUAL_TOKEN"
```

## 🔒 Segurança

- Todos os endpoints requerem autenticação via Bearer token
- Tokens são gerados aleatoriamente para máxima segurança
- Cron jobs só executam com o `CRON_SECRET` correto

## ⚠️ Limitações do Vercel

- **Timeout**: Máximo 300 segundos por execução
- **Memória**: Limitada conforme plano
- **Execuções**: Limitadas conforme plano

## 🛠️ Troubleshooting

### Cron Jobs não executam
1. Verificar se `CRON_SECRET` está configurado
2. Verificar logs no Vercel Dashboard
3. Confirmar que o projeto foi deployado

### Timeout em execuções
1. Reduzir `maxCeps` nos parâmetros
2. Otimizar scripts para execução mais rápida
3. Considerar dividir em múltiplas execuções

### Erro de autenticação
1. Verificar se tokens estão corretos
2. Regenerar tokens se necessário
3. Confirmar headers da requisição

## 📈 Próximos Passos

1. **Deploy inicial**: `vercel --prod`
2. **Configurar variáveis**: Usar script de setup
3. **Testar manualmente**: Usar endpoints de API
4. **Monitorar**: Acompanhar logs e execuções
5. **Ajustar**: Otimizar conforme necessário
