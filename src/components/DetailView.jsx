import React from 'react';
import { useCountries } from '../context/CountryContext.jsx';
import { formatPopulation } from '../utils/formatters.js';
import { resolveCca3ToCountry, resolveCca3ToName } from '../utils/cca3Resolver.js';

/**
 * DetailView component displaying extended metadata for a single country,
 * border country navigation badges, and a state-preserving Back button.
 */
export function DetailView({ country, onBack, onSelectCountry, countries: propCountries }) {
  const { countries: contextCountries } = useCountries ? useCountries() : { countries: [] };
  const countries = propCountries || contextCountries || [];

  // Handle case where country is passed as a CCA3 string code
  const targetCountry = typeof country === 'string'
    ? resolveCca3ToCountry(country, countries)
    : country;

  if (!targetCountry) {
    return (
      <div className="container">
        <button
          id="back-button"
          className="back-button"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
        <div className="error-state">Country details not found.</div>
      </div>
    );
  }

  const name = targetCountry.name?.common || 'Unknown';
  const flagSrc = targetCountry.flags?.svg || targetCountry.flags?.png || '';
  const flagAlt = targetCountry.flags?.alt || `${name} flag`;
  const population = formatPopulation(targetCountry.population);
  const region = targetCountry.region || 'N/A';
  const subregion = targetCountry.subregion || 'N/A';
  const capital = Array.isArray(targetCountry.capital)
    ? targetCountry.capital.join(', ')
    : (targetCountry.capital || 'N/A');
  const tld = Array.isArray(targetCountry.tld)
    ? targetCountry.tld.join(', ')
    : (targetCountry.tld || 'N/A');

  // Format Native Name
  const nativeName = (() => {
    if (targetCountry.name?.nativeName && typeof targetCountry.name.nativeName === 'object') {
      const entries = Object.values(targetCountry.name.nativeName);
      if (entries.length > 0 && entries[0]) {
        return entries[0].common || entries[0].official || name;
      }
    }
    return name;
  })();

  // Format Currencies
  const currencies = (() => {
    if (!targetCountry.currencies || typeof targetCountry.currencies !== 'object') return 'N/A';
    const list = Object.values(targetCountry.currencies)
      .map((c) => c?.name)
      .filter(Boolean);
    return list.length > 0 ? list.join(', ') : 'N/A';
  })();

  // Format Languages
  const languages = (() => {
    if (!targetCountry.languages || typeof targetCountry.languages !== 'object') return 'N/A';
    const list = Object.values(targetCountry.languages).filter(Boolean);
    return list.length > 0 ? list.join(', ') : 'N/A';
  })();

  const borders = Array.isArray(targetCountry.borders) ? targetCountry.borders : [];

  const handleBorderClick = (borderCca3) => {
    if (onSelectCountry) {
      onSelectCountry(borderCca3);
    }
  };

  return (
    <div className="country-detail" data-cca3={targetCountry.cca3}>
      <button
        id="back-button"
        className="back-button"
        onClick={onBack}
        type="button"
        aria-label="Back to main page"
      >
        ← Back
      </button>

      <div className="detail-container">
        <div className="detail-flag-wrapper">
          <img
            src={flagSrc}
            alt={flagAlt}
            className="detail-flag"
          />
        </div>

        <div className="detail-content">
          <h2 className="country-name">{name}</h2>

          <div className="detail-info-grid">
            <div className="info-column">
              <p className="native-name">
                <strong>Native Name:</strong> {nativeName}
              </p>
              <p className="population">
                <strong>Population:</strong> {population}
              </p>
              <p className="region">
                <strong>Region:</strong> {region}
              </p>
              <p className="subregion">
                <strong>Sub Region:</strong> {subregion}
              </p>
              <p className="capital">
                <strong>Capital:</strong> {capital}
              </p>
            </div>

            <div className="info-column">
              <p className="tld">
                <strong>Top Level Domain:</strong> {tld}
              </p>
              <p className="currencies">
                <strong>Currencies:</strong> {currencies}
              </p>
              <p className="languages">
                <strong>Languages:</strong> {languages}
              </p>
            </div>
          </div>

          <div className="border-countries">
            <span className="border-title">Border Countries:</span>
            {borders.length > 0 ? (
              <div className="border-badges">
                {borders.map((borderCca3) => {
                  const borderName = resolveCca3ToName(borderCca3, countries);
                  return (
                    <button
                      key={borderCca3}
                      type="button"
                      className="border-badge"
                      data-cca3={borderCca3}
                      onClick={() => handleBorderClick(borderCca3)}
                    >
                      {borderName}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="no-borders"> None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailView;
