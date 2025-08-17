import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img
              src="image/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-700">
              Busca Dinâmica 2.0
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Sistema inteligente de busca de endereços
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <span>&copy; {currentYear} Busca Dinâmica 2.0</span>
            <span className="hidden sm:inline">•</span>
            <span>Desenvolvido por Clênio Moura</span>
            <span className="hidden sm:inline">•</span>
            <span>Versão 2.0</span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Dados de endereços atualizados regularmente para maior precisão
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
