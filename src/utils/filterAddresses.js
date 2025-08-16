export function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();
}

export function filterAddresses(addresses, query, selectedCity = '') {
  const normalizedQuery = normalize(query);
  
  // Filtrar por cidade primeiro (se selecionada)
  let filteredByCity = addresses || [];
  if (selectedCity) {
    filteredByCity = addresses.filter(address => 
      normalize(address.city) === normalize(selectedCity)
    );
  }
  
  // Se não há query, retornar todos da cidade selecionada ou vazio
  if (!normalizedQuery) {
    return selectedCity ? filteredByCity : [];
  }

  // Aplicar busca textual
  return filteredByCity.filter((address) => {
    const street = normalize(address.street);
    const cep = normalize(address.cep);
    const neighborhood = normalize(address.neighborhood);
    const city = normalize(address.city);
    
    return (
      street.includes(normalizedQuery) ||
      cep.includes(normalizedQuery) ||
      neighborhood.includes(normalizedQuery) ||
      city.includes(normalizedQuery)
    );
  });
}

export function getUniqueCities(addresses) {
  const cities = new Set();
  (addresses || []).forEach(address => {
    if (address.city) {
      cities.add(address.city);
    }
  });
  return Array.from(cities).sort();
}