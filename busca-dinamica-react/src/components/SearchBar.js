import React from 'react';
import { useScreenSize } from '../hooks/useScreenSize';

function SearchBar({ searchTerm, onSearchChange }) {
  const { isMobile, isTablet } = useScreenSize();
  
  const handleChange = (event) => {
    onSearchChange(event.target.value);
  };

  // Funcionalidade diferenciada por tamanho de tela
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // Em telas grandes (desktop): limpa o campo de busca
      // Em telas pequenas (mobile/tablet): apenas remove o foco
      if (isMobile || isTablet) {
        event.target.blur(); // Remove foco, executando a busca
      } else {
        onSearchChange(''); // Limpa o campo de busca
      }
    }
  };

  return (
    <div className="search-box">
      <label htmlFor="input" className="sr-only">Buscar endereço por rua, CEP ou bairro</label>
      <i className="fas fa-search search-icon" aria-hidden="true"></i>
      <input
        type="text"
        id="input"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="DIGITE O ENDEREÇO SEM ACENTOS..."
        autoComplete="off"
        aria-label="Buscar endereço por rua, CEP ou bairro"
      />
      
      {/* Dica diferenciada por tamanho de tela */}
      {searchTerm && (
        <div className="search-tip">
          <p className="text-xs text-gray-500 mt-2">
            💡 Pressione <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> 
            {isMobile || isTablet ? ' para buscar' : ' para limpar'}
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 