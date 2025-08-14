import React from 'react';
import AddressItem from './AddressItem';
import { FixedSizeList as VirtualList } from 'react-window';

function AddressList({ addresses, searchTerm }) {
  // A lógica de exibir/ocultar baseada no searchTerm está no App.js, 
  // aqui apenas renderizamos os endereços filtrados.
  const shouldDisplayList = searchTerm.length > 0;

  const largeList = addresses.length > 2000;

  return (
    <main className="main-content">
      {shouldDisplayList && (
        <>
          <p className="results-count" aria-live="polite" aria-atomic="true">
            {addresses.length} resultado(s)
          </p>
          {addresses.length > 0 ? (
            largeList ? (
              <VirtualList
                height={600}
                itemCount={addresses.length}
                itemSize={56}
                width={"100%"}
              >
                {({ index, style }) => (
                  <div style={style}>
                    <AddressItem address={addresses[index]} query={searchTerm} />
                  </div>
                )}
              </VirtualList>
            ) : (
              <ul id="ul">
                {addresses.map(address => (
                  <AddressItem key={address.id} address={address} query={searchTerm} />
                ))}
              </ul>
            )
          ) : (
            <ul id="ul"><li className="empty-state">Nenhum resultado</li></ul>
          )}
        </>
      )}
    </main>
  );
}

export default AddressList; 