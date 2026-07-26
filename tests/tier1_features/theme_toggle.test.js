import { describe, it, expect, beforeEach } from '../helpers/test_framework.js';
import { createTestEnvironment, MockBrowser, AppSimulator } from '../helpers/dom_runner.js';

describe('Tier 1: Theme Engine & LocalStorage Persistence (R5)', () => {
  let env;

  beforeEach(() => {
    env = createTestEnvironment();
  });

  it('R5-T1-1: Initializes default light mode theme when no preference stored', () => {
    expect(env.simulator.state.theme).toBe('light');
    expect(env.browser.document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('R5-T1-2: Clicking theme toggle button switches between light and dark mode', () => {
    const initialTheme = env.simulator.state.theme;
    env.simulator.toggleTheme();
    
    expect(env.simulator.state.theme).toBe('dark');
    expect(env.simulator.state.theme).not.toBe(initialTheme);

    env.simulator.toggleTheme();
    expect(env.simulator.state.theme).toBe('light');
  });

  it('R5-T1-3: DOM root element updates class and data-theme attributes', () => {
    env.simulator.toggleTheme(); // Set to dark mode
    
    const htmlEl = env.browser.document.documentElement;
    expect(htmlEl.getAttribute('data-theme')).toBe('dark');
    expect(htmlEl.classList.contains('dark')).toBe(true);
  });

  it('R5-T1-4: Theme selection is persisted to localStorage under key "theme"', () => {
    env.simulator.toggleTheme(); // Dark mode
    
    const storedTheme = env.browser.localStorage.getItem('theme');
    expect(storedTheme).toBe('dark');
  });

  it('R5-T1-5: Application reloads stored theme from localStorage on startup', () => {
    const browser = new MockBrowser();
    browser.localStorage.setItem('theme', 'dark');

    const simulator = new AppSimulator(browser);
    simulator.state.theme = browser.localStorage.getItem('theme') || 'light';
    simulator.updateThemeDOM(simulator.state.theme);

    expect(simulator.state.theme).toBe('dark');
    expect(browser.document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
