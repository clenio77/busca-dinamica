import { renderHook, act } from '@testing-library/react';
import { useAddressSearch } from './useAddressSearch';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

it('should return addresses when search term is provided', async () => {
  const mockData = [{ cep: '12345-678', logradouro: 'Rua Teste' }];
  fetch.mockResolvedValueOnce({ 
    json: async () => ({ success: true, data: mockData }),
  });

  const { result } = renderHook(() => useAddressSearch());

  await act(async () => {
    result.current.setSearchTerm('teste');
    // Aguardar o debounce
    await new Promise(resolve => setTimeout(resolve, 250));
  });

  expect(fetch).toHaveBeenCalledWith('/api/cep/search?q=teste');
  expect(result.current.addresses).toEqual(mockData);
});

it('should not fetch when search term is empty', async () => {
  const { result } = renderHook(() => useAddressSearch());

  await act(async () => {
    result.current.setSearchTerm('');
    await new Promise(resolve => setTimeout(resolve, 250));
  });

  expect(fetch).not.toHaveBeenCalled();
  expect(result.current.addresses).toEqual([]);
});
