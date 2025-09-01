// Gerador de Sitemap Automático

const BASE_URL = 'https://buscadinamica.vercel.app';

// URLs estáticas do site
const STATIC_URLS = [
  {
    url: '/',
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  },
  {
    url: '/busca',
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '0.9'
  },
  {
    url: '/sobre',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.7'
  },
  {
    url: '/contato',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.6'
  }
];

// Gerar sitemap XML
export const generateSitemapXML = (addresses = []) => {
  const urls = [...STATIC_URLS];

  // Adicionar URLs dinâmicas para endereços
  addresses.forEach(address => {
    urls.push({
      url: `/endereco/${address.cep}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.8'
    });
  });

  // Gerar XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${BASE_URL}${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

// Gerar sitemap index para múltiplos sitemaps
export const generateSitemapIndex = (sitemaps = []) => {
  const defaultSitemaps = [
    {
      url: `${BASE_URL}/sitemap.xml`,
      lastmod: new Date().toISOString()
    }
  ];

  const allSitemaps = [...defaultSitemaps, ...sitemaps];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return xml;
};

// Gerar robots.txt
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Allow important pages
Allow: /busca
Allow: /endereco/
Allow: /sobre
Allow: /contato`;
};

// Salvar sitemap no servidor
export const saveSitemap = async (sitemapContent, filename = 'sitemap.xml') => {
  try {
    const response = await fetch('/api/sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: sitemapContent
    });

    if (response.ok) {
      console.log(`[SEO] Sitemap ${filename} salvo com sucesso`);
      return true;
    } else {
      console.error(`[SEO] Erro ao salvar sitemap ${filename}`);
      return false;
    }
  } catch (error) {
    console.error(`[SEO] Erro ao salvar sitemap ${filename}:`, error);
    return false;
  }
};

// Atualizar sitemap automaticamente
export const updateSitemap = async (addresses = []) => {
  try {
    // Gerar sitemap
    const sitemapXML = generateSitemapXML(addresses);
    
    // Salvar sitemap
    const saved = await saveSitemap(sitemapXML);
    
    if (saved) {
      // Notificar motores de busca sobre a atualização
      await notifySearchEngines();
    }
    
    return saved;
  } catch (error) {
    console.error('[SEO] Erro ao atualizar sitemap:', error);
    return false;
  }
};

// Notificar motores de busca sobre atualizações
export const notifySearchEngines = async () => {
  const searchEngines = [
    'https://www.google.com/ping?sitemap=https://buscadinamica.vercel.app/sitemap.xml',
    'https://www.bing.com/ping?sitemap=https://buscadinamica.vercel.app/sitemap.xml'
  ];

  try {
    await Promise.allSettled(
      searchEngines.map(url => 
        fetch(url, { method: 'GET' })
          .then(response => {
            if (response.ok) {
              console.log(`[SEO] Notificação enviada para ${url}`);
            }
          })
          .catch(error => {
            console.error(`[SEO] Erro ao notificar ${url}:`, error);
          })
      )
    );
  } catch (error) {
    console.error('[SEO] Erro ao notificar motores de busca:', error);
  }
};

// Gerar sitemap para cidades específicas
export const generateCitySitemap = (city, addresses = []) => {
  const cityAddresses = addresses.filter(address => 
    address.cidade.toLowerCase() === city.toLowerCase()
  );

  const urls = [
    {
      url: `/cidade/${encodeURIComponent(city)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.9'
    }
  ];

  // Adicionar endereços da cidade
  cityAddresses.forEach(address => {
    urls.push({
      url: `/endereco/${address.cep}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.8'
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${BASE_URL}${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};
