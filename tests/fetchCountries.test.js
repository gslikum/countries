import { describe, it, expect, beforeEach, afterEach } from './helpers/test_framework.js';
import { fetchCountries, REST_COUNTRIES_API_URL, LOCAL_FALLBACK_URL } from '../src/services/fetchCountries.js';

describe('Milestone 2 Unit & Integration Tests: Data Acquisition & Resilient Fallback (fetchCountries & CountryContext)', () => {
  let originalFetch;

  const mockApiData = [
    {
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      cca3: 'DEU',
      region: 'Europe',
      population: 83240525,
      flags: { png: 'de.png', svg: 'de.svg' }
    },
    {
      name: { common: 'Japan', official: 'Japan' },
      cca3: 'JPN',
      region: 'Asia',
      population: 125836021,
      flags: { png: 'jp.png', svg: 'jp.svg' }
    }
  ];

  const mockFallbackData = [
    {
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      cca3: 'DEU',
      region: 'Europe',
      population: 83240525,
      flags: { png: 'de.png', svg: 'de.svg' }
    },
    {
      name: { common: 'Brazil', official: 'Federative Republic of Brazil' },
      cca3: 'BRA',
      region: 'Americas',
      population: 212559417,
      flags: { png: 'br.png', svg: 'br.svg' }
    }
  ];

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('1. API Success: Fetches from REST Countries API and returns isFallback = false', async () => {
    let fetchCalledUrl = null;

    globalThis.fetch = async (url) => {
      fetchCalledUrl = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => mockApiData
      };
    };

    const result = await fetchCountries();

    expect(fetchCalledUrl).toBe(REST_COUNTRIES_API_URL);
    expect(result.isFallback).toBe(false);
    expect(result.data).toEqual(mockApiData);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name.common).toBe('Germany');
  });

  it('2. API Non-200 Status: Primary API returns 500 status -> falls back to /data.json with isFallback = true', async () => {
    const fetchedUrls = [];

    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      fetchedUrls.push(urlStr);

      if (urlStr.includes('restcountries.com')) {
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        };
      }

      if (urlStr.includes('data.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockFallbackData
        };
      }

      throw new Error(`Unexpected URL: ${urlStr}`);
    };

    const result = await fetchCountries();

    expect(fetchedUrls.length).toBe(2);
    expect(fetchedUrls[0]).toBe(REST_COUNTRIES_API_URL);
    expect(fetchedUrls[1]).toBe(LOCAL_FALLBACK_URL);
    expect(result.isFallback).toBe(true);
    expect(result.data).toEqual(mockFallbackData);
  });

  it('3. API Network Error: Primary API fetch throws error -> falls back to /data.json', async () => {
    const fetchedUrls = [];

    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      fetchedUrls.push(urlStr);

      if (urlStr.includes('restcountries.com')) {
        throw new Error('Network error connecting to API');
      }

      if (urlStr.includes('data.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockFallbackData
        };
      }

      throw new Error(`Unexpected URL: ${urlStr}`);
    };

    const result = await fetchCountries();

    expect(result.isFallback).toBe(true);
    expect(result.data[1].name.common).toBe('Brazil');
  });

  it('4. API Timeout: Primary API times out -> falls back to /data.json', async () => {
    const fetchedUrls = [];

    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      fetchedUrls.push(urlStr);

      if (urlStr.includes('restcountries.com')) {
        if (options.signal) {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          throw error;
        }
      }

      if (urlStr.includes('data.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockFallbackData
        };
      }

      throw new Error(`Unexpected URL: ${urlStr}`);
    };

    const result = await fetchCountries({ timeoutMs: 50 });

    expect(result.isFallback).toBe(true);
    expect(result.data.length).toBe(2);
  });

  it('5. Dual Network Error: Both primary API and fallback fail -> throws error', async () => {
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('restcountries.com')) {
        throw new Error('Primary API Down');
      }
      if (urlStr.includes('data.json')) {
        throw new Error('Fallback File Missing');
      }
      throw new Error('Network Error');
    };

    let errorCaught = null;
    try {
      await fetchCountries();
    } catch (err) {
      errorCaught = err;
    }

    expect(errorCaught).not.toBeNull();
    expect(errorCaught.message).toContain('Failed to fetch country data');
    expect(errorCaught.message).toContain('Primary API error');
    expect(errorCaught.message).toContain('Fallback error');
  });

  it('6. Schema Validation: Returned country data matches standard schema', async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => mockApiData
    });

    const result = await fetchCountries();
    const country = result.data[0];

    expect(country).toBeDefined();
    expect(country.name).toBeDefined();
    expect(typeof country.name.common).toBe('string');
    expect(typeof country.cca3).toBe('string');
    expect(typeof country.region).toBe('string');
    expect(typeof country.population).toBe('number');
  });
});
