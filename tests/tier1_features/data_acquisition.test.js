import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 1: Data Acquisition & Resilient Fallback (R2)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment();
  });

  it('R2-T1-1: Successful API fetch populates country dataset (250 countries)', async () => {
    await env.simulator.loadData();
    expect(env.simulator.state.loading).toBe(false);
    expect(env.simulator.state.error).toBeNull();
    expect(env.simulator.state.countries.length).toBeGreaterThanOrEqual(250);
  });

  it('R2-T1-2: Primary API failure triggers fallback to local data.json safeguard', async () => {
    env.browser.apiNetworkShouldFail = true; // Simulate REST Countries API failure
    await env.simulator.loadData();
    
    expect(env.simulator.state.loading).toBe(false);
    expect(env.simulator.state.error).toBeNull();
    expect(env.simulator.state.countries.length).toBeGreaterThan(0);
    expect(env.simulator.state.countries.some(c => c.name.common === 'Germany')).toBe(true);
  });

  it('R2-T1-3: Fallback dataset validates standard country schema', async () => {
    await env.simulator.loadData();
    const sampleCountry = env.simulator.state.countries[0];
    
    expect(sampleCountry).toBeDefined();
    expect(sampleCountry.name).toBeDefined();
    expect(typeof sampleCountry.name.common).toBe('string');
    expect(typeof sampleCountry.cca3).toBe('string');
    expect(typeof sampleCountry.region).toBe('string');
    expect(typeof sampleCountry.population).toBe('number');
    expect(sampleCountry.flags).toBeDefined();
  });

  it('R2-T1-4: Asynchronous loading state manages pending transitions', async () => {
    expect(env.simulator.state.loading).toBe(true);
    const skeletonDivs = env.browser.document.querySelectorAll('.skeleton-card');
    expect(skeletonDivs.length).toBeGreaterThan(0);

    await env.simulator.loadData();
    expect(env.simulator.state.loading).toBe(false);
    const cardsAfterLoad = env.browser.document.querySelectorAll('.country-card');
    expect(cardsAfterLoad.length).toBeGreaterThan(0);
  });

  it('R2-T1-5: Dual network error presents user-friendly error state', async () => {
    env.browser.apiNetworkShouldFail = true;
    env.browser.fallbackNetworkShouldFail = true;

    await env.simulator.loadData();
    expect(env.simulator.state.loading).toBe(false);
    expect(env.simulator.state.error).not.toBeNull();
    const errorEl = env.browser.document.querySelector('.error-state');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('Failed to load');
  });
});
