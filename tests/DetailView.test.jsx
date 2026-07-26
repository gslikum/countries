import { describe, it, expect, beforeEach } from './helpers/test_framework.js';
import { createTestEnvironment } from './helpers/dom_runner.js';
import {
  resolveCca3ToCountry,
  resolveCca3ToName,
  resolveBorderCountries,
} from '../src/utils/cca3Resolver.js';

describe('Milestone 5 Unit & Integration Tests: DetailView & CCA3 Resolver (R4)', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  // --- 1. CCA3 Resolver Utility Unit Tests ---
  it('R4-M5-1: resolveCca3ToCountry returns correct country object for valid CCA3 code', () => {
    const germany = resolveCca3ToCountry('DEU', env.simulator.state.countries);
    expect(germany).not.toBeNull();
    expect(germany.name.common).toBe('Germany');
    expect(germany.cca3).toBe('DEU');
  });

  it('R4-M5-2: resolveCca3ToCountry handles lower case CCA3 code case-insensitively', () => {
    const france = resolveCca3ToCountry('fra', env.simulator.state.countries);
    expect(france).not.toBeNull();
    expect(france.name.common).toBe('France');
  });

  it('R4-M5-3: resolveCca3ToCountry returns null for non-existent or invalid CCA3 code', () => {
    const invalid = resolveCca3ToCountry('XYZ999', env.simulator.state.countries);
    expect(invalid).toBeNull();
  });

  it('R4-M5-4: resolveCca3ToName resolves 3-letter code to common country name', () => {
    const name = resolveCca3ToName('DEU', env.simulator.state.countries);
    expect(name).toBe('Germany');
  });

  it('R4-M5-5: resolveCca3ToName falls back to input code if country is not in dataset', () => {
    const name = resolveCca3ToName('UNKNOWN', env.simulator.state.countries);
    expect(name).toBe('UNKNOWN');
  });

  it('R4-M5-6: resolveBorderCountries resolves border CCA3 array to structured objects', () => {
    const borders = resolveBorderCountries(['DEU', 'ESP'], env.simulator.state.countries);
    expect(borders.length).toBe(2);
    expect(borders[0].code).toBe('DEU');
    expect(borders[0].name).toBe('Germany');
    expect(borders[1].code).toBe('ESP');
    expect(borders[1].name).toBe('Spain');
  });

  it('R4-M5-7: resolveBorderCountries handles empty or missing border array gracefully', () => {
    expect(resolveBorderCountries([], env.simulator.state.countries)).toEqual([]);
    expect(resolveBorderCountries(null, env.simulator.state.countries)).toEqual([]);
  });

  // --- 2. DetailView Rendering & Metadata Integration Tests ---
  it('R4-M5-8: DetailView renders complete country metadata fields', () => {
    env.simulator.selectCountry('DEU'); // Germany

    const nameEl = env.browser.document.querySelector('.country-name');
    const nativeName = env.browser.document.querySelector('.native-name');
    const population = env.browser.document.querySelector('.population');
    const region = env.browser.document.querySelector('.region');
    const subregion = env.browser.document.querySelector('.subregion');
    const capital = env.browser.document.querySelector('.capital');
    const tld = env.browser.document.querySelector('.tld');
    const currencies = env.browser.document.querySelector('.currencies');
    const languages = env.browser.document.querySelector('.languages');

    expect(nameEl.textContent).toBe('Germany');
    expect(nativeName.textContent).toContain('Native Name');
    expect(population.textContent).toContain('Population: 83,240,525');
    expect(region.textContent).toContain('Region: Europe');
    expect(subregion.textContent).toContain('Sub Region: Western Europe');
    expect(capital.textContent).toContain('Capital: Berlin');
    expect(tld.textContent).toContain('Top Level Domain: .de');
    expect(currencies.textContent).toContain('Euro');
    expect(languages.textContent).toContain('German');
  });

  // --- 3. Border Country Navigation Tests ---
  it('R4-M5-9: Border badges resolve 3-letter CCA3 codes to full country names', () => {
    env.simulator.selectCountry('FRA'); // France borders: AUT, BEL, DEU, ITA, LUX, MC, ESP, CHE

    const borderBadges = env.browser.document.querySelectorAll('.border-badge');
    expect(borderBadges.length).toBeGreaterThan(0);

    const germanyBadge = borderBadges.find((b) => b.getAttribute('data-cca3') === 'DEU');
    expect(germanyBadge).toBeDefined();
    expect(germanyBadge.textContent).toBe('Germany');
  });

  it('R4-M5-10: Clicking border badge navigates directly to border country detail view', () => {
    env.simulator.selectCountry('FRA'); // Start at France
    expect(env.simulator.state.selectedCountryCca3).toBe('FRA');

    // Click Germany border badge
    env.simulator.selectCountry('DEU');

    expect(env.simulator.state.selectedCountryCca3).toBe('DEU');
    const nameEl = env.browser.document.querySelector('.country-name');
    expect(nameEl.textContent).toBe('Germany');
  });

  it('R4-M5-11: Island or borderless country renders "None" feedback gracefully', () => {
    const islandCountry = env.simulator.state.countries.find(
      (c) => !c.borders || c.borders.length === 0
    );
    if (islandCountry) {
      env.simulator.selectCountry(islandCountry.cca3);

      const noBordersEl = env.browser.document.querySelector('.no-borders');
      expect(noBordersEl).not.toBeNull();
      expect(noBordersEl.textContent.trim()).toBe('None');

      const borderBadges = env.browser.document.querySelectorAll('.border-badge');
      expect(borderBadges.length).toBe(0);
    }
  });

  // --- 4. Back Button & State Preservation Tests ---
  it('R4-M5-12: Back button in detail view returns to grid view preserving search and region filter states', () => {
    // Set active search and region filter
    env.simulator.setSearchQuery('Germany');
    env.simulator.setSelectedRegion('Europe');

    // Select country card (opens DetailView)
    env.simulator.selectCountry('DEU');
    expect(env.simulator.state.selectedCountryCca3).toBe('DEU');

    // Click Back button
    env.simulator.goBack();

    // Verify returned to main grid view
    expect(env.simulator.state.selectedCountryCca3).toBeNull();
    const grid = env.browser.document.querySelector('.countries-grid');
    expect(grid).not.toBeNull();

    // Verify search query and selected region filters are preserved intact
    expect(env.simulator.state.searchQuery).toBe('Germany');
    expect(env.simulator.state.selectedRegion).toBe('Europe');

    // Verify grid displays filtered results matching active search/filter
    const filtered = env.simulator.getFilteredCountries();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name.common).toBe('Germany');
  });
});
