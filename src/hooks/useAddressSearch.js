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
  const [loading, setLoading] = useState(true); // Inicia como true para o carregamento inicial
  const [availableCities, setAvailableCities] = useState([]);

  // Usamos useRef para armazenar todos os endereços e evitar recarregamentos
  const allAddresses = useRef([]);
  const debouncedTerm = useDebouncedValue(searchTerm, 200);

  // Efeito para carregar TODOS os endereços do JSON, apenas uma vez
  useEffect(() => {
    setLoading(true);
    fetch('/ceps.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        allAddresses.current = data;

        // Extrair cidades únicas e ordenar
        const cities = [...new Set(data.map(addr => addr.cidade).filter(Boolean))].sort();
        setAvailableCities(cities);

        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar o arquivo de CEPs:", error);
        setLoading(false);
      });
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  // Efeito para FILTRAR os endereços em memória quando o termo de busca ou cidade muda
  useEffect(() => {
    // Só mostrar resultados se houver termo de busca com pelo menos 2 caracteres
    if (!debouncedTerm || debouncedTerm.length < 2) {
      setFilteredAddresses([]);
      return;
    }

    let filtered = allAddresses.current;

    // Filtrar por cidade primeiro, se uma cidade estiver selecionada
    if (selectedCity) {
      filtered = filtered.filter(address => address.cidade === selectedCity);
    }

    // Filtrar por termo de busca
    const term = removeAccents(debouncedTerm);
    filtered = filtered.filter(addr =>
      removeAccents(addr.logradouro || '').includes(term) ||
      removeAccents(addr.bairro || '').includes(term) ||
      removeAccents(addr.cidade || '').includes(term) ||
      (addr.cep && addr.cep.includes(term))
    );

    // Ordenar resultados: primeiro os que têm logradouro preenchido
    const sorted = filtered.sort((a, b) => {
      const aHasLogradouro = a.logradouro && a.logradouro.trim() !== '';
      const bHasLogradouro = b.logradouro && b.logradouro.trim() !== '';

      if (aHasLogradouro && !bHasLogradouro) return -1;
      if (!aHasLogradouro && bHasLogradouro) return 1;
      return 0;
    });

    // Limitar a 100 resultados para não sobrecarregar a tela
    setFilteredAddresses(sorted.slice(0, 100));
  }, [debouncedTerm, selectedCity]);

  // Retornamos os endereços filtrados para a UI
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