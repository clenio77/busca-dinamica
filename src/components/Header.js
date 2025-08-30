import React from 'react';
import logoImage from '../assets/logoclenio.jpg';

function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center space-x-4">
            {/* Logo with full header height */}
            <div className="flex-shrink-0">
              <img
                src={logoImage}
                alt="Logo Clênio Moura"
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-lg shadow-lg object-cover border-2 border-white/20"
              />
            </div>

            {/* Title and info */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Busca Dinâmica
                <span className="ml-2 text-lg sm:text-xl font-light text-blue-100">
                  2.0
                </span>
              </h1>
              <p className="text-sm text-blue-100 font-medium">
                Sistema inteligente de busca de endereços
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>
    </header>
  );
}

export default Header;
