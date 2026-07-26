import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 1: Detailed Country Page & Border Navigation (R4)', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R4-T1-1: Clicking country card opens detail view for target country', () => {
    env.simulator.selectCountry('FRA'); // France CCA3
    
    expect(env.simulator.state.selectedCountryCca3).toBe('FRA');
    const nameEl = env.browser.document.querySelector('.country-name');
    expect(nameEl).not.toBeNull();
    expect(nameEl.textContent).toBe('France');
  });

  it('R4-T1-2: Detail view renders full metadata fields', () => {
    env.simulator.selectCountry('DEU'); // Germany CCA3
    
    const nativeName = env.browser.document.querySelector('.native-name');
    const population = env.browser.document.querySelector('.population');
    const region = env.browser.document.querySelector('.region');
    const subregion = env.browser.document.querySelector('.subregion');
    const capital = env.browser.document.querySelector('.capital');
    const tld = env.browser.document.querySelector('.tld');
    const currencies = env.browser.document.querySelector('.currencies');
    const languages = env.browser.document.querySelector('.languages');

    expect(nativeName.textContent).toContain('Native Name');
    expect(population.textContent).toContain('Population');
    expect(region.textContent).toContain('Region: Europe');
    expect(subregion.textContent).toContain('Sub Region');
    expect(capital.textContent).toContain('Berlin');
    expect(tld.textContent).toContain('.de');
    expect(currencies.textContent).toContain('Euro');
    expect(languages.textContent).toContain('German');
  });

  it('R4-T1-3: Border badges resolve 3-letter CCA3 codes to full country names', () => {
    env.simulator.selectCountry('FRA'); // France borders: AUT, BEL, DEU, ITA, LUX, MC, ESP, CHE

    const borderBadges = env.browser.document.querySelectorAll('.border-badge');
    expect(borderBadges.length).toBeGreaterThan(0);
    
    const germanyBadge = borderBadges.find(b => b.getAttribute('data-cca3') === 'DEU');
    expect(germanyBadge).toBeDefined();
    expect(germanyBadge.textContent).toBe('Germany'); // Resolved full country name
  });

  it('R4-T1-4: Clicking a border badge navigates to border country detail view', () => {
    env.simulator.selectCountry('FRA'); // Start at France
    env.simulator.selectCountry('DEU'); // Click Germany border badge

    expect(env.simulator.state.selectedCountryCca3).toBe('DEU');
    const nameEl = env.browser.document.querySelector('.country-name');
    expect(nameEl.textContent).toBe('Germany');
  });

  it('R4-T1-5: Back button in detail view returns to grid view', () => {
    env.simulator.selectCountry('FRA');
    expect(env.simulator.state.selectedCountryCca3).toBe('FRA');

    env.simulator.goBack();
    expect(env.simulator.state.selectedCountryCca3).toBeNull();
    const grid = env.browser.document.querySelector('.countries-grid');
    expect(grid).not.toBeNull();
  });
});
