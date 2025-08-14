export function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();
}

export function filterAddresses(addresses, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return (addresses || []).filter((address) => {
    const street = normalize(address.street);
    const cep = normalize(address.cep);
    const neighborhood = normalize(address.neighborhood);
    return (
      street.includes(normalizedQuery) ||
      cep.includes(normalizedQuery) ||
      neighborhood.includes(normalizedQuery)
    );
  });
}
