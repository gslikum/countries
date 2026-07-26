import { describe, it, expect } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 4: Real-World E2E Scenarios', () => {
  it('R-T4-1: Complete End-to-End User Journey across all application features', async () => {
    const env = createTestEnvironment();

    // Step 1: Initial page load renders skeleton loaders
    expect(env.simulator.state.loading).toBe(true);
    let skeletons = env.browser.document.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBeGreaterThan(0);

    // Step 2: Data loads, populating grid
    await env.simulator.loadData();
    expect(env.simulator.state.loading).toBe(false);
    let cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBeGreaterThanOrEqual(250);

    // Step 3: User switches to Dark Mode
    const themeBtn = env.browser.document.querySelector('.theme-toggle-btn');
    expect(themeBtn).not.toBeNull();
    env.simulator.toggleTheme();

    expect(env.simulator.state.theme).toBe('dark');
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(env.browser.localStorage.getItem('theme')).toBe('dark');

    // Step 4: User filters by Region "Europe"
    const regionSelect = env.browser.document.querySelector('#region-filter');
    expect(regionSelect).not.toBeNull();
    env.simulator.setSelectedRegion('Europe');

    const europeanCountries = env.simulator.getFilteredCountries();
    expect(europeanCountries.every(c => c.region === 'Europe')).toBe(true);
    expect(europeanCountries.length).toBeGreaterThan(0);

    // Step 5: User types search query "France"
    const searchInput = env.browser.document.querySelector('#search-input');
    expect(searchInput).not.toBeNull();
    env.simulator.setSearchQuery('France');

    const franceFiltered = env.simulator.getFilteredCountries();
    expect(franceFiltered.length).toBe(1);
    expect(franceFiltered[0].name.common).toBe('France');

    // Step 6: User clicks France card to open Detail View
    const franceCard = env.browser.document.querySelector('.country-card[data-cca3="FRA"]');
    expect(franceCard).not.toBeNull();
    env.simulator.selectCountry('FRA');

    expect(env.simulator.state.selectedCountryCca3).toBe('FRA');
    const detailTitle = env.browser.document.querySelector('.country-name');
    expect(detailTitle.textContent).toBe('France');

    const borderBadges = env.browser.document.querySelectorAll('.border-badge');
    expect(borderBadges.length).toBeGreaterThan(0);

    // Step 7: User clicks Germany (DEU) border badge
    const germanyBadge = borderBadges.find(b => b.getAttribute('data-cca3') === 'DEU');
    expect(germanyBadge).toBeDefined();
    expect(germanyBadge.textContent).toBe('Germany');
    
    env.simulator.selectCountry('DEU');
    expect(env.simulator.state.selectedCountryCca3).toBe('DEU');
    expect(env.browser.document.querySelector('.country-name').textContent).toBe('Germany');

    // Step 8: User clicks Back button -> returns to Grid View preserving state
    const backBtn = env.browser.document.querySelector('.back-button');
    expect(backBtn).not.toBeNull();
    env.simulator.goBack();

    expect(env.simulator.state.selectedCountryCca3).toBe('FRA'); // Back from Germany to France
    env.simulator.goBack(); // Back from France to Grid
    expect(env.simulator.state.selectedCountryCca3).toBeNull();

    expect(env.simulator.state.searchQuery).toBe('France');
    expect(env.simulator.state.selectedRegion).toBe('Europe');

    // Step 9: User clears search query -> restores full European list
    env.simulator.setSearchQuery('');
    const finalEuropeanList = env.simulator.getFilteredCountries();
    expect(finalEuropeanList.length).toBe(europeanCountries.length);
    expect(finalEuropeanList.every(c => c.region === 'Europe')).toBe(true);
  });
});
