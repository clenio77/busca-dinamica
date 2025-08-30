import React from 'react';
import { X, Menu, Search, MapPin, Building, Users } from 'lucide-react';
import logoImage from '../assets/logoclenio.jpg';

const Sidebar = ({
  isOpen,
  onToggle,
  searchTerm,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  cities,
  categories,
  subcategories,
  onSearch: _onSearch
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-blue-600 to-blue-800 
        text-white shadow-2xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-96
      `}>
        
        {/* Header with Logo */}
        <div className="p-6 border-b border-blue-500/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col items-center flex-1">
              <img
                src={logoImage}
                alt="Logo Clênio Moura"
                className="h-32 w-32 rounded-xl shadow-lg object-cover border-2 border-white/20 mb-4"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold">Busca Dinâmica</h2>
                <p className="text-blue-200 text-base">Sistema inteligente de busca</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
          
          {/* Search Input */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-blue-100">
              <Search size={16} />
              <span>Buscar Endereços</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Enter executa a busca (remove foco do campo)
                    e.target.blur();
                  }
                }}
                placeholder="Digite pelo menos 2 caracteres..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                         text-white placeholder-blue-200 focus:outline-none focus:ring-2
                         focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
              />
            </div>

            {/* Dica e botão para limpar */}
            {searchTerm && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-200">
                  💡 Pressione <kbd className="px-1 py-0.5 bg-white/20 border border-white/30 rounded text-xs">Enter</kbd> para buscar
                </p>
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-blue-200 hover:text-white font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                  ✕ Limpar
                </button>
              </div>
            )}
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-blue-100">
              <MapPin size={16} />
              <span>Cidade</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50
                       focus:border-transparent backdrop-blur-sm"
            >
              <option value="" className="bg-blue-600 text-white">Todas as cidades</option>
              {cities.map(city => (
                <option key={city} value={city} className="bg-blue-600 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-blue-100">
              <Building size={16} />
              <span>Categoria</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50
                       focus:border-transparent backdrop-blur-sm"
            >
              <option value="" className="bg-blue-600 text-white">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-blue-600 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-blue-100">
                <Users size={16} />
                <span>Subcategoria</span>
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => onSubcategoryChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl
                         text-white focus:outline-none focus:ring-2 focus:ring-white/50
                         focus:border-transparent backdrop-blur-sm"
              >
                <option value="" className="bg-blue-600 text-white">Todas as subcategorias</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory} className="bg-blue-600 text-white">
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}



        </div>
      </div>

      {/* Toggle Button - Fixed position */}
      <button
        onClick={onToggle}
        className={`
          fixed top-4 left-4 z-50 p-3 bg-blue-500 hover:bg-blue-600
          text-white rounded-xl shadow-lg transition-all duration-300
          ${isOpen ? 'translate-x-80 lg:translate-x-96' : 'translate-x-0'}
        `}
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
