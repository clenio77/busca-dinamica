import { useState, useEffect, useCallback } from 'react';

const SAVED_FILTERS_KEY = 'busca_dinamica_saved_filters';
const MAX_SAVED_FILTERS = 10;

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState([]);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        const parsedFilters = JSON.parse(saved);
        setSavedFilters(Array.isArray(parsedFilters) ? parsedFilters : []);
      }
    } catch (error) {
      console.error('[SavedFilters] Erro ao carregar filtros salvos:', error);
      setSavedFilters([]);
    }
  }, []);

  // Salvar filtros no localStorage
  const saveFilters = useCallback((newFilters) => {
    try {
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(newFilters));
    } catch (error) {
      console.error('[SavedFilters] Erro ao salvar filtros:', error);
    }
  }, []);

  // Salvar novo filtro
  const saveFilter = useCallback((name, filters) => {
    if (!name || name.trim().length === 0) {
      return false;
    }

    const newFilter = {
      id: Date.now().toString(),
      name: name.trim(),
      filters: { ...filters },
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    setSavedFilters(prevFilters => {
      // Verificar se já existe um filtro com o mesmo nome
      const existingIndex = prevFilters.findIndex(f => 
        f.name.toLowerCase() === name.trim().toLowerCase()
      );

      let newFilters;
      if (existingIndex >= 0) {
        // Atualizar filtro existente
        newFilters = [...prevFilters];
        newFilters[existingIndex] = newFilter;
      } else {
        // Adicionar novo filtro
        newFilters = [newFilter, ...prevFilters];
      }

      // Limitar o número de filtros salvos
      const limitedFilters = newFilters.slice(0, MAX_SAVED_FILTERS);
      
      // Salvar no localStorage
      saveFilters(limitedFilters);
      
      return limitedFilters;
    });

    return true;
  }, [saveFilters]);

  // Remover filtro salvo
  const removeFilter = useCallback((filterId) => {
    setSavedFilters(prevFilters => {
      const newFilters = prevFilters.filter(f => f.id !== filterId);
      saveFilters(newFilters);
      return newFilters;
    });
  }, [saveFilters]);

  // Aplicar filtro salvo
  const applyFilter = useCallback((filterId) => {
    const filter = savedFilters.find(f => f.id === filterId);
    return filter ? filter.filters : null;
  }, [savedFilters]);

  // Obter filtro por nome
  const getFilterByName = useCallback((name) => {
    return savedFilters.find(f => 
      f.name.toLowerCase() === name.toLowerCase()
    );
  }, [savedFilters]);

  // Verificar se um conjunto de filtros já está salvo
  const isFilterSaved = useCallback((filters) => {
    return savedFilters.some(savedFilter => {
      const saved = savedFilter.filters;
      const current = filters;
      
      return (
        saved.city === current.city &&
        saved.state === current.state &&
        saved.category === current.category
      );
    });
  }, [savedFilters]);

  // Obter filtros agrupados por categoria
  const getGroupedFilters = useCallback(() => {
    const groups = {};
    
    savedFilters.forEach(filter => {
      const category = filter.filters.category || 'Geral';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(filter);
    });

    return Object.entries(groups).map(([category, filters]) => ({
      category,
      filters
    }));
  }, [savedFilters]);

  // Limpar todos os filtros salvos
  const clearAllFilters = useCallback(() => {
    setSavedFilters([]);
    localStorage.removeItem(SAVED_FILTERS_KEY);
  }, []);

  return {
    savedFilters,
    saveFilter,
    removeFilter,
    applyFilter,
    getFilterByName,
    isFilterSaved,
    getGroupedFilters,
    clearAllFilters
  };
}
