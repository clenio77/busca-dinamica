import React from 'react';
import OptimizedImage from './OptimizedImage';
import logoImage from '../assets/logoclenio.jpg';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4 text-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <OptimizedImage
              src={logoImage}
              alt="Logo Clênio Moura"
              className="w-6 h-6 rounded object-cover border border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* All info in one line */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Busca Dinâmica 2.0</span>
            <span className="mx-1">•</span>
            Sistema inteligente de busca de endereços
            <span className="mx-1">•</span>
            © {currentYear} Desenvolvido por Clênio Moura
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
