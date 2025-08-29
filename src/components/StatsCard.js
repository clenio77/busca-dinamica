import React from 'react';

<<<<<<< HEAD
function StatsCard({ addresses, searchTerm, selectedCity, selectedState }) {
  const totalAddresses = addresses.length;
  const hasSearch = searchTerm.length >= 2;

=======
function StatsCard({ addresses, searchTerm, selectedCity }) {
  const totalAddresses = addresses.length;
  const hasSearch = searchTerm.length >= 2;
  
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
  if (!hasSearch) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
<<<<<<< HEAD
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
=======
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
        {/* Total Results */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
            {totalAddresses.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {totalAddresses === 1 ? 'Resultado' : 'Resultados'}
          </div>
        </div>
<<<<<<< HEAD

=======
        
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
        {/* Search Term */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1 truncate">
            "{searchTerm}"
          </div>
          <div className="text-sm text-gray-600">
            Termo de busca
          </div>
        </div>
<<<<<<< HEAD

        {/* Selected State */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {selectedState || 'Todos'}
          </div>
          <div className="text-sm text-gray-600">
            {selectedState ? 'Estado filtrado' : 'Todos os estados'}
          </div>
        </div>

=======
        
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
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
