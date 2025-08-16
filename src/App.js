import React from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AddressList from './components/AddressList';
import Footer from './components/Footer';
import { useAddressSearch } from './hooks/useAddressSearch';
import './App.css';

function App() {
  const { searchTerm, setSearchTerm, addresses, loading } = useAddressSearch();

  return (
    <div className="container">
      <Header />
      <SearchBar onSearchChange={setSearchTerm} searchTerm={searchTerm} />
      {loading && <p>Buscando...</p>}
      <AddressList addresses={addresses} searchTerm={searchTerm} />
      <Footer />
    </div>
  );
}

export default App;