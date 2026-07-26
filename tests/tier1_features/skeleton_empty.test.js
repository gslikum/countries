import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment } from '../helpers/dom_runner.js';

describe('Tier 1: UX Polish & Error States (R6)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment();
  });

  it('R6-T1-1: Shimmer skeleton loaders render during initial data fetching state', () => {
    env.simulator.state.loading = true;
    env.simulator.renderDOM();

    const skeletons = env.browser.document.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBeGreaterThan(0);
    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(0);
  });

  it('R6-T1-2: Skeleton loaders are replaced by actual country cards after fetch', async () => {
    await env.simulator.loadData();

    const skeletons = env.browser.document.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBe(0);
    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('R6-T1-3: Searching non-existent query displays "No results found" feedback', async () => {
    await env.simulator.loadData();
    env.simulator.setSearchQuery('xyz999nonexistentquery');

    const emptyState = env.browser.document.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toBe('No results found');

    const cards = env.browser.document.querySelectorAll('.country-card');
    expect(cards.length).toBe(0);
  });

  it('R6-T1-4: Empty state feedback container is clean and accessible', async () => {
    await env.simulator.loadData();
    env.simulator.setSearchQuery('NonExistentCountryName123');

    const emptyState = env.browser.document.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState.innerText.toLowerCase()).toContain('no results');
  });

  it('R6-T1-5: Clearing search query from empty state restores card grid', async () => {
    await env.simulator.loadData();
    env.simulator.setSearchQuery('NonExistentCountryName123');
    expect(env.browser.document.querySelectorAll('.country-card').length).toBe(0);

    env.simulator.setSearchQuery('');
    expect(env.browser.document.querySelectorAll('.country-card').length).toBeGreaterThan(0);
    expect(env.browser.document.querySelector('.empty-state')).toBeNull();
  });
});
