import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
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
    selectedState,
    setSelectedState,
    availableCities,
    availableStates,
    addresses,
    loading
  } = useAddressSearch();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleSearch = () => {
    if (searchTerm.length >= 2) {
      showToast('Busca realizada com sucesso!', 'success');
    } else {
      showToast('Digite pelo menos 2 caracteres para buscar', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCategory={selectedState}
        onCategoryChange={setSelectedState}
        selectedSubcategory=""
        onSubcategoryChange={() => {}}
        cities={availableCities}
        categories={availableStates}
        subcategories={[]}
        onSearch={handleSearch}
      />

      {/* Main Content Container */}
      <div className={`flex-1 relative z-10 pt-8 pb-12 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-96' : 'ml-0'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Welcome Message */}
          {!searchTerm && addresses.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Comece sua busca</h2>
                  <p className="text-gray-600 mb-6">
                    Use o menu lateral para filtrar por cidade, estado e digite pelo menos 2 caracteres para buscar endereços.
                  </p>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Abrir Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Card */}
          {!loading && (searchTerm || addresses.length > 0) && (
            <StatsCard
              addresses={addresses}
              searchTerm={searchTerm}
              selectedCity={selectedCity}
              selectedState={selectedState}
            />
          )}

          {/* Results */}
          <AddressList
            addresses={addresses}
            searchTerm={searchTerm}
            selectedCity={selectedCity}
            selectedState={selectedState}
            onCopy={showToast}
            loading={loading}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-50 shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-96' : 'ml-0'
      }`}>
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