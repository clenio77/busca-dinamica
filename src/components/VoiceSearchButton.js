import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

function VoiceSearchButton({ 
  isListening, 
  onStartListening, 
  onStopListening, 
  isSupported = true,
  className = '' 
}) {
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  if (!isSupported) {
    return null; // Não renderizar se não for suportado
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-3 rounded-full transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${className}`}
      aria-label={isListening ? 'Parar busca por voz' : 'Iniciar busca por voz'}
      title={isListening ? 'Parar busca por voz' : 'Iniciar busca por voz'}
    >
      {/* Ícone principal */}
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      
      {/* Indicador de ondas sonoras */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
          </div>
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {isListening ? 'Falando...' : 'Busca por voz'}
      </div>
    </button>
  );
}

export default VoiceSearchButton;
