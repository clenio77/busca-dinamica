# 🗄️ Sistema de Base Unificada de CEPs

## 📋 Visão Geral

Este sistema permite gerenciar uma base unificada de CEPs com capacidade de adicionar novos dados de extrações automaticamente.

## 🎯 Funcionalidades

- ✅ **Base unificada** com múltiplos estados brasileiros
- ✅ **Adição automática** de novos CEPs de extrações
- ✅ **Detecção de duplicatas** automática
- ✅ **Validação de dados** antes da inserção
- ✅ **Estatísticas** por estado em tempo real
- ✅ **Suporte a CSV e JSON** para importação

## 📊 Status Atual da Base

**Total de registros:** 79 CEPs  
**Estados disponíveis:** 12 estados

### Distribuição por Estado:
- **SP** - São Paulo: 12 registros
- **BA** - Bahia: 10 registros  
- **MG** - Minas Gerais: 10 registros
- **PR** - Paraná: 10 registros
- **RJ** - Rio de Janeiro: 10 registros
- **RS** - Rio Grande do Sul: 10 registros
- **PE** - Pernambuco: 8 registros
- **CE** - Ceará: 3 registros
- **GO** - Goiás: 2 registros
- **SC** - Santa Catarina: 2 registros
- **AL** - Alagoas: 1 registro
- **PB** - Paraíba: 1 registro

## 🚀 Como Usar

### 1. Criar Base Inicial (já feito)
```bash
node scripts/create-sample-database.js
```

### 2. Adicionar Novos CEPs de Extrações

#### Opção A: Arquivo CSV
```bash
node scripts/add-new-extractions.js dados-extraidos.csv
```

#### Opção B: Arquivo JSON
```bash
node scripts/add-new-extractions.js dados-extraidos.json
```

#### Opção C: Teste com dados de exemplo
```bash
node scripts/test-add-extractions.js
```

### 3. Verificar Status da Base
```bash
# Ver total de registros
jq length public/ceps.json

# Ver registros por estado
jq -r '.[].estado' public/ceps.json | sort | uniq -c | sort -nr
```

## 📁 Estrutura de Arquivos

```
scripts/
├── create-sample-database.js     # Criar base inicial com múltiplos estados
├── add-new-extractions.js        # Adicionar novos CEPs (principal)
├── test-add-extractions.js       # Teste de adição com dados de exemplo
└── generate-unified-json.js      # Gerar JSON da base SQLite (backup)

public/
└── ceps.json                     # Base unificada (usado pela aplicação)
```

## 📝 Formato dos Dados

### Entrada (CSV/JSON)
```json
{
  "cep": "01234-567",
  "logradouro": "Rua Nova Teste",
  "bairro": "Vila Teste", 
  "cidade": "São Paulo",
  "estado": "SP"
}
```

### Saída (aplicação)
```json
{
  "cep": "01234-567",
  "logradouro": "Rua Nova Teste",
  "bairro": "Vila Teste",
  "cidade": "São Paulo", 
  "estado": "SP",
  "localidade": "São Paulo/SP"
}
```

## 🔧 Scripts Disponíveis

### `add-new-extractions.js` (Principal)
**Função:** Adicionar novos CEPs à base unificada  
**Uso:** `node scripts/add-new-extractions.js <arquivo>`  
**Recursos:**
- ✅ Detecção automática de formato (CSV/JSON)
- ✅ Validação de dados obrigatórios
- ✅ Prevenção de duplicatas por CEP
- ✅ Normalização automática de CEPs
- ✅ Estatísticas detalhadas da operação
- ✅ Regeneração automática do JSON da aplicação

### `create-sample-database.js`
**Função:** Criar base inicial com dados de exemplo  
**Uso:** `node scripts/create-sample-database.js`  
**Recursos:**
- ✅ 70+ CEPs de exemplo de 9 estados
- ✅ Dados reais de endereços conhecidos
- ✅ Distribuição equilibrada por estado

### `test-add-extractions.js`
**Função:** Testar adição com dados de exemplo  
**Uso:** `node scripts/test-add-extractions.js`  
**Recursos:**
- ✅ Adiciona 9 CEPs de teste
- ✅ Inclui 3 novos estados (CE, SC, GO)
- ✅ Demonstra prevenção de duplicatas

## 🎯 Fluxo de Trabalho Recomendado

### Para Novas Extrações:

1. **Extrair dados** com seu scraper favorito
2. **Salvar em CSV ou JSON** no formato esperado
3. **Executar script de adição:**
   ```bash
   node scripts/add-new-extractions.js nova-extracao.csv
   ```
4. **Verificar resultados** nas estatísticas mostradas
5. **Testar aplicação** - dados são atualizados automaticamente

### Exemplo de Extração CSV:
```csv
cep,logradouro,bairro,cidade,estado
12345-678,Rua Nova,Centro,Cidade Nova,SP
23456-789,Av. Principal,Vila Nova,Outra Cidade,RJ
```

### Exemplo de Extração JSON:
```json
[
  {
    "cep": "12345-678",
    "logradouro": "Rua Nova", 
    "bairro": "Centro",
    "cidade": "Cidade Nova",
    "estado": "SP"
  }
]
```

## ⚡ Recursos Avançados

### Validação Automática
- ✅ CEP deve ter 8 dígitos (com ou sem hífen)
- ✅ Logradouro obrigatório
- ✅ Cidade obrigatória  
- ✅ Estado obrigatório (2 letras)

### Normalização Automática
- ✅ CEP formatado como "12345-678"
- ✅ Remoção de espaços extras
- ✅ Geração automática do campo "localidade"

### Prevenção de Duplicatas
- ✅ Verificação por CEP único
- ✅ Relatório de duplicatas encontradas
- ✅ Contadores de sucesso/erro

## 📈 Monitoramento

### Ver Estatísticas Atuais:
```bash
# Total de registros
echo "Total: $(jq length public/ceps.json) registros"

# Por estado
echo "Por estado:"
jq -r '.[].estado' public/ceps.json | sort | uniq -c | sort -nr
```

### Verificar Últimas Adições:
```bash
# Últimos 10 registros (ordenados)
jq '.[-10:]' public/ceps.json
```

## 🎉 Próximos Passos

1. **Integrar com scrapers existentes** para alimentação automática
2. **Configurar cron jobs** para extrações periódicas  
3. **Adicionar mais estados** conforme necessário
4. **Implementar backup automático** da base
5. **Criar API REST** para consultas externas

## 🆘 Solução de Problemas

### Erro: "Arquivo não encontrado"
```bash
# Verificar se o arquivo existe
ls -la dados-extraidos.csv
```

### Erro: "Formato inválido"
```bash
# Verificar formato do CSV
head -5 dados-extraidos.csv

# Verificar formato do JSON  
jq . dados-extraidos.json
```

### Base corrompida
```bash
# Recriar base de exemplo
node scripts/create-sample-database.js
```

---

**🎯 Sistema pronto para uso! Adicione novos CEPs facilmente com os scripts fornecidos.**
