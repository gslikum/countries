import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCountries } from '../services/fetchCountries.js';

export const CountryContext = createContext(null);

/**
 * CountryProvider component supplying country data state to the React component tree.
 */
export function CountryProvider({ children, initialOptions = {} }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const loadCountries = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...initialOptions, ...options };
      const result = await fetchCountries(mergedOptions);
      setCountries(result.data || []);
      setIsFallback(Boolean(result.isFallback));
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while fetching country data.');
      setCountries([]);
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [initialOptions]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const value = {
    countries,
    loading,
    error,
    isFallback,
    refetch: loadCountries
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

/**
 * Custom hook to consume CountryContext state.
 * Returns { countries, loading, error, isFallback, refetch }
 */
export function useCountries() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountries must be used within a CountryProvider');
  }
  return context;
}

export default CountryContext;
