import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 2: Boundary & Corner Cases', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R-T2-1: Empty or whitespace-only search query returns all countries without error', () => {
    env.simulator.setSearchQuery('   ');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThanOrEqual(250);
    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBeGreaterThanOrEqual(250);
  });

  it('R-T2-2: Special characters in search query do not throw regex or runtime errors', () => {
    const specialQueries = ['[', '?', '*', '(', ')', "'", '-', '&', '\\', '$', '^'];

    for (const q of specialQueries) {
      expect(() => {
        env.simulator.setSearchQuery(q);
        env.simulator.getFilteredCountries();
      }).not.toThrow();
    }
  });

  it('R-T2-3: Country with no borders handles empty border array gracefully in detail view', () => {
    // Iceland (ISL) has borders: []
    env.simulator.selectCountry('ISL');

    expect(env.simulator.state.selectedCountryCca3).toBe('ISL');
    const noBordersEl = env.browser.document.querySelector('.no-borders');
    expect(noBordersEl).not.toBeNull();
    expect(noBordersEl.textContent).toContain('None');
    
    // Ensure no broken badge elements created
    const badges = env.browser.document.querySelectorAll('.border-badge');
    expect(badges.length).toBe(0);
  });

  it('R-T2-4: Invalid or blank region filter resets grid to show all regions', () => {
    env.simulator.setSelectedRegion('UnknownRegionX');
    expect(env.simulator.getFilteredCountries().length).toBe(0);

    env.simulator.setSelectedRegion('');
    expect(env.simulator.getFilteredCountries().length).toBeGreaterThanOrEqual(250);
  });

  it('R-T2-5: Rapid theme toggle maintains consistent DOM and localStorage state', () => {
    for (let i = 0; i < 10; i++) {
      env.simulator.toggleTheme();
    }

    // 10 toggles from light mode should end up at light mode
    expect(env.simulator.state.theme).toBe('light');
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(env.browser.localStorage.getItem('theme')).toBe('light');
  });
});
