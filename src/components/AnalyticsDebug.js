import React, { useState, useEffect } from 'react';
import { isAnalyticsEnabled, getDeviceInfo, getSessionInfo } from '../config/analytics';

function AnalyticsDebug() {
  const [events, setEvents] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDeviceInfo(getDeviceInfo());
      setSessionInfo(getSessionInfo());
    }
  }, []);

  // Função para adicionar eventos ao debug
  const addEvent = (event) => {
    setEvents(prev => [{
      ...event,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now()
    }, ...prev.slice(0, 9)]); // Manter apenas os últimos 10 eventos
  };

  // Expor função globalmente para debug
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.debugAnalytics = {
        addEvent,
        deviceInfo,
        sessionInfo,
        isEnabled: isAnalyticsEnabled()
      };
    }
  }, [deviceInfo, sessionInfo]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Analytics Debug
        </h3>
        <div className={`w-2 h-2 rounded-full ${isAnalyticsEnabled() ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* Status */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        Status: {isAnalyticsEnabled() ? 'Ativo' : 'Inativo'}
      </div>

      {/* Device Info */}
      {deviceInfo && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div>Device: {deviceInfo.deviceType}</div>
          <div>Screen: {deviceInfo.screenSize}</div>
          <div>Language: {deviceInfo.language}</div>
        </div>
      )}

      {/* Session Info */}
      {sessionInfo && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div>Session: {sessionInfo.sessionId.slice(-8)}</div>
          <div>Load Time: {Math.round(sessionInfo.pageLoadTime)}ms</div>
        </div>
      )}

      {/* Recent Events */}
      <div className="text-xs">
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Eventos Recentes:</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {events.map(event => (
            <div key={event.id} className="text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>{event.timestamp}</span>
                <span className="text-blue-500">{event.category}</span>
              </div>
              <div className="text-gray-400">{event.action}</div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-gray-400 italic">Nenhum evento registrado</div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
        Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">window.debugAnalytics.addEvent()</code> para testar eventos
      </div>
    </div>
  );
}

export default AnalyticsDebug;
