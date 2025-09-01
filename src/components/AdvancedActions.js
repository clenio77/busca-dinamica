import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  History, 
  Bookmark, 
  FileText, 
  Mail, 
  MessageCircle, 
  Copy, 
  QrCode,
  MoreHorizontal,
  X
} from 'lucide-react';
import { 
  exportToCSV, 
  exportToJSON, 
  shareViaWhatsApp, 
  shareViaEmail, 
  shareViaSMS, 
  copyToClipboard,
  generateQRCode,
  shareMultipleAddresses
} from '../utils/exportUtils';

function AdvancedActions({ 
  addresses, 
  searchTerm, 
  onShowHistory, 
  onShowSavedFilters,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const hasResults = addresses && addresses.length > 0;

  const handleExportCSV = () => {
    try {
      exportToCSV(addresses, `enderecos_${searchTerm || 'busca'}.csv`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(addresses, `enderecos_${searchTerm || 'busca'}.json`);
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (addresses.length === 1) {
      shareViaWhatsApp(addresses[0]);
    } else {
      shareMultipleAddresses(addresses, 'whatsapp');
    }
  };

  const handleShareEmail = () => {
    if (addresses.length === 1) {
      shareViaEmail(addresses[0]);
    } else {
      shareMultipleAddresses(addresses, 'email');
    }
  };

  const handleShareSMS = () => {
    if (addresses.length === 1) {
      shareViaSMS(addresses[0]);
    } else {
      shareMultipleAddresses(addresses, 'sms');
    }
  };

  const handleCopyAll = async () => {
    const text = addresses.map((address, index) => 
      `${index + 1}. ${address.cep} - ${address.logradouro}, ${address.bairro}, ${address.cidade}/${address.estado}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleShowQRCode = () => {
    if (addresses.length === 1) {
      const qrUrl = generateQRCode(addresses[0]);
      setQrCodeData({ url: qrUrl, address: addresses[0] });
      setShowQRCode(true);
    }
  };

  return (
    <>
      {/* Botão principal */}
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
          aria-label="Ações avançadas"
          title="Ações avançadas"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* Menu dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Ações Avançadas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {/* Histórico */}
                <button
                  onClick={() => {
                    onShowHistory();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <History className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Histórico de Buscas</span>
                </button>

                {/* Filtros Salvos */}
                <button
                  onClick={() => {
                    onShowSavedFilters();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Filtros Salvos</span>
                </button>

                {/* Divisor */}
                {hasResults && (
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                )}

                {/* Exportação */}
                {hasResults && (
                  <>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">Exportar CSV</span>
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">Exportar JSON</span>
                    </button>
                  </>
                )}

                {/* Compartilhamento */}
                {hasResults && (
                  <>
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Compartilhar WhatsApp</span>
                    </button>

                    <button
                      onClick={handleShareEmail}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">Compartilhar Email</span>
                    </button>

                    <button
                      onClick={handleShareSMS}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">Compartilhar SMS</span>
                    </button>

                    <button
                      onClick={handleCopyAll}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Copy className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Copiar Todos</span>
                    </button>

                    {addresses.length === 1 && (
                      <button
                        onClick={handleShowQRCode}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <QrCode className="w-5 h-5 text-black dark:text-white" />
                        <span className="text-gray-700 dark:text-gray-300">Gerar QR Code</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {showQRCode && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                QR Code do Endereço
              </h3>
              
              <img 
                src={qrCodeData.url} 
                alt="QR Code" 
                className="mx-auto mb-4 border border-gray-200 dark:border-gray-600"
              />
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {qrCodeData.address.cep} - {qrCodeData.address.logradouro}
              </p>
              
              <button
                onClick={() => setShowQRCode(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdvancedActions;
