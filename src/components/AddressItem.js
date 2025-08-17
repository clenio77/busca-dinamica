import React, { forwardRef } from 'react';

function highlight(text, query) {
  if (!query) return text;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return parts.map((part, index) =>
    pattern.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

const AddressItem = forwardRef(function AddressItem({
  address,
  query,
  tabIndex = -1,
  id,
  style,
  isVirtualized = false,
  onCopy
}, ref) {
  // Garantir que os campos existem e não são undefined
  const logradouro = address.logradouro || 'Logradouro não informado';
  const cep = address.cep || '';
  const bairro = address.bairro || '';
  const cidade = address.cidade || '';

  const handleClick = async () => {
    const fullAddress = `${logradouro}, ${cep}, ${bairro}, ${cidade}`;

    try {
      await navigator.clipboard.writeText(fullAddress);
      if (onCopy) {
        onCopy('Endereço copiado para a área de transferência!', 'success');
      }
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fullAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      if (onCopy) {
        onCopy('Endereço copiado para a área de transferência!', 'success');
      }
    }
  };

  const containerClass = isVirtualized
    ? "mx-2 my-1"
    : "";

  return (
    <div style={style} className={containerClass}>
      <button
        type="button"
        onClick={handleClick}
        className="w-full p-4 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 group"
        id={id}
        ref={ref}
        tabIndex={tabIndex}
        aria-label={`${logradouro}, CEP ${cep}, bairro ${bairro}, ${cidade}. Clique para copiar`}
      >
        <div className="space-y-3">
          {/* Street Address */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                {highlight(logradouro, query)}
              </div>
            </div>

            {/* Copy Icon - Mobile */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* CEP and Location Info */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-2 xs:space-y-0">
            {/* CEP Badge */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {highlight(cep, query)}
              </span>
            </div>

            {/* Location Info */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center">
                  {bairro && (
                    <>
                      <span>{highlight(bairro, query)}</span>
                      {cidade && <span className="mx-2 text-gray-400">•</span>}
                    </>
                  )}
                  {cidade && <span>{highlight(cidade, query)}</span>}
                </span>
              </div>

              {/* Copy Icon - Desktop */}
              <div className="hidden sm:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
});

export default AddressItem; 