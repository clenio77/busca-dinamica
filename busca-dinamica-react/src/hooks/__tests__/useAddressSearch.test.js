import { renderHook, waitFor } from '@testing-library/react';
import { useAddressSearch } from '../useAddressSearch';

// Mock do fetch global
global.fetch = jest.fn();

describe('useAddressSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return addresses when search term is provided', async () => {
    const mockData = [
      { street: 'Rua Teste', neighborhood: 'Centro', city: 'Uberlandia', state: 'MG', cep: '38400-000' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData })
    });

    const { result } = renderHook(() => useAddressSearch());

    // Simular mudança no termo de busca
    result.current.setSearchTerm('teste');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cep/search?q=teste');
    });

    expect(result.current.addresses).toEqual(mockData);
  });

  it('should not fetch when search term is empty', async () => {
    const { result } = renderHook(() => useAddressSearch());

    // Não deve fazer fetch com termo vazio
    result.current.setSearchTerm('');

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useAddressSearch());

    result.current.setSearchTerm('teste');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.addresses).toEqual([]);
  });

  it('should load initial data on mount', async () => {
    const mockData = [
      { street: 'Rua Inicial', neighborhood: 'Centro', city: 'Uberlandia', state: 'MG', cep: '38400-000' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData })
    });

    const { result } = renderHook(() => useAddressSearch());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/ceps.json');
    });

    expect(result.current.addresses).toEqual(mockData);
  });
});
