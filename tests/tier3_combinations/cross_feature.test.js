import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 3: Cross-Feature Combinations', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R-T3-1: Simultaneous Search Query and Region Dropdown filtering', () => {
    env.simulator.setSearchQuery('ia');
    env.simulator.setSelectedRegion('Asia');

    const filtered = env.simulator.getFilteredCountries();
    expect(filtered.length).toBeGreaterThan(0);

    // All returned countries MUST match BOTH query ("ia") AND region ("Asia")
    for (const c of filtered) {
      expect(c.name.common.toLowerCase()).toContain('ia');
      expect(c.region).toBe('Asia');
    }

    // Nigeria (Africa) matches "ia" but NOT Asia -> MUST NOT BE PRESENT
    expect(filtered.some(c => c.name.common === 'Nigeria')).toBe(false);
    // Austria (Europe) matches "ia" but NOT Asia -> MUST NOT BE PRESENT
    expect(filtered.some(c => c.name.common === 'Austria')).toBe(false);
  });

  it('R-T3-2: Active search and region filters remain intact after theme toggle', () => {
    env.simulator.setSearchQuery('United');
    env.simulator.setSelectedRegion('Americas');
    const countBeforeToggle = env.simulator.getFilteredCountries().length;

    env.simulator.toggleTheme(); // Switch to Dark Mode

    expect(env.simulator.state.theme).toBe('dark');
    expect(env.simulator.state.searchQuery).toBe('United');
    expect(env.simulator.state.selectedRegion).toBe('Americas');
    expect(env.simulator.getFilteredCountries().length).toBe(countBeforeToggle);
  });

  it('R-T3-3: Detail view border navigation retains Dark Mode theme context', () => {
    env.simulator.toggleTheme(); // Set to Dark Mode
    env.simulator.selectCountry('FRA'); // France
    
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe('dark');

    env.simulator.selectCountry('DEU'); // Navigate to Germany via border badge
    expect(env.simulator.state.selectedCountryCca3).toBe('DEU');
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('R-T3-4: Back button preserves previous search and region filter states', () => {
    // 1. Set filters in grid view
    env.simulator.setSearchQuery('land');
    env.simulator.setSelectedRegion('Europe');
    const filteredOriginalCount = env.simulator.getFilteredCountries().length;

    // 2. Open detail view for Finland (FIN)
    const finland = env.simulator.getFilteredCountries().find(c => c.name.common === 'Finland');
    expect(finland).toBeDefined();
    env.simulator.selectCountry(finland.cca3);

    expect(env.simulator.state.selectedCountryCca3).toBe('FIN');

    // 3. Click Back button
    env.simulator.goBack();

    // 4. Grid view restored with filters preserved
    expect(env.simulator.state.selectedCountryCca3).toBeNull();
    expect(env.simulator.state.searchQuery).toBe('land');
    expect(env.simulator.state.selectedRegion).toBe('Europe');
    expect(env.simulator.getFilteredCountries().length).toBe(filteredOriginalCount);
  });
});
