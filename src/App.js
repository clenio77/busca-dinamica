import React, { useState, useMemo } from 'react';
import addressesData from './data/addresses';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AddressList from './components/AddressList';
import Footer from './components/Footer';
import { filterAddresses } from './utils/filterAddresses';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredAddresses = useMemo(() => {
    return filterAddresses(addressesData, searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="container">
      <Header />
      <SearchBar onSearchChange={handleSearchChange} searchTerm={searchTerm} />
      <AddressList addresses={filteredAddresses} searchTerm={searchTerm} />
      <Footer />
    </div>
  );
}

export default App;
