import React from 'react';

function StatsCard({ addresses, searchTerm, selectedCity }) {
  const totalAddresses = addresses.length;
  const hasSearch = searchTerm.length >= 2;
  
  if (!hasSearch) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Results */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
            {totalAddresses.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {totalAddresses === 1 ? 'Resultado' : 'Resultados'}
          </div>
        </div>
        
        {/* Search Term */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1 truncate">
            "{searchTerm}"
          </div>
          <div className="text-sm text-gray-600">
            Termo de busca
          </div>
        </div>
        
        {/* Selected City */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {selectedCity || 'Todas'}
          </div>
          <div className="text-sm text-gray-600">
            {selectedCity ? 'Cidade filtrada' : 'Todas as cidades'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
