import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 1: Region Dropdown Filtering (R3)', () => {
  let env;

  beforeEach(async () => {
    env = createTestEnvironment();
    await env.simulator.loadData();
  });

  it('R3-T1-6: Filtering by "Africa" returns only African countries', () => {
    env.simulator.setSelectedRegion('Africa');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region === 'Africa')).toBe(true);
  });

  it('R3-T1-7: Filtering by "Americas" returns only Americas countries', () => {
    env.simulator.setSelectedRegion('Americas');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region === 'Americas')).toBe(true);
  });

  it('R3-T1-8: Filtering by "Asia" returns only Asian countries', () => {
    env.simulator.setSelectedRegion('Asia');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region === 'Asia')).toBe(true);
  });

  it('R3-T1-9: Filtering by "Europe" returns only European countries', () => {
    env.simulator.setSelectedRegion('Europe');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region === 'Europe')).toBe(true);
  });

  it('R3-T1-10: Filtering by "Oceania" returns only Oceania countries', () => {
    env.simulator.setSelectedRegion('Oceania');
    const filtered = env.simulator.getFilteredCountries();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.region === 'Oceania')).toBe(true);
  });
});
