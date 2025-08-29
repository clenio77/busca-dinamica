# 📚 API Documentation - Busca Dinâmica CEP

## 🌐 Base URL

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.busca-dinamica.com`
- **Production**: `https://api.busca-dinamica.com`

## 🔐 Authentication

### API Key Authentication

All API requests require an API key to be included in the request headers:

```http
X-API-Key: your-api-key-here
```

### Getting an API Key

```bash
curl -X POST "https://api.busca-dinamica.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "name": "Your Name",
    "company": "Your Company"
  }'
```

## 📋 Endpoints

### 1. Health Check

Check API health status.

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "service": "busca-dinamica-api",
  "version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "healthy",
  "uptime": "2d 5h 30m",
  "database": "connected",
  "cache": "connected"
}
```

### 2. Search CEP

Search for address information by CEP.

```http
GET /api/v2/cep/{cep}
```

**Parameters:**
- `cep` (string, required): CEP in format `12345-678` or `12345678`

**Example:**
```bash
curl "https://api.busca-dinamica.com/api/v2/cep/30000-000" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cep": "30000-000",
    "logradouro": "Rua da Bahia",
    "bairro": "Centro",
    "cidade": "Belo Horizonte",
    "estado": "MG",
    "latitude": -19.9167,
    "longitude": -43.9345
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": "89ms",
  "correlationId": "abc123-def456"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "CEP não encontrado",
  "cep": "99999-999",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correlationId": "abc123-def456"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Formato de CEP inválido. Use: 12345-678 ou 12345678",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correlationId": "abc123-def456"
}
```

### 3. Search by Address

Search for CEPs by partial address.

```http
GET /api/v2/search?q={query}&limit={limit}&offset={offset}
```

**Parameters:**
- `q` (string, required): Search query (minimum 3 characters)
- `limit` (integer, optional): Number of results (default: 20, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example:**
```bash
curl "https://api.busca-dinamica.com/api/v2/search?q=rua%20da%20bahia&limit=10" \
  -H "X-API-Key: your-api-key"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cep": "30000-000",
      "logradouro": "Rua da Bahia",
      "bairro": "Centro",
      "cidade": "Belo Horizonte",
      "estado": "MG",
      "relevance": 0.95
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasNext": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": "134ms"
}
```

### 4. Autocomplete

Get address suggestions for autocomplete.

```http
GET /api/v2/autocomplete?q={query}&limit={limit}
```

**Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `limit` (integer, optional): Number of suggestions (default: 10, max: 20)

**Example:**
```bash
curl "https://api.busca-dinamica.com/api/v2/autocomplete?q=rua%20da&limit=5" \
  -H "X-API-Key: your-api-key"
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "text": "Rua da Bahia, Centro, Belo Horizonte - MG",
      "cep": "30000-000",
      "type": "logradouro"
    },
    {
      "text": "Rua da Consolação, Centro, São Paulo - SP",
      "cep": "01301-000",
      "type": "logradouro"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": "45ms"
}
```

### 5. Search by City

Get all CEPs for a specific city.

```http
GET /api/v2/city/{city}?state={state}&limit={limit}&offset={offset}
```

**Parameters:**
- `city` (string, required): City name
- `state` (string, optional): State abbreviation (default: MG)
- `limit` (integer, optional): Number of results (default: 50, max: 500)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example:**
```bash
curl "https://api.busca-dinamica.com/api/v2/city/contagem?state=MG&limit=20" \
  -H "X-API-Key: your-api-key"
```

## 📊 Rate Limiting

API requests are rate limited based on your plan:

| Plan | Requests/Month | Rate Limit |
|------|----------------|------------|
| Free | 1,000 | 10 req/min |
| Starter | 10,000 | 30 req/min |
| Pro | 100,000 | 100 req/min |
| Business | 500,000 | 300 req/min |
| Enterprise | Unlimited | 1000 req/min |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## ❌ Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - CEP not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## 📈 Response Headers

All responses include these headers:

```http
X-Correlation-ID: abc123-def456
X-Response-Time: 89ms
X-API-Version: 2.0.0
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

## 🔧 SDKs and Libraries

### JavaScript/Node.js

```bash
npm install busca-dinamica-sdk
```

```javascript
const BuscaDinamica = require('busca-dinamica-sdk');

const client = new BuscaDinamica({
  apiKey: 'your-api-key',
  baseURL: 'https://api.busca-dinamica.com'
});

// Search CEP
const result = await client.searchCEP('30000-000');
console.log(result.data);
```

### Python

```bash
pip install busca-dinamica-python
```

```python
from busca_dinamica import BuscaDinamicaClient

client = BuscaDinamicaClient(api_key='your-api-key')

# Search CEP
result = client.search_cep('30000-000')
print(result.data)
```

## 📞 Support

- 📧 Email: api-support@busca-dinamica.com
- 📖 Documentation: https://docs.busca-dinamica.com
- 🐛 Issues: https://github.com/clenio77/busca-dinamica/issues
- 💬 Discord: https://discord.gg/busca-dinamica
