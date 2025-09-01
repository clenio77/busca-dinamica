// Utilitários para exportação e compartilhamento

// Exportar resultados para CSV
export const exportToCSV = (addresses, filename = 'enderecos.csv') => {
  if (!addresses || addresses.length === 0) {
    throw new Error('Nenhum endereço para exportar');
  }

  // Cabeçalhos do CSV
  const headers = [
    'CEP',
    'Logradouro',
    'Bairro',
    'Cidade',
    'Estado',
    'Complemento'
  ];

  // Dados formatados
  const csvData = addresses.map(address => [
    address.cep || '',
    address.logradouro || '',
    address.bairro || '',
    address.cidade || '',
    address.estado || '',
    address.complemento || ''
  ]);

  // Criar conteúdo CSV
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Criar blob e download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Exportar resultados para JSON
export const exportToJSON = (addresses, filename = 'enderecos.json') => {
  if (!addresses || addresses.length === 0) {
    throw new Error('Nenhum endereço para exportar');
  }

  const jsonData = {
    exportDate: new Date().toISOString(),
    totalResults: addresses.length,
    addresses: addresses.map(address => ({
      cep: address.cep,
      logradouro: address.logradouro,
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      complemento: address.complemento
    }))
  };

  const jsonContent = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Compartilhar endereço via WhatsApp
export const shareViaWhatsApp = (address) => {
  const text = `📍 Endereço encontrado:\n\n` +
    `CEP: ${address.cep}\n` +
    `Logradouro: ${address.logradouro}\n` +
    `Bairro: ${address.bairro}\n` +
    `Cidade: ${address.cidade}\n` +
    `Estado: ${address.estado}\n` +
    (address.complemento ? `Complemento: ${address.complemento}\n` : '') +
    `\nEncontrado via Busca Dinâmica 2.0`;

  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
};

// Compartilhar endereço via Email
export const shareViaEmail = (address) => {
  const subject = 'Endereço encontrado - Busca Dinâmica 2.0';
  const body = `Olá!\n\nEncontrei este endereço:\n\n` +
    `CEP: ${address.cep}\n` +
    `Logradouro: ${address.logradouro}\n` +
    `Bairro: ${address.bairro}\n` +
    `Cidade: ${address.cidade}\n` +
    `Estado: ${address.estado}\n` +
    (address.complemento ? `Complemento: ${address.complemento}\n` : '') +
    `\nEncontrado via Busca Dinâmica 2.0\n` +
    `https://buscadinamica.vercel.app`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.open(mailtoUrl);
};

// Compartilhar endereço via SMS (mobile)
export const shareViaSMS = (address) => {
  const text = `📍 Endereço: ${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}`;
  
  if ('navigator' in window && 'share' in navigator) {
    // Web Share API (modern browsers)
    navigator.share({
      title: 'Endereço encontrado',
      text: text,
      url: 'https://buscadinamica.vercel.app'
    }).catch(console.error);
  } else {
    // Fallback para SMS
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
    window.open(smsUrl);
  }
};

// Copiar endereço para clipboard
export const copyToClipboard = async (address) => {
  const text = `${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}`;
  
  try {
    if ('navigator' in window && 'clipboard' in navigator) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};

// Gerar QR Code para endereço
export const generateQRCode = (address) => {
  const text = `${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  
  return qrUrl;
};

// Compartilhar múltiplos endereços
export const shareMultipleAddresses = (addresses, method = 'whatsapp') => {
  if (!addresses || addresses.length === 0) {
    throw new Error('Nenhum endereço para compartilhar');
  }

  const text = `📍 ${addresses.length} endereços encontrados:\n\n` +
    addresses.map((address, index) => 
      `${index + 1}. ${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}`
    ).join('\n') +
    `\n\nEncontrados via Busca Dinâmica 2.0`;

  const encodedText = encodeURIComponent(text);

  switch (method) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      break;
    case 'email':
      const subject = `${addresses.length} endereços encontrados - Busca Dinâmica 2.0`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodedText}`, '_blank');
      break;
    case 'sms':
      if ('navigator' in window && 'share' in navigator) {
        navigator.share({
          title: `${addresses.length} endereços encontrados`,
          text: text,
          url: 'https://buscadinamica.vercel.app'
        }).catch(console.error);
      } else {
        window.open(`sms:?body=${encodedText}`, '_blank');
      }
      break;
    default:
      throw new Error('Método de compartilhamento não suportado');
  }
};
