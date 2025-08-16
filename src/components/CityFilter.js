import React from 'react';

const CityFilter = ({ availableCities, selectedCity, onCityChange, loading }) => {
  if (loading) {
    return (
      <div className="city-filter">
        <label htmlFor="city-select">Filtrar por cidade:</label>
        <select id="city-select" disabled>
          <option>Carregando cidades...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="city-filter">
      <label htmlFor="city-select">Filtrar por cidade:</label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value)}
        className="city-select"
      >
        <option value="">Todas as cidades</option>
        {availableCities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
};

export default CityFilter;