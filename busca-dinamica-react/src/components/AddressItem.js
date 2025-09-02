import React, { forwardRef } from 'react';

function highlight(text, query) {
  if (!query) return text;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return parts.map((part, index) =>
    pattern.test(part) ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
  );
}


const AddressItem = forwardRef(function AddressItem({ address, query, tabIndex = -1, id, style }, ref) {
  // Helper function to safely get and highlight address parts
  const getDisplayValue = (value) => {
    if (!value || value.trim() === '') return '(não informado)';
    return highlight(value, query);
  };

  return (
    <li style={style}>
      <button
        type="button"
        className="link-item"
        id={id}
        ref={ref}
        tabIndex={tabIndex}
        aria-label={`${address.street || 'Sem logradouro'}, CEP ${address.cep}, bairro ${address.neighborhood || 'Sem bairro'}, cidade ${address.city || 'Sem cidade'}, estado ${address.state || 'Sem estado'}, complemento ${address.complement || 'Sem complemento'}`}
      >
        <span style={{ fontWeight: 600, minWidth: 180 }}>{getDisplayValue(address.street)}</span>
        <span style={{ color: '#b19700', fontWeight: 700, fontSize: '1.1em', margin: '0 10px' }}>
          |{getDisplayValue(address.cep)}|
        </span>
        <span style={{ opacity: 0.85 }}>{getDisplayValue(address.neighborhood)}</span>
        {address.city && address.state && (
          <span style={{ opacity: 0.85, marginLeft: '10px' }}>
            {getDisplayValue(address.city)} - {getDisplayValue(address.state)}
          </span>
        )}
        {address.complement && (
          <span style={{ opacity: 0.7, marginLeft: '10px' }}>
            ({getDisplayValue(address.complement)})
          </span>
        )}
      </button>
    </li>
  );
});

export default AddressItem;