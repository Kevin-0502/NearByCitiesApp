import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllCountries } from '../services/countriesService';

const CountriesContext = createContext(null);

export function CountriesProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchAllCountries();
      setCountries(data);
    } catch (err) {
      setError(err.message ?? 'Error al cargar los países');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CountriesContext.Provider value={{ countries, loading, error, reload: load }}>
      {children}
    </CountriesContext.Provider>
  );
}

export const useCountries = () => useContext(CountriesContext);
