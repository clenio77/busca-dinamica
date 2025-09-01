import { useEffect } from 'react';

export function useSEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  address = null 
}) {
  useEffect(() => {
    // Atualizar título da página
    if (title) {
      document.title = title;
    }

    // Função para atualizar meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Função para atualizar propriedades Open Graph
    const updateOGTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Função para atualizar propriedades Twitter Card
    const updateTwitterTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta tags básicas
    if (description) {
      updateMetaTag('description', description);
    }
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    if (url) {
      updateMetaTag('url', url);
    }

    // Open Graph tags
    if (title) {
      updateOGTag('og:title', title);
    }
    if (description) {
      updateOGTag('og:description', description);
    }
    if (url) {
      updateOGTag('og:url', url);
    }
    if (image) {
      updateOGTag('og:image', image);
    }
    updateOGTag('og:type', type);
    updateOGTag('og:site_name', 'Busca Dinâmica 2.0');

    // Twitter Card tags
    updateTwitterTag('twitter:card', 'summary_large_image');
    if (title) {
      updateTwitterTag('twitter:title', title);
    }
    if (description) {
      updateTwitterTag('twitter:description', description);
    }
    if (image) {
      updateTwitterTag('twitter:image', image);
    }
    updateTwitterTag('twitter:site', '@clenio77');

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Structured Data (JSON-LD)
    if (address) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'PostalAddress',
        'streetAddress': address.logradouro,
        'addressLocality': address.cidade,
        'addressRegion': address.estado,
        'postalCode': address.cep,
        'addressCountry': 'BR'
      };

      // Remover structured data anterior
      const existingScript = document.querySelector('script[data-structured-data="address"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar novo structured data
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-structured-data', 'address');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Atualizar theme-color para PWA
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#3b82f6');
    }

  }, [title, description, keywords, image, url, type, address]);

  // Função para gerar meta tags específicas para endereços
  const generateAddressMetaTags = (address, searchTerm) => {
    const title = `Endereço ${address.cep} - ${address.logradouro}, ${address.cidade}/${address.estado} | Busca Dinâmica 2.0`;
    const description = `Encontre o endereço completo: ${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}. Sistema inteligente de busca de endereços.`;
    const keywords = `cep, endereço, ${address.cidade}, ${address.estado}, ${address.logradouro}, busca dinâmica`;
    const url = `https://buscadinamica.vercel.app/endereco/${address.cep}`;
    const image = `https://buscadinamica.vercel.app/api/og?cep=${address.cep}&cidade=${address.cidade}`;

    return {
      title,
      description,
      keywords,
      url,
      image,
      type: 'article'
    };
  };

  // Função para gerar meta tags para resultados de busca
  const generateSearchMetaTags = (searchTerm, resultsCount) => {
    const title = `Busca: "${searchTerm}" - ${resultsCount} resultados | Busca Dinâmica 2.0`;
    const description = `Encontre ${resultsCount} endereços para "${searchTerm}". Sistema inteligente de busca de endereços com mais de 5.000 registros.`;
    const keywords = `busca, endereços, cep, ${searchTerm}, busca dinâmica`;
    const url = `https://buscadinamica.vercel.app/busca?q=${encodeURIComponent(searchTerm)}`;
    const image = 'https://buscadinamica.vercel.app/api/og?title=Busca%20Dinâmica%202.0';

    return {
      title,
      description,
      keywords,
      url,
      image,
      type: 'website'
    };
  };

  return {
    generateAddressMetaTags,
    generateSearchMetaTags
  };
}
