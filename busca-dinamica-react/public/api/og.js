// API Route para Open Graph Images
// Esta é uma simulação da API route que seria implementada no servidor

export default function handler(req, res) {
  const { title, cep, cidade, searchTerm } = req.query;

  // Configurações da imagem
  const width = 1200;
  const height = 630;
  const fontSize = 48;
  const lineHeight = 1.2;

  // Gerar título dinâmico
  let dynamicTitle = 'Busca Dinâmica 2.0';
  let subtitle = 'Sistema inteligente de busca de endereços';

  if (cep && cidade) {
    dynamicTitle = `CEP ${cep}`;
    subtitle = `${cidade} - Endereço encontrado`;
  } else if (searchTerm) {
    dynamicTitle = `Busca: "${searchTerm}"`;
    subtitle = 'Resultados encontrados';
  } else if (title) {
    dynamicTitle = title;
  }

  // Criar SVG dinâmico
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Pattern overlay -->
      <defs>
        <pattern id="pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="2" fill="white" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern)"/>
      
      <!-- Logo placeholder -->
      <circle cx="100" cy="100" r="40" fill="white" opacity="0.2"/>
      <text x="100" y="110" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">BD</text>
      
      <!-- Main title -->
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">
        ${dynamicTitle}
      </text>
      
      <!-- Subtitle -->
      <text x="50%" y="55%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.9">
        ${subtitle}
      </text>
      
      <!-- Features -->
      <text x="50%" y="75%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" opacity="0.8">
        🔍 Busca Inteligente • 📍 Filtros Avançados • ⚡ Resultados Rápidos
      </text>
      
      <!-- URL -->
      <text x="50%" y="90%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" opacity="0.7">
        buscadinamica.vercel.app
      </text>
    </svg>
  `;

  // Configurar headers
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  // Retornar SVG
  res.status(200).send(svg);
}
