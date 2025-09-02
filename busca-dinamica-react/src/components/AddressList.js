import React, { useRef, useEffect } from 'react';
import AddressItem from './AddressItem';
import { FixedSizeList as VirtualList } from 'react-window';

function AddressList({ addresses, searchTerm }) {
  const shouldDisplayList = searchTerm.length > 0;
  const largeList = addresses.length > 2000;
  const itemRefs = useRef([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, addresses.length);
  }, [addresses.length]);

  return (
    <main className="main-content">
      {shouldDisplayList && (
        <>
          <p className="results-count" aria-live="polite" aria-atomic="true">
            {addresses.length} resultado(s)
          </p>
          {addresses.length > 0 ? (
            largeList ? (
              <ul className="address-list">
                <VirtualList
                  height={600}
                  itemCount={addresses.length}
                  itemSize={64}
                  width={"100%"}
                  style={{ overflowX: 'hidden' }}
                >
                  {({ index, style }) => (
                    <AddressItem
                      address={addresses[index]}
                      query={searchTerm}
                      tabIndex={0}
                      ref={el => itemRefs.current[index] = el}
                      id={`address-item-${index}`}
                      style={style}
                      key={addresses[index].cep + (addresses[index].street || '') + (addresses[index].neighborhood || '')}
                    />
                  )}
                </VirtualList>
              </ul>
            ) : (
              <ul className="address-list">
                {addresses.map((address, idx) => (
                  <AddressItem
                    key={address.cep + (address.street || '') + (address.neighborhood || '')}
                    address={address}
                    query={searchTerm}
                    tabIndex={0}
                    ref={el => itemRefs.current[idx] = el}
                    id={`address-item-${idx}`}
                  />
                ))}
              </ul>
            )
          ) : null}
        </>
      )}
    </main>
  );
}

export default AddressList;