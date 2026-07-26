import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 1: Live Text Search (R3)', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R3-T1-1: Live search filters cards by exact country name', () => {
    env.simulator.setSearchQuery('Germany');
    const filtered = env.simulator.getFilteredCountries();
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name.common).toBe('Germany');

    const domCards = env.browser.document.querySelectorAll('.country-card');
    expect(domCards.length).toBe(1);
    expect(domCards[0].innerText).toContain('Germany');
  });

  it('R3-T1-2: Search performs case-insensitive matching', () => {
    env.simulator.setSearchQuery('gErMaNy');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBe(1);
    expect(filtered[0].name.common).toBe('Germany');
  });

  it('R3-T1-3: Partial substring query matches all relevant countries', () => {
    env.simulator.setSearchQuery('unit');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(1);
    expect(filtered.some(c => c.name.common === 'United States')).toBe(true);
    expect(filtered.some(c => c.name.common === 'United Kingdom')).toBe(true);
  });

  it('R3-T1-4: Clearing search restores full country grid', () => {
    env.simulator.setSearchQuery('Japan');
    expect(env.simulator.getFilteredCountries().length).toBe(1);

    env.simulator.setSearchQuery('');
    expect(env.simulator.getFilteredCountries().length).toBeGreaterThanOrEqual(250);
  });

  it('R3-T1-5: Input element dispatches live update into DOM tree', () => {
    const input = env.browser.document.querySelector('#search-input');
    expect(input).not.toBeNull();

    input.value = 'Brazil';
    input.dispatchEvent({ type: 'input', target: { value: 'Brazil' } });

    const domCards = env.browser.document.querySelectorAll('.country-card');
    expect(domCards.length).toBe(1);
    expect(domCards[0].innerText).toContain('Brazil');
  });
});
