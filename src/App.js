import React, { useState, useEffect } from 'react';
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
import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
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
  
  // Theme management
  const { isDark, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
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
          <MobileHeader isDark={isDark} onToggleTheme={toggleTheme} />
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
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Main Content Container - Flex para footer fixo */}
      <div className={`flex-1 relative z-10 transition-all duration-300 lg:pb-16 ${
        useTopInterface
          ? 'pt-0' // Para interface superior, sem padding top extra
          : sidebarOpen
            ? 'lg:ml-96 pt-8'
            : 'ml-0 pt-8'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Welcome Message */}
          {!searchTerm && addresses.length === 0 && !loading && (
            <div className={`text-center ${useTopInterface ? 'py-6' : 'py-12'}`}>
              <div className={`relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-gray-600/40 ${useTopInterface ? 'p-6' : 'p-12'}`}>
                
                {/* Background subtle pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                  
                  {/* Logo e Título Principal */}
                  <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-xl">
                        <img
                          src={logoImage}
                          alt="Logo Clênio Moura"
                          className="w-full h-full rounded-full object-cover"
                          style={{ 
                            filter: 'contrast(1.3) brightness(1.2) saturate(1.1)',
                            transform: 'scale(1.05)'
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                      Busca Dinâmica 2.0
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl leading-relaxed font-medium">
                      Sistema inteligente de busca de endereços com mais de 5.000 registros
                    </p>
                  </div>

                  {/* Features em linha única */}
                  <div className="flex justify-center items-center space-x-10 mb-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Busca Inteligente</span>
                    </div>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Filtros Avançados</span>
                    </div>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Resultados Rápidos</span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center mb-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto text-lg leading-relaxed">
                      {useTopInterface
                        ? "Use os filtros acima para buscar endereços por cidade, estado e digite pelo menos 2 caracteres."
                        : "Use o menu lateral para filtrar por cidade, estado e digite pelo menos 2 caracteres para buscar endereços."
                      }
                    </p>
                    {!useTopInterface && (
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Abrir Filtros
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Stats Preview */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">5.358</div>
                        <div className="text-gray-600 dark:text-gray-400">Endereços</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                        <div className="text-gray-600 dark:text-gray-400">Gratuito</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                        <div className="text-gray-600 dark:text-gray-400">Disponível</div>
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

      {/* Footer Fixo - Só nas telas grandes */}
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