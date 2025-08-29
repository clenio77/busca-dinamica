import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CityFilter from './components/CityFilter';
<<<<<<< HEAD
import StateFilter from './components/StateFilter';
=======
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
import AddressList from './components/AddressList';
import StatsCard from './components/StatsCard';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { useAddressSearch } from './hooks/useAddressSearch';

function App() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
<<<<<<< HEAD
    selectedState,
    setSelectedState,
    availableCities,
    availableStates,
=======
    availableCities,
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
    addresses,
    loading
  } = useAddressSearch();

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10">
        <Header />

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Search Controls Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 mb-8">
            <div className="space-y-6">
<<<<<<< HEAD
              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Filter */}
                <div className="w-full">
                  <StateFilter
                    availableStates={availableStates}
                    selectedState={selectedState}
                    onStateChange={setSelectedState}
                    loading={loading}
                  />
                </div>

                {/* City Filter */}
                <div className="w-full">
                  <CityFilter
                    availableCities={availableCities}
                    selectedCity={selectedCity}
                    onCityChange={setSelectedCity}
                    loading={loading}
                  />
                </div>
=======
              {/* City Filter */}
              <div className="w-full">
                <CityFilter
                  availableCities={availableCities}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  loading={loading}
                />
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
              </div>

              {/* Search Bar */}
              <div className="w-full">
                <SearchBar onSearchChange={setSearchTerm} searchTerm={searchTerm} />
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          {!loading && (
            <StatsCard
              addresses={addresses}
              searchTerm={searchTerm}
              selectedCity={selectedCity}
<<<<<<< HEAD
              selectedState={selectedState}
=======
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
            />
          )}

          {/* Results */}
          <AddressList
            addresses={addresses}
            searchTerm={searchTerm}
            selectedCity={selectedCity}
<<<<<<< HEAD
            selectedState={selectedState}
=======
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
            onCopy={showToast}
            loading={loading}
          />
        </div>

        <Footer />
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
      />
    </div>
  );
}

export default App;