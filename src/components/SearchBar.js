import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  const handleChange = (event) => {
    onSearchChange(event.target.value);
  };

  // Manter a funcionalidade de limpar ao pressionar Enter do JS original
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearchChange(''); // Limpa o campo de busca
    }
  };

  return (
    <div className="search-box">
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        id="input"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="DIGITE O ENDEREÇO SEM ACENTOS..."
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar; 