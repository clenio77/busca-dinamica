import React, { forwardRef } from 'react';

function highlight(text, query) {
  if (!query) return text;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return parts.map((part, index) =>
    pattern.test(part) ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
  );
}


const AddressItem = forwardRef(function AddressItem({ address, query, tabIndex = -1, id }, ref) {
  return (
    <li>
      <button
        type="button"
        className="link-item"
        id={id}
        ref={ref}
        tabIndex={tabIndex}
        aria-label={`${address.street}, CEP ${address.cep}, bairro ${address.neighborhood}`}
      >
        <span style={{ fontWeight: 600, minWidth: 180 }}>{highlight(address.street, query)}</span>
        <span style={{ color: '#b19700', fontWeight: 700, fontSize: '1.1em', margin: '0 10px' }}>
          |{highlight(address.cep, query)}|
        </span>
        <span style={{ opacity: 0.85 }}>{highlight(address.neighborhood, query)}</span>
      </button>
    </li>
  );
});

export default AddressItem; 