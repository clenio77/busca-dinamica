import React, { forwardRef } from 'react';

function highlight(text, query) {
  if (!query) return text;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return parts.map((part, index) =>
    pattern.test(part) ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
  );
}


const AddressItem = forwardRef(function AddressItem({ address, query, tabIndex = -1, id, style }, ref) {
  // Garantir que os campos existem e não são undefined
  const logradouro = address.logradouro || 'Logradouro não informado';
  const cep = address.cep || '';
  const bairro = address.bairro || '';
  const cidade = address.cidade || '';

  return (
    <li style={style}>
      <button
        type="button"
        className="link-item"
        id={id}
        ref={ref}
        tabIndex={tabIndex}
        aria-label={`${logradouro}, CEP ${cep}, bairro ${bairro}, ${cidade}`}
      >
        <span style={{ fontWeight: 600, minWidth: 180 }}>{highlight(logradouro, query)}</span>
        <span style={{ color: '#b19700', fontWeight: 700, fontSize: '1.1em', margin: '0 10px' }}>
          |{highlight(cep, query)}|
        </span>
        <span style={{ opacity: 0.85 }}>
          {bairro && highlight(bairro, query)}
          {bairro && cidade && ' - '}
          {cidade && highlight(cidade, query)}
        </span>
      </button>
    </li>
  );
});

export default AddressItem; 