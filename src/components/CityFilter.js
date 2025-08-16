import React from 'react';

const CityFilter = ({ cities, selectedCity, onCityChange }) => {
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
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
};

export default CityFilter;