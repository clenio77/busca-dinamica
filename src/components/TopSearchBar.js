import React from 'react';
import { Search, MapPin, Building } from 'lucide-react';

const TopSearchBar = ({ 
  searchTerm, 
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedState,
  onStateChange,
  cities,
  states
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl shadow-lg border border-white/20 rounded-2xl p-6 mb-6">
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Search size={16} />
            <span>Buscar Endereços</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearchChange(''); // Limpa o campo de busca
                }
              }}
              placeholder="Digite pelo menos 2 caracteres..."
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl 
                       text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-blue-300/50 focus:border-blue-300 transition-all"
            />
          </div>
          
          {/* Dica para limpar com Enter */}
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Pressione <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> para limpar a busca
            </p>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* City Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin size={16} />
              <span>Cidade</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl 
                       text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300/50 
                       focus:border-blue-300 transition-all"
            >
              <option value="">Todas as cidades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Building size={16} />
              <span>Estado</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl 
                       text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300/50 
                       focus:border-blue-300 transition-all"
            >
              <option value="">Todos os estados</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSearchBar;
