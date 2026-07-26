import React from 'react';
import { formatPopulation } from '../utils/formatters.js';

/**
 * CountryCard component displaying flag image, country name, formatted population, region, and capital.
 */
export function CountryCard({ country, onClick }) {
  if (!country) return null;

  const name = country.name?.common || (typeof country.name === 'string' ? country.name : 'Unknown');
  const flagSrc = country.flags?.svg || country.flags?.png || '';
  const flagAlt = country.flags?.alt || `${name} flag`;
  const populationFormatted = formatPopulation(country.population);
  const region = country.region || 'N/A';
  const capital = Array.isArray(country.capital)
    ? country.capital.join(', ')
    : (country.capital || 'N/A');

  const handleClick = () => {
    if (onClick) {
      onClick(country.cca3 || name);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(country.cca3 || name);
    }
  };

  return (
    <div
      className="country-card"
      data-cca3={country.cca3}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
    >
      <div className="card-flag-wrapper">
        <img
          src={flagSrc}
          alt={flagAlt}
          className="card-flag"
          loading="lazy"
        />
      </div>
      <div className="card-body">
        <h3 className="card-title">{name}</h3>
        <p className="card-pop">
          <strong>Population:</strong> {populationFormatted}
        </p>
        <p className="card-region">
          <strong>Region:</strong> {region}
        </p>
        <p className="card-capital">
          <strong>Capital:</strong> {capital}
        </p>
      </div>
    </div>
  );
}

export default CountryCard;
