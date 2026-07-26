/**
 * Service module for fetching country data from REST Countries API with resilient fallback.
 * 
 * Primary endpoint: https://restcountries.com/v3.1/all
 * Safeguard fallback endpoint: /data.json
 * Default timeout: 5 seconds (5000 ms)
 */

export const REST_COUNTRIES_API_URL = 'https://restcountries.com/v3.1/all';
export const LOCAL_FALLBACK_URL = '/data.json';
export const DEFAULT_FETCH_TIMEOUT_MS = 5000;

/**
 * Fetches country data with 5-second timeout and automatic local safeguard fallback.
 * 
 * @param {Object} [options]
 * @param {string} [options.apiUrl] - Primary REST Countries API endpoint
 * @param {string} [options.fallbackUrl] - Local safeguard fallback dataset URL
 * @param {number} [options.timeoutMs] - Fetch timeout in milliseconds
 * @returns {Promise<{ data: Array, isFallback: boolean }>}
 */
export async function fetchCountries(options = {}) {
  const apiUrl = options.apiUrl || REST_COUNTRIES_API_URL;
  const fallbackUrl = options.fallbackUrl || LOCAL_FALLBACK_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;

  let timerId;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

  try {
    const fetchOpts = {};
    if (controller) {
      fetchOpts.signal = controller.signal;
      timerId = setTimeout(() => controller.abort(), timeoutMs);
    }

    const response = await fetch(apiUrl, fetchOpts);
    if (timerId) clearTimeout(timerId);

    if (!response.ok) {
      throw new Error(`Primary API returned non-200 HTTP status: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      isFallback: false
    };
  } catch (primaryError) {
    if (timerId) clearTimeout(timerId);

    // API fetch failed, timed out, or returned non-200. Execute fallback.
    try {
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback returned non-200 HTTP status: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return {
        data: fallbackData,
        isFallback: true
      };
    } catch (fallbackError) {
      throw new Error(
        `Failed to fetch country data: Primary API error (${primaryError.message}), Fallback error (${fallbackError.message})`
      );
    }
  }
}

export default fetchCountries;
