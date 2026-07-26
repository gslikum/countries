import React, { useState, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CountryProvider, useCountries } from './context/CountryContext';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { RegionFilter } from './components/RegionFilter';
import { CountryGrid } from './components/CountryGrid';
import { SkeletonGrid } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import { DetailView } from './components/DetailView';
import { resolveCca3ToCountry } from './utils/cca3Resolver';

export function AppContent({
  onSelectCountry: externalSelectCountry,
  selectedCountryCca3: externalCca3,
  onBack: externalOnBack,
}) {
  const { countries, loading, error } = useCountries();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [internalSelectedCca3, setInternalSelectedCca3] = useState(null);

  // Use controlled prop if provided, otherwise internal state
  const selectedCca3 = externalCca3 !== undefined ? externalCca3 : internalSelectedCca3;

  const handleSelectCountry = (cca3) => {
    setInternalSelectedCca3(cca3);
    if (externalSelectCountry) {
      externalSelectCountry(cca3);
    }
  };

  const handleBack = () => {
    setInternalSelectedCca3(null);
    if (externalOnBack) {
      externalOnBack();
    }
  };

  // Simultaneous filtering combining text search and region dropdown filter
  const filteredCountries = useMemo(() => {
    if (!countries || !Array.isArray(countries)) return [];
    return countries.filter((country) => {
      const countryName = country.name?.common?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || countryName.includes(query);

      const countryRegion = country.region?.toLowerCase() || '';
      const selRegion = selectedRegion.toLowerCase().trim();
      const matchesRegion = !selRegion || countryRegion === selRegion;

      return matchesSearch && matchesRegion;
    });
  }, [countries, searchQuery, selectedRegion]);

  const selectedCountry = useMemo(() => {
    if (!selectedCca3) return null;
    return resolveCca3ToCountry(selectedCca3, countries);
  }, [selectedCca3, countries]);

  return (
    <div className="app-layout">
      <Header />
      <main className="container">
        {selectedCca3 ? (
          <DetailView
            country={selectedCountry || selectedCca3}
            countries={countries}
            onBack={handleBack}
            onSelectCountry={handleSelectCountry}
          />
        ) : (
          <>
            <div className="filter-section">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <RegionFilter
                value={selectedRegion}
                onChange={setSelectedRegion}
              />
            </div>

            {loading ? (
              <SkeletonGrid count={8} />
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : filteredCountries.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                selectedRegion={selectedRegion}
                onResetFilters={() => {
                  setSearchQuery('');
                  setSelectedRegion('');
                }}
              />
            ) : (
              <CountryGrid
                countries={filteredCountries}
                onSelectCountry={handleSelectCountry}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App(props) {
  return (
    <ThemeProvider>
      <CountryProvider>
        <AppContent {...props} />
      </CountryProvider>
    </ThemeProvider>
  );
}
