import { describe, it, expect, beforeEach } from './helpers/test_framework.js';
import { createTestEnvironment } from './helpers/dom_runner.js';
import { formatPopulation } from '../src/utils/formatters.js';

describe('Milestone 4: Homepage Grid & Simultaneous Filtering (R3 & R6)', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R3-M4-1: SearchInput live text search filters cards case-insensitively', () => {
    env.simulator.setSearchQuery('gErMaNy');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBe(1);
    expect(filtered[0].name.common).toBe('Germany');

    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(1);
    expect(cards[0].innerText).toContain('Germany');
  });

  it('R3-M4-2: SearchInput partial substring query matches all relevant countries', () => {
    env.simulator.setSearchQuery('unit');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(1);
    expect(filtered.some(c => c.name.common === 'United States')).toBe(true);
    expect(filtered.some(c => c.name.common === 'United Kingdom')).toBe(true);
  });

  it('R3-M4-3: RegionFilter dropdown filters countries by selected region', () => {
    env.simulator.setSelectedRegion('Africa');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    for (const country of filtered) {
      expect(country.region).toBe('Africa');
    }
  });

  it('R3-M4-4: Simultaneous filtering combines text query and region dropdown without state collision', () => {
    env.simulator.setSearchQuery('ia');
    env.simulator.setSelectedRegion('Europe');

    const filtered = env.simulator.getFilteredCountries();
    expect(filtered.length).toBeGreaterThan(0);

    for (const country of filtered) {
      expect(country.name.common.toLowerCase()).toContain('ia');
      expect(country.region).toBe('Europe');
    }

    // Nigeria (Africa) matches "ia" but not Europe -> must not be included
    expect(filtered.some(c => c.name.common === 'Nigeria')).toBe(false);
    // France (Europe) is in Europe but doesn't match "ia" -> must not be included
    expect(filtered.some(c => c.name.common === 'France')).toBe(false);
  });

  it('R3-M4-5: Clearing search query while region filter is active restores region-only filtering', () => {
    env.simulator.setSearchQuery('ia');
    env.simulator.setSelectedRegion('Asia');
    expect(env.simulator.getFilteredCountries().length).toBeGreaterThan(0);

    env.simulator.setSearchQuery('');
    const filtered = env.simulator.getFilteredCountries();
    for (const country of filtered) {
      expect(country.region).toBe('Asia');
    }
    expect(filtered.some(c => c.name.common === 'China')).toBe(true);
  });

  it('R3-M4-6: CountryCard renders formatted population, region, capital, and flag alt text', () => {
    const sampleFormatted = formatPopulation(81770900);
    expect(sampleFormatted).toBe('81,770,900');

    env.simulator.setSearchQuery('Germany');
    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(1);

    const card = cards[0];
    expect(card.innerText).toContain('Germany');
    expect(card.innerText).toContain('Population: 83,240,525');
    expect(card.innerText).toContain('Region: Europe');
    expect(card.innerText).toContain('Capital: Berlin');

    const flagImg = card.querySelector('img');
    expect(flagImg).not.toBeNull();
    expect(flagImg.getAttribute('alt')).toContain('Germany flag');
  });

  it('R6-M4-7: Skeleton loading state renders shimmer cards during initial data fetch', () => {
    env.simulator.state.loading = true;
    env.simulator.renderDOM();

    const skeletons = env.browser.document.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBe(8);

    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(0);
  });

  it('R6-M4-8: Empty state renders clear "No results found" message when filters return 0 countries', () => {
    env.simulator.setSearchQuery('NonExistentCountryXYZ123');
    const emptyState = env.browser.document.querySelector('.empty-state');

    expect(emptyState).not.toBeNull();
    expect(emptyState.innerText).toContain('No results found');

    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(0);
  });
});
