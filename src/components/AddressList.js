import React from 'react';
import AddressItem from './AddressItem';

function AddressList({ addresses, searchTerm }) {
  // A lógica de exibir/ocultar baseada no searchTerm está no App.js, 
  // aqui apenas renderizamos os endereços filtrados.
  const shouldDisplayList = searchTerm.length > 0;

  return (
    <main className="main-content">
      {shouldDisplayList && (
        <>
          <p className="results-count">{addresses.length} resultado(s)</p>
          <ul id="ul">
            {addresses.length > 0 ? (
              addresses.map(address => (
                <AddressItem key={address.id} address={address} query={searchTerm} />
              ))
            ) : (
              <li className="empty-state">Nenhum resultado</li>
            )}
          </ul>
        </>
      )}
    </main>
  );
}

export default AddressList; 