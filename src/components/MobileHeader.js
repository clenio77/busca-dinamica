import React from 'react';
import logoImage from '../assets/logoclenio.jpg';
import ThemeToggle from './ThemeToggle';

const MobileHeader = ({ isDark, onToggleTheme }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={logoImage}
              alt="Logo Clênio Moura"
              className="w-12 h-12 rounded-lg object-cover shadow-lg border-2 border-white/20"
            />
            <div>
              <h1 className="text-lg font-bold text-white">Busca Dinâmica</h1>
              <p className="text-xs text-blue-200 -mt-1">Sistema Inteligente de Busca</p>
            </div>
          </div>
          
          {/* Theme Toggle Button */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
