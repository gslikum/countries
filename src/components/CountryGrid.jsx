import React from 'react';
import { CountryCard } from './CountryCard.jsx';

/**
 * CountryGrid component rendering a responsive grid of country cards.
 */
export function CountryGrid({ countries = [], onSelectCountry }) {
  return (
    <div className="countries-grid">
      {countries.map((country) => (
        <CountryCard
          key={country.cca3 || country.name?.common}
          country={country}
          onClick={onSelectCountry}
        />
      ))}
    </div>
  );
}

export default CountryGrid;
