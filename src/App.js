import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopSearchBar from './components/TopSearchBar';
import MobileHeader from './components/MobileHeader';
import AddressList from './components/AddressList';
import StatsCard from './components/StatsCard';
import Toast from './components/Toast';
import Footer from './components/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useAddressSearch } from './hooks/useAddressSearch';
import { useScreenSize } from './hooks/useScreenSize';
import logoImage from './assets/logoclenio.jpg';

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

  // Screen size detection
  const { isMobile, isTablet } = useScreenSize();

  // Para telas pequenas, usamos interface superior
  const useTopInterface = isMobile || isTablet;

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

      {/* Interface Condicional */}
      {useTopInterface ? (
        // Interface para telas pequenas - Header + Menu superior
        <>
          <MobileHeader />
          <div className="relative z-10 pt-4 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Top Search Bar */}
              <TopSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                selectedState={selectedState}
                onStateChange={setSelectedState}
                cities={availableCities}
                states={availableStates}
              />
            </div>
          </div>
        </>
      ) : (
        // Interface para telas grandes - Sidebar lateral
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
      )}

      {/* Main Content Container */}
      <div className={`flex-1 relative z-10 pb-12 transition-all duration-300 ${
        useTopInterface
          ? 'pt-0' // Para interface superior, sem padding top extra
          : sidebarOpen
            ? 'lg:ml-96 pt-8'
            : 'ml-0 pt-8'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Welcome Message */}
          {!searchTerm && addresses.length === 0 && !loading && (
            <div className={`text-center ${useTopInterface ? 'py-8' : 'py-16'}`}>
              <div className={`relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 ${useTopInterface ? 'p-8' : 'p-16'}`}>
                
                {/* Background subtle pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                  
                  {/* Logo e Título Principal */}
                  <div className="flex flex-col items-center mb-16">
                    <div className="relative mb-12">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-xl">
                        <img
                          src={logoImage}
                          alt="Logo Clênio Moura"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                      Busca Dinâmica 2.0
                    </h1>
                    <p className="text-2xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
                      Sistema inteligente de busca de endereços com mais de 5.000 registros
                    </p>
                  </div>

                  {/* Features em linha única */}
                  <div className="flex justify-center items-center space-x-12 mb-16">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-lg">Busca Inteligente</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-lg">Filtros Avançados</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-lg">Resultados Rápidos</span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center mb-16">
                    <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-xl leading-relaxed">
                      {useTopInterface
                        ? "Use os filtros acima para buscar endereços por cidade, estado e digite pelo menos 2 caracteres."
                        : "Use o menu lateral para filtrar por cidade, estado e digite pelo menos 2 caracteres para buscar endereços."
                      }
                    </p>
                    {!useTopInterface && (
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-xl"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Abrir Filtros
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Stats Preview */}
                  <div className="pt-12 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-12 text-center">
                      <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">5.358</div>
                        <div className="text-gray-600 text-lg">Endereços</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                        <div className="text-gray-600 text-lg">Gratuito</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                        <div className="text-gray-600 text-lg">Disponível</div>
                      </div>
                    </div>
                  </div>
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
              compact={useTopInterface}
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;