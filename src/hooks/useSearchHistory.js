import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'busca_dinamica_history';
const MAX_HISTORY_ITEMS = 20;

export function useSearchHistory() {
  const [history, setHistory] = useState([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      }
    } catch (error) {
      console.error('[History] Erro ao carregar histórico:', error);
      setHistory([]);
    }
  }, []);

  // Salvar histórico no localStorage
  const saveHistory = useCallback((newHistory) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('[History] Erro ao salvar histórico:', error);
    }
  }, []);

  // Adicionar nova busca ao histórico
  const addToHistory = useCallback((searchTerm, filters = {}) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return;
    }

    const newHistoryItem = {
      term: searchTerm.trim(),
      filters,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    setHistory(prevHistory => {
      // Remover duplicatas baseadas no termo de busca
      const filteredHistory = prevHistory.filter(item => 
        item.term.toLowerCase() !== searchTerm.trim().toLowerCase()
      );

      // Adicionar novo item no início
      const newHistory = [newHistoryItem, ...filteredHistory];

      // Limitar o número de itens
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

      // Salvar no localStorage
      saveHistory(limitedHistory);

      return limitedHistory;
    });
  }, [saveHistory]);

  // Remover item do histórico
  const removeFromHistory = useCallback((index) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter((_, i) => i !== index);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Limpar todo o histórico
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Buscar no histórico
  const searchInHistory = useCallback((query) => {
    if (!query || query.trim().length < 1) {
      return history;
    }

    const searchQuery = query.toLowerCase();
    return history.filter(item => 
      item.term.toLowerCase().includes(searchQuery) ||
      Object.values(item.filters).some(filter => 
        filter && filter.toLowerCase().includes(searchQuery)
      )
    );
  }, [history]);

  // Obter histórico agrupado por data
  const getGroupedHistory = useCallback(() => {
    const groups = {};
    
    history.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  }, [history]);

  // Obter estatísticas do histórico
  const getHistoryStats = useCallback(() => {
    const totalSearches = history.length;
    const uniqueTerms = new Set(history.map(item => item.term.toLowerCase())).size;
    const mostSearched = history.reduce((acc, item) => {
      const term = item.term.toLowerCase();
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {});

    const topSearches = Object.entries(mostSearched)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));

    return {
      totalSearches,
      uniqueTerms,
      topSearches,
      averageSearchesPerDay: totalSearches > 0 ? Math.round(totalSearches / 7) : 0
    };
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    searchInHistory,
    getGroupedHistory,
    getHistoryStats
  };
}
