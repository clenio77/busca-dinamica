import { useState, useEffect, useRef } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

// Função para remover acentos, movida para cá para ser usada no filtro
function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function useAddressSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia como true para o carregamento inicial

  // Usamos useRef para armazenar todos os endereços e evitar recarregamentos
  const allAddresses = useRef([]);
  const debouncedTerm = useDebouncedValue(searchTerm, 200);

  // Efeito para carregar TODOS os endereços da API, apenas uma vez
  useEffect(() => {
    setLoading(true);
    fetch('/api/cep/search')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Verificar se a resposta tem a estrutura esperada
        const addresses = data.data || data || [];
        
        // Mapear os campos da API para os campos esperados pelo componente
        const mappedData = addresses.map(address => ({
          ...address,
          street: address.logradouro || address.street || '',
          neighborhood: address.bairro || address.neighborhood || '',
          city: address.cidade || address.city || '',
          state: address.estado || address.state || '',
          complement: address.complemento || address.complement || ''
        }));

        allAddresses.current = mappedData;

        // Extrair cidades únicas e ordenar
        const cities = [...new Set(mappedData.map(addr => addr.city).filter(city => city))].sort();
        setAvailableCities(cities);

        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar dados da API:", error);
        // Em caso de erro, usar dados mock para demonstração
        const mockData = [
          {
            cep: '38400-100',
            street: 'Rua das Flores',
            neighborhood: 'Centro',
            city: 'Uberlândia',
            state: 'MG',
            complement: ''
          },
          {
            cep: '38400-200',
            street: 'Avenida Rondon Pacheco',
            neighborhood: 'Tibery',
            city: 'Uberlândia',
            state: 'MG',
            complement: ''
          }
        ];
        allAddresses.current = mockData;
        setAvailableCities(['Uberlândia']);
        setLoading(false);
      });
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  // Efeito para FILTRAR os endereços em memória quando o termo de busca ou cidade muda
  useEffect(() => {
    if (allAddresses.current.length === 0) {
      setFilteredAddresses([]);
      return;
    }

    let addressesToFilter = allAddresses.current;

    // Filtrar por cidade primeiro (se selecionada)
    if (selectedCity) {
      addressesToFilter = allAddresses.current.filter(addr =>
        removeAccents(addr.city || '') === removeAccents(selectedCity)
      );
    }

    // Se não há termo de busca, mostrar apenas se há cidade selecionada
    if (!debouncedTerm || debouncedTerm.length < 2) {
      setFilteredAddresses(selectedCity ? addressesToFilter.slice(0, 100) : []);
      return;
    }

    // Aplicar busca textual
    const term = removeAccents(debouncedTerm);
    const filtered = addressesToFilter.filter(addr => {
      const street = removeAccents(addr.street || '');
      const neighborhood = removeAccents(addr.neighborhood || '');
      const city = removeAccents(addr.city || '');
      const cep = addr.cep || '';

      return street.includes(term) ||
             neighborhood.includes(term) ||
             city.includes(term) ||
             cep.includes(term);
    })
    // Ordenar para priorizar registros com logradouro preenchido
    .sort((a, b) => {
      const aHasStreet = a.street && a.street.trim() !== '';
      const bHasStreet = b.street && b.street.trim() !== '';

      if (aHasStreet && !bHasStreet) return -1;
      if (!aHasStreet && bHasStreet) return 1;
      return 0;
    })
    .slice(0, 100); // Limita a 100 resultados para não sobrecarregar a tela

    setFilteredAddresses(filtered);

  }, [debouncedTerm, selectedCity]);

  // Retornamos os endereços filtrados e controles para a UI
  return {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
    availableCities,
    addresses: filteredAddresses,
    loading
  };
}