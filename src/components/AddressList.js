import React, { useRef, useCallback, useEffect } from 'react';
import AddressItem from './AddressItem';
import { FixedSizeList as VirtualList } from 'react-window';

function AddressList({ addresses, searchTerm }) {
  // A lógica de exibir/ocultar baseada no searchTerm está no App.js, 
  // aqui apenas renderizamos os endereços filtrados.
  const shouldDisplayList = searchTerm.length > 0;

  const largeList = addresses.length > 2000;
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, addresses.length);
  }, [addresses.length]);

  const handleKeyDown = useCallback((event) => {
    if (!shouldDisplayList || addresses.length === 0) return;
    const currentIndex = itemRefs.current.findIndex(el => el === document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min((currentIndex >= 0 ? currentIndex + 1 : 0), addresses.length - 1);
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = Math.max((currentIndex >= 0 ? currentIndex - 1 : addresses.length - 1), 0);
      itemRefs.current[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      itemRefs.current[addresses.length - 1]?.focus();
    }
  }, [addresses.length, shouldDisplayList]);

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
                    <AddressItem
                      address={addresses[index]}
                      query={searchTerm}
                      tabIndex={0}
                      ref={el => itemRefs.current[index] = el}
                      id={`address-item-${index}`}
                    />
                  </div>
                )}
              </VirtualList>
            ) : (
              <ul id="ul" onKeyDown={handleKeyDown} ref={listRef}>
                {addresses.map((address, index) => (
                  <AddressItem
                    key={address.id}
                    address={address}
                    query={searchTerm}
                    tabIndex={index === 0 ? 0 : -1}
                    ref={el => itemRefs.current[index] = el}
                    id={`address-item-${index}`}
                  />
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