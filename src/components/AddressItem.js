import React from 'react';

function highlight(text, query) {
  if (!query) return text;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(pattern);
  return parts.map((part, index) =>
    pattern.test(part) ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
  );
}

function AddressItem({ address, query }) {
  return (
    <li>
      <a href="#">
        {highlight(address.street, query)}
        <strong> |{highlight(address.cep, query)}| </strong>
        {highlight(address.neighborhood, query)}
      </a>
    </li>
  );
}

export default AddressItem; 