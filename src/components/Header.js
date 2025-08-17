import React from 'react';

function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center">
            {/* Logo and Title */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="flex-shrink-0">
                <img
                  src="/image/logoclenio.jpg"
                  alt="Logo Clênio Moura"
                  className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl shadow-lg object-cover border-2 border-white/20"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                  Busca Dinâmica
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-light text-blue-100">
                    2.0
                  </span>
                </h1>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-blue-100 font-medium mb-1">
              Sistema inteligente de busca de endereços
            </p>

            {/* Developer Credit */}
            <p className="text-sm text-blue-200/80">
              Desenvolvido por Clênio Moura
            </p>
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
