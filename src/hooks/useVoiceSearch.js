import { useState, useEffect, useCallback } from 'react';

export function useVoiceSearch(onSearch) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta Web Speech API
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    
    if (!supported) {
      setError('Busca por voz não é suportada neste navegador');
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Busca por voz não é suportada neste navegador');
      return;
    }

    setError(null);
    setTranscript('');
    setIsListening(true);

    // Configurar reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[Voice] Reconhecimento iniciado');
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      
      // Executar busca automaticamente se o resultado for confiável
      if (event.results[0].isFinal && result.length >= 2) {
        onSearch(result);
      }
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Erro no reconhecimento:', event.error);
      setError(`Erro no reconhecimento: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[Voice] Reconhecimento finalizado');
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('[Voice] Erro ao iniciar reconhecimento:', error);
      setError('Erro ao iniciar reconhecimento de voz');
      setIsListening(false);
    }
  }, [isSupported, onSearch]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening
  };
}
