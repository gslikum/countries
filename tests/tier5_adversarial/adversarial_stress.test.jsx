import { describe, it, expect, beforeEach, afterEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';
import { fetchCountries } from '../../src/services/fetchCountries.js';
import { resolveCca3ToCountry, resolveCca3ToName, resolveBorderCountries } from '../../src/utils/cca3Resolver.js';
import { formatPopulation } from '../../src/utils/formatters.js';

describe('Tier 5: Adversarial Stress Testing & Boundary Attack Surfaces', () => {
  let env;
  let originalFetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ==========================================
  // 1. SPECIAL REGEX & INJECTION CHARACTERS IN SEARCH
  // ==========================================
  it('ADV-1.1: Special regex meta-characters do not throw SyntaxError or crash search filtering', () => {
    const regexChars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\', '.*', '(a|b)*'];

    for (const char of regexChars) {
      expect(() => {
        env.simulator.setSearchQuery(char);
        const filtered = env.simulator.getFilteredCountries();
        expect(Array.isArray(filtered)).toBe(true);
      }).not.toThrow();
    }
  });

  it('ADV-1.2: ReDoS payload patterns do not cause catastrophic backtracking or hang execution', () => {
    const redosPayloads = [
      '(a+)+$',
      '([a-zA-Z]+)*$',
      '(a|aa)+$',
      'a'.repeat(1000) + '!'
    ];

    for (const payload of redosPayloads) {
      const startTime = Date.now();
      env.simulator.setSearchQuery(payload);
      const filtered = env.simulator.getFilteredCountries();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Execution must complete in under 100ms
      expect(Array.isArray(filtered)).toBe(true);
    }
  });

  it('ADV-1.3: Script injection, XSS payloads, and SQLi strings in search are treated as literal text', () => {
    const attackStrings = [
      '<script>alert("XSS")</script>',
      '"><img src=x onerror=alert(1)>',
      "' OR '1'='1",
      "'; DROP TABLE countries;--",
      '${alert(1)}'
    ];

    for (const attackStr of attackStrings) {
      env.simulator.setSearchQuery(attackStr);
      const filtered = env.simulator.getFilteredCountries();
      // Should safely return 0 results without rendering raw HTML scripts or crashing
      expect(filtered.length).toBe(0);

      const emptyState = env.browser.document.querySelector('.empty-state');
      expect(emptyState).not.toBeNull();
    }
  });

  it('ADV-1.4: Extreme query length (100,000 chars) handles gracefully without memory overflow', () => {
    const massiveQuery = 'A'.repeat(100000);
    expect(() => {
      env.simulator.setSearchQuery(massiveQuery);
      const filtered = env.simulator.getFilteredCountries();
      expect(filtered.length).toBe(0);
    }).not.toThrow();
  });

  it('ADV-1.5: Emojis, zero-width characters, and non-ASCII unicode in search query', () => {
    const unicodeQueries = ['🇩🇪', '🇯🇵', '\u200B\u200C\u200D', 'Åland', 'Côte d\'Ivoire'];

    for (const query of unicodeQueries) {
      expect(() => {
        env.simulator.setSearchQuery(query);
        const filtered = env.simulator.getFilteredCountries();
        expect(Array.isArray(filtered)).toBe(true);
      }).not.toThrow();
    }
  });

  // ==========================================
  // 2. INVALID REGION FILTERS & COMBINATIONS
  // ==========================================
  it('ADV-2.1: Invalid or malicious region strings return empty array without runtime errors', () => {
    const invalidRegions = ['Atlantis', 'Narnia', '<script>', '12345', '\0'];

    for (const region of invalidRegions) {
      env.simulator.setSelectedRegion(region);
      const filtered = env.simulator.getFilteredCountries();
      expect(filtered.length).toBe(0);
    }
  });

  it('ADV-2.2: Region filtering handles extra whitespace and mixed casing gracefully', () => {
    env.simulator.setSelectedRegion('  europe  ');
    const filtered = env.simulator.getFilteredCountries();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region.toLowerCase() === 'europe')).toBe(true);
  });

  // ==========================================
  // 3. MISSING BORDER CODES & INVALID BORDER BADGES
  // ==========================================
  it('ADV-3.1: Country with undefined or null borders property renders "None" without error', () => {
    const corruptCountry = {
      name: { common: 'NoBorderLand' },
      cca3: 'NBL',
      population: 100,
      region: 'Europe',
      borders: undefined
    };

    expect(() => resolveBorderCountries(corruptCountry.borders, env.simulator.state.countries)).not.toThrow();
    expect(resolveBorderCountries(corruptCountry.borders, env.simulator.state.countries)).toEqual([]);
  });

  it('ADV-3.2: Border array with non-existent, numeric, or corrupt CCA3 codes resolves to input code string fallback', () => {
    const corruptBorderCodes = ['XYZ999', 'INVALID', '', null, 12345];
    const resolved = resolveBorderCountries(corruptBorderCodes, env.simulator.state.countries);

    expect(resolved.length).toBe(5);
    expect(resolved[0].name).toBe('XYZ999');
    expect(resolved[0].country).toBeNull();
    expect(resolved[1].name).toBe('INVALID');
    expect(resolved[1].country).toBeNull();
  });

  it('ADV-3.3: Resolving cca3 with empty string, null, or undefined returns empty string or null gracefully', () => {
    expect(resolveCca3ToCountry(null, env.simulator.state.countries)).toBeNull();
    expect(resolveCca3ToCountry(undefined, env.simulator.state.countries)).toBeNull();
    expect(resolveCca3ToCountry('', env.simulator.state.countries)).toBeNull();

    expect(resolveCca3ToName(null, env.simulator.state.countries)).toBe('');
    expect(resolveCca3ToName(undefined, env.simulator.state.countries)).toBe('');
    expect(resolveCca3ToName('', env.simulator.state.countries)).toBe('');
  });

  // ==========================================
  // 4. ISLAND COUNTRIES & SPARSE DATASET ENTRIES
  // ==========================================
  it('ADV-4.1: Island countries (Iceland, Madagascar, Japan) display no border badges and "None" feedback', () => {
    const islandCodes = ['ISL', 'MDG', 'JPN', 'CUB'];

    for (const cca3 of islandCodes) {
      env.simulator.selectCountry(cca3);
      expect(env.simulator.state.selectedCountryCca3).toBe(cca3);

      const noBorders = env.browser.document.querySelector('.no-borders');
      expect(noBorders).not.toBeNull();
      expect(noBorders.textContent.trim()).toBe('None');

      const borderBadges = env.browser.document.querySelectorAll('.border-badge');
      expect(borderBadges.length).toBe(0);
    }
  });

  it('ADV-4.2: Extremely sparse country object missing optional fields (capital, languages, currencies, tld, nativeName) formats safely', () => {
    const sparseCountry = {
      name: { common: 'Sparse Land' },
      cca3: 'SPL',
      population: undefined,
      region: undefined,
      capital: undefined,
      subregion: undefined,
      tld: undefined,
      currencies: null,
      languages: null,
      borders: undefined
    };

    expect(formatPopulation(sparseCountry.population)).toBe('N/A');
    expect(resolveCca3ToCountry('SPL', [sparseCountry])).toEqual(sparseCountry);
    expect(resolveCca3ToName('SPL', [sparseCountry])).toBe('Sparse Land');
    expect(resolveBorderCountries(sparseCountry.borders, [sparseCountry])).toEqual([]);
  });

  // ==========================================
  // 5. CORRUPT LOCALSTORAGE THEME DATA
  // ==========================================
  it('ADV-5.1: Corrupt localStorage theme value ("INVALID_THEME", "{bad_json}") defaults to "light" mode', () => {
    const corruptValues = ['INVALID_THEME', '{bad_json: true}', '<script>', 'null', 'undefined', '12345'];

    for (const corruptVal of corruptValues) {
      env.browser.localStorage.setItem('theme', corruptVal);
      const newEnv = createTestEnvironment();
      expect(newEnv.simulator.state.theme).toBe('light');
      expect(newEnv.browser.document.documentElement.getAttribute('data-theme')).toBe('light');
    }
  });

  // ==========================================
  // 6. RAPID THEME TOGGLING STRESS TEST
  // ==========================================
  it('ADV-6.1: Toggling theme 1,000 times rapidly maintains deterministic state consistency', () => {
    const initialTheme = env.simulator.state.theme; // 'light'

    for (let i = 0; i < 1000; i++) {
      env.simulator.toggleTheme();
    }

    // 1000 toggles from light mode must end up at light mode
    expect(env.simulator.state.theme).toBe(initialTheme);
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe(initialTheme);
    expect(env.browser.localStorage.getItem('theme')).toBe(initialTheme);
  });

  it('ADV-6.2: Rapid theme toggle during Detail View navigation maintains theme state', () => {
    env.simulator.selectCountry('DEU');
    env.simulator.toggleTheme(); // dark
    expect(env.simulator.state.theme).toBe('dark');

    env.simulator.selectCountry('FRA');
    expect(env.simulator.state.theme).toBe('dark');

    env.simulator.goBack();
    expect(env.simulator.state.theme).toBe('dark');
  });

  // ==========================================
  // 7. API TIMEOUT & NETWORK FAILURE SCENARIOS
  // ==========================================
  it('ADV-7.1: Primary API 500 error triggers automatic fallback to data.json', async () => {
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('restcountries.com')) {
        return { ok: false, status: 500, statusText: 'Internal Server Error' };
      }
      if (urlStr.includes('data.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ name: { common: 'Fallbackland' }, cca3: 'FBL' }]
        };
      }
      throw new Error(`Unexpected URL: ${urlStr}`);
    };

    const res = await fetchCountries();
    expect(res.isFallback).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].name.common).toBe('Fallbackland');
  });

  it('ADV-7.2: Dual failure (Primary API and Fallback both fail) sets clear error message', async () => {
    const freshEnv = createTestEnvironment();
    freshEnv.browser.apiNetworkShouldFail = true;
    freshEnv.browser.fallbackNetworkShouldFail = true;

    await freshEnv.simulator.loadData();

    expect(freshEnv.simulator.state.countries.length).toBe(0);
    expect(freshEnv.simulator.state.error).toBe('Failed to load countries data.');

    const errorDiv = freshEnv.browser.document.querySelector('.error-state');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv.textContent).toBe('Failed to load countries data.');
  });
});
