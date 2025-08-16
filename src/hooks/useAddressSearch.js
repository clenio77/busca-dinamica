// src/hooks/useAddressSearch.js
import { useState, useEffect } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export function useAddressSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedTerm = useDebouncedValue(searchTerm, 200);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedTerm) {
        setLoading(true);
        try {
          const response = await fetch(`/api/cep/search?q=${debouncedTerm}`);
          const data = await response.json();
          if (data.success) {
            setAddresses(data.data);
          } else {
            console.error("Error fetching data:", data.message);
            setAddresses([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setAddresses([]);
        } finally {
          setLoading(false);
        }
      } else {
        setAddresses([]);
      }
    };

    fetchData();
  }, [debouncedTerm]);

  return { searchTerm, setSearchTerm, addresses, loading };
}
