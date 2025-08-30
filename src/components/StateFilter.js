import React from 'react';

const StateFilter = ({ availableStates, selectedState, onStateChange, loading }) => {
  return (
    <div className="w-full">
      <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filtrar por Estado
      </label>
      <div className="relative">
        <select
          id="state-filter"
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 appearance-none"
          style={{ backgroundImage: 'none' }}
        >
          <option value="">Todos os Estados</option>
          {availableStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        
        {/* Ícone de seta */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      
      {/* Indicador de estado selecionado */}
      {selectedState && (
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Estado: {selectedState}
        </div>
      )}
    </div>
  );
};

export default StateFilter;
