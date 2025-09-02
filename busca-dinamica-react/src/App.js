import React from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CityFilter from './components/CityFilter';
import AddressList from './components/AddressList';
import Footer from './components/Footer';
import { useAddressSearch } from './hooks/useAddressSearch';
import './App.css';
import './animations.css';

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
      <SearchBar onSearchChange={setSearchTerm} searchTerm={searchTerm} />
      <CityFilter
        cities={availableCities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />
      {loading && <p>Carregando dados...</p>}
      <AddressList addresses={addresses} searchTerm={searchTerm} />
      <Footer />
    </div>
  );
}

export default App;