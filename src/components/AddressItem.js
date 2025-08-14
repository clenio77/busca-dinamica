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
        {highlight(address.street, query)}
        <strong> |{highlight(address.cep, query)}| </strong>
        {highlight(address.neighborhood, query)}
      </button>
    </li>
  );
});

export default AddressItem; 