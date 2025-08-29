import React, { useRef, useEffect } from 'react';
import AddressItem from './AddressItem';
import LoadingSkeleton from './LoadingSkeleton';
import { FixedSizeList as VirtualList } from 'react-window';

<<<<<<< HEAD
function AddressList({ addresses, searchTerm, selectedState, onCopy, loading }) {
=======
function AddressList({ addresses, searchTerm, onCopy, loading }) {
>>>>>>> 942b7dec60e22afc3363115ba6c75547a46ecfe8
  const shouldDisplayList = searchTerm.length >= 2;
  const largeList = addresses.length > 2000;
  const itemRefs = useRef([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, addresses.length);
  }, [addresses.length]);

  // Loading state
  if (loading && shouldDisplayList) {
    return (
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <LoadingSkeleton count={8} />
      </main>
    );
  }

  // Empty state when no search term
  if (!shouldDisplayList) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Comece sua busca
          </h3>
          <p className="text-gray-500">
            Digite pelo menos 2 caracteres para buscar endereços
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <p className="text-lg font-semibold text-gray-700" aria-live="polite" aria-atomic="true">
            {addresses.length} {addresses.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        </div>

        {addresses.length > 0 && (
          <div className="text-sm text-gray-500">
            {largeList && 'Lista virtualizada para melhor performance'}
          </div>
        )}
      </div>

      {/* Results List */}
      {addresses.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {largeList ? (
            <VirtualList
              height={600}
              itemCount={addresses.length}
              itemSize={80}
              width={"100%"}
              style={{ overflowX: 'hidden' }}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {({ index, style }) => (
                <div style={style} className="px-1">
                  <AddressItem
                    address={addresses[index]}
                    query={searchTerm}
                    tabIndex={0}
                    ref={el => itemRefs.current[index] = el}
                    id={`address-item-${index}`}
                    key={addresses[index].cep + (addresses[index].logradouro || '') + (addresses[index].bairro || '')}
                    isVirtualized={true}
                    onCopy={onCopy}
                  />
                </div>
              )}
            </VirtualList>
          ) : (
            <div className="divide-y divide-gray-100">
              {addresses.map((address, idx) => (
                <AddressItem
                  key={address.cep + (address.logradouro || '') + (address.bairro || '')}
                  address={address}
                  query={searchTerm}
                  tabIndex={0}
                  ref={el => itemRefs.current[idx] = el}
                  id={`address-item-${idx}`}
                  onCopy={onCopy}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // No results state
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-500">
              Tente buscar com termos diferentes ou verifique a ortografia
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default AddressList;