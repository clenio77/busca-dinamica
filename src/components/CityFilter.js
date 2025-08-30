import React from 'react';

const CityFilter = ({ availableCities, selectedCity, onCityChange, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <label htmlFor="city-select" className="block text-sm font-semibold text-gray-700">
          Filtrar por cidade:
        </label>
        <div className="relative">
          <select
            id="city-select"
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none appearance-none"
          >
            <option>Carregando cidades...</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label htmlFor="city-select" className="block text-sm font-semibold text-gray-700">
        Filtrar por cidade:
      </label>
      <div className="relative">
        <select
          id="city-select"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
        >
          <option value="">Todas as cidades</option>
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CityFilter;