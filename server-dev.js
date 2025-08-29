const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do diretório public
app.use(express.static(path.join(__dirname, 'public')));

// Servir arquivos estáticos do diretório src (para desenvolvimento)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Rota para servir o arquivo de CEPs
app.get('/ceps.json', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'ceps.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Arquivo de CEPs não encontrado' });
  }
});

// Rota principal - servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
