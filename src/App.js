import React from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CityFilter from './components/CityFilter';
import AddressList from './components/AddressList';
import Footer from './components/Footer';
import { useAddressSearch } from './hooks/useAddressSearch';
import './App.css';

function App() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
    availableCities,
    addresses,
    loading
  } = useAddressSearch();

  return (
    <div className="container">
      <Header />
      <div className="search-controls">
        <CityFilter
          availableCities={availableCities}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          loading={loading}
        />
        <SearchBar onSearchChange={setSearchTerm} searchTerm={searchTerm} />
      </div>
      {loading && <p>Buscando...</p>}
      <AddressList addresses={addresses} searchTerm={searchTerm} selectedCity={selectedCity} />
      <Footer />
    </div>
  );
}

export default App;