/**
 * Utility functions for resolving 3-letter CCA3 country codes to full country objects and names.
 */

/**
 * Resolves a 3-letter CCA3 code to its corresponding country object in the dataset.
 * @param {string} cca3 - 3-letter CCA3 code (e.g. 'DEU')
 * @param {Array} countries - Array of country objects
 * @returns {Object|null} Country object or null if not found
 */
export function resolveCca3ToCountry(cca3, countries = []) {
  if (!cca3 || !Array.isArray(countries)) return null;
  const upperCode = String(cca3).toUpperCase().trim();
  return countries.find((c) => c?.cca3?.toUpperCase() === upperCode) || null;
}

/**
 * Resolves a 3-letter CCA3 code to its full common country name.
 * Falls back to the CCA3 code if the country is not found.
 * @param {string} cca3 - 3-letter CCA3 code (e.g. 'DEU')
 * @param {Array} countries - Array of country objects
 * @returns {string} Resolved common country name (e.g. 'Germany') or CCA3 fallback
 */
export function resolveCca3ToName(cca3, countries = []) {
  if (!cca3) return '';
  const country = resolveCca3ToCountry(cca3, countries);
  return country?.name?.common || String(cca3);
}

/**
 * Resolves an array of 3-letter CCA3 border codes into an array of border info objects.
 * Handles missing, empty, or non-array inputs gracefully.
 * @param {Array<string>} borderCodes - Array of CCA3 codes (e.g. ['AUT', 'BEL', 'DEU'])
 * @param {Array} countries - Array of country objects
 * @returns {Array<{ code: string, name: string, country: Object|null }>} Resolved border objects
 */
export function resolveBorderCountries(borderCodes = [], countries = []) {
  if (!Array.isArray(borderCodes) || borderCodes.length === 0) {
    return [];
  }
  return borderCodes.map((code) => ({
    code,
    name: resolveCca3ToName(code, countries),
    country: resolveCca3ToCountry(code, countries),
  }));
}

export default {
  resolveCca3ToCountry,
  resolveCca3ToName,
  resolveBorderCountries,
};
