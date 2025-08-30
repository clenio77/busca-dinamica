import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  const handleChange = (event) => {
    onSearchChange(event.target.value);
  };

  // Enter executa a busca (remove foco do campo)
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur(); // Remove foco, executando a busca
    }
  };



  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-3">
      <label htmlFor="input" className="block text-sm font-semibold text-gray-700">
        Buscar endereço:
      </label>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          id="input"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite o endereço, CEP ou bairro..."
          autoComplete="off"
          aria-label="Buscar endereço por rua, CEP ou bairro"
          className="w-full pl-12 pr-12 py-3 bg-blue-50/30 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 focus:bg-white/90 transition-all duration-200 placeholder-gray-400"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Limpar busca"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dica para buscar com Enter */}
      {searchTerm && (
        <p className="text-xs text-gray-500 mt-2">
          💡 Pressione <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> para buscar
        </p>
      )}
    </div>
  );
}

export default SearchBar; 