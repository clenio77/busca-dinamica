import React from 'react';

function StatsCard({ addresses, searchTerm, selectedCity, selectedState, compact = false }) {
  const totalAddresses = addresses.length;
  const hasSearch = searchTerm.length >= 2;
  if (!hasSearch) {
    return null;
  }

  if (compact) {
    // Versão compacta para mobile
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {totalAddresses.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {totalAddresses === 1 ? 'resultado' : 'resultados'}
              </div>
            </div>
            <div className="text-sm text-gray-700">
              para <span className="font-semibold">"{searchTerm}"</span>
              {selectedCity && selectedCity !== 'all' && (
                <span className="text-gray-500"> em {selectedCity}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Selected State */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {selectedState || 'Todos'}
          </div>
          <div className="text-sm text-gray-600">
            {selectedState ? 'Estado filtrado' : 'Todos os estados'}
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
