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
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia como true para o carregamento inicial
  
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
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar o arquivo de CEPs:", error);
        setLoading(false);
      });
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  // Efeito para FILTRAR os endereços em memória quando o termo de busca muda
  useEffect(() => {
    if (!debouncedTerm || debouncedTerm.length < 2) {
      setFilteredAddresses([]);
      return;
    }

    if (allAddresses.current.length > 0) {
      const term = removeAccents(debouncedTerm);
      const filtered = allAddresses.current.filter(addr => 
        removeAccents(addr.logradouro).includes(term) ||
        removeAccents(addr.bairro).includes(term) ||
        removeAccents(addr.cidade).includes(term) ||
        (addr.cep && addr.cep.includes(term))
      ).slice(0, 100); // Limita a 100 resultados para não sobrecarregar a tela
      
      setFilteredAddresses(filtered);
    }

  }, [debouncedTerm]);

  // Retornamos os endereços filtrados para a UI
  return { searchTerm, setSearchTerm, addresses: filteredAddresses, loading };
}