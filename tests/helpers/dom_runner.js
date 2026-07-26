/**
 * DOM Runner & Synthetic Browser Environment for E2E Testing Suite (ESM)
 * Provides DOM emulation, mock fetch interceptor, localStorage persistence, and event triggers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '../../');
export const DATA_JSON_PATH = path.join(ROOT_DIR, 'public', 'data.json');

// Mock localStorage store
export class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

// Lightweight Element model for DOM simulation
export class DOMNode {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toLowerCase();
    this.attributes = {};
    this.children = [];
    this.listeners = new Map();
    this.classList = {
      _classes: new Set(),
      add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
      contains: (c) => this.classList._classes.has(c),
      get value() { return Array.from(this.classList._classes).join(' '); }
    };
    this.style = {};
    this.textContent = '';
    this.value = '';
    this.parentElement = null;

    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'class') {
      this.classList._classes = new Set(String(val).split(/\s+/).filter(Boolean));
    }
  }

  getAttribute(name) {
    if (name === 'class') return this.classList.value;
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'class') this.classList._classes.clear();
  }

  appendChild(child) {
    if (child instanceof DOMNode) {
      child.parentElement = this;
      this.children.push(child);
    }
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  dispatchEvent(event) {
    const eventName = typeof event === 'string' ? event : event.type;
    const callbacks = this.listeners.get(eventName) || [];
    for (const cb of callbacks) {
      cb({ target: this, type: eventName, preventDefault: () => {} });
    }
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (nodeMatchesSelector(node, selector)) {
        matches.push(node);
      }
      for (const child of node.children) {
        walk(child);
      }
    };
    for (const child of this.children) {
      walk(child);
    }
    return matches;
  }

  get innerText() {
    let text = this.textContent;
    for (const child of this.children) {
      text += ' ' + child.innerText;
    }
    return text.trim().replace(/\s+/g, ' ');
  }
}

function nodeMatchesSelector(node, selector) {
  if (!selector) return false;
  selector = selector.trim();

  const parts = selector.match(/(\.[^.#\[]+|#[^.#\[]+|\[[^\]]+\]|^[a-zA-Z0-9_-]+)/g);
  if (!parts || parts.length === 0) return false;

  for (const part of parts) {
    if (part.startsWith('.')) {
      if (!node.classList.contains(part.slice(1))) return false;
    } else if (part.startsWith('#')) {
      if (node.getAttribute('id') !== part.slice(1)) return false;
    } else if (part.startsWith('[') && part.endsWith(']')) {
      const attrContent = part.slice(1, -1);
      if (attrContent.includes('=')) {
        const [attrName, attrVal] = attrContent.split('=').map(s => s.replace(/["']/g, '').trim());
        if (node.getAttribute(attrName) !== attrVal) return false;
      } else {
        if (node.getAttribute(attrContent) === null) return false;
      }
    } else {
      if (node.tagName !== part.toLowerCase()) return false;
    }
  }
  return true;
}

// Global Browser Mock
export class MockBrowser {
  constructor() {
    this.localStorage = new LocalStorageMock();
    const docHtml = new DOMNode('html');
    const docBody = new DOMNode('body');
    docHtml.appendChild(docBody);

    this.document = {
      documentElement: docHtml,
      body: docBody,
      querySelector: (s) => {
        const matches = this.document.querySelectorAll(s);
        return matches.length > 0 ? matches[0] : null;
      },
      querySelectorAll: (s) => {
        const matches = [];
        const walk = (node) => {
          if (nodeMatchesSelector(node, s)) {
            matches.push(node);
          }
          for (const child of node.children) {
            walk(child);
          }
        };
        walk(this.document.documentElement);
        return matches;
      },
      getElementById: (id) => this.document.querySelector(`#${id}`),
      createElement: (tagName) => new DOMNode(tagName)
    };

    this.apiNetworkShouldFail = false;
    this.fallbackNetworkShouldFail = false;

    // Load local dataset
    this.localDataset = [];
    if (fs.existsSync(DATA_JSON_PATH)) {
      try {
        this.localDataset = JSON.parse(fs.readFileSync(DATA_JSON_PATH, 'utf8'));
      } catch (e) {
        console.error('Error reading data.json:', e);
      }
    }
  }

  // Mock Fetch Interceptor
  async fetch(url, options = {}) {
    url = String(url);

    // Primary API
    if (url.includes('restcountries.com')) {
      if (this.apiNetworkShouldFail) {
        throw new Error('NetworkError: Failed to fetch REST Countries API');
      }
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(JSON.stringify(this.localDataset))
      };
    }

    // Local Safeguard Fallback
    if (url.includes('data.json') || url === '/data.json' || url.endsWith('/public/data.json')) {
      if (this.fallbackNetworkShouldFail) {
        throw new Error('NetworkError: Failed to load local data.json safeguard');
      }
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(JSON.stringify(this.localDataset))
      };
    }

    throw new Error(`Unhandled fetch request to: ${url}`);
  }
}

// App Simulation Context (Simulates App State & DOM rendering for test evaluation)
export class AppSimulator {
  constructor(browser) {
    this.browser = browser;
    this.state = {
      countries: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedRegion: '',
      theme: this.browser.localStorage.getItem('theme') || 'light',
      selectedCountryCca3: null, // null = Grid View, string = Detail View
      historyStack: []
    };

    // Synchronize initial theme to DOM
    this.updateThemeDOM(this.state.theme);
    this.renderDOM();
  }

  updateThemeDOM(theme) {
    this.browser.document.documentElement.setAttribute('data-theme', theme);
    this.browser.document.documentElement.setAttribute('class', theme);
    this.browser.localStorage.setItem('theme', theme);
  }

  async loadData() {
    this.state.loading = true;
    this.renderDOM();

    try {
      const res = await this.browser.fetch('https://restcountries.com/v3.1/all');
      const data = await res.json();
      this.state.countries = data;
      this.state.loading = false;
    } catch (apiErr) {
      // Fallback mechanism to data.json
      try {
        const fallbackRes = await this.browser.fetch('/data.json');
        const fallbackData = await fallbackRes.json();
        this.state.countries = fallbackData;
        this.state.loading = false;
      } catch (fallbackErr) {
        this.state.loading = false;
        this.state.error = 'Failed to load countries data.';
      }
    }

    this.renderDOM();
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.state.theme = nextTheme;
    this.updateThemeDOM(nextTheme);
    this.renderDOM();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.renderDOM();
  }

  setSelectedRegion(region) {
    this.state.selectedRegion = region;
    this.renderDOM();
  }

  selectCountry(cca3) {
    this.state.historyStack.push({
      cca3: this.state.selectedCountryCca3,
      searchQuery: this.state.searchQuery,
      selectedRegion: this.state.selectedRegion
    });
    this.state.selectedCountryCca3 = cca3;
    this.renderDOM();
  }

  goBack() {
    if (this.state.historyStack.length > 0) {
      const prev = this.state.historyStack.pop();
      this.state.selectedCountryCca3 = prev.cca3;
      this.state.searchQuery = prev.searchQuery;
      this.state.selectedRegion = prev.selectedRegion;
    } else {
      this.state.selectedCountryCca3 = null;
    }
    this.renderDOM();
  }

  getFilteredCountries() {
    return this.state.countries.filter(c => {
      const nameMatch = !this.state.searchQuery || 
        c.name.common.toLowerCase().includes(this.state.searchQuery.toLowerCase().trim());
      const regionMatch = !this.state.selectedRegion || 
        c.region.toLowerCase() === this.state.selectedRegion.toLowerCase().trim();
      return nameMatch && regionMatch;
    });
  }

  renderDOM() {
    const body = this.browser.document.body;
    body.children = []; // Clear existing DOM

    // Header Element
    const header = new DOMNode('header', { class: 'header' });
    const headerTitle = new DOMNode('h1', { class: 'title' });
    headerTitle.textContent = 'Where in the world?';
    header.appendChild(headerTitle);

    const themeBtn = new DOMNode('button', { 
      'aria-label': 'Toggle theme', 
      class: 'theme-toggle-btn' 
    });
    themeBtn.textContent = this.state.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeBtn.addEventListener('click', () => this.toggleTheme());
    header.appendChild(themeBtn);

    body.appendChild(header);

    const main = new DOMNode('main', { class: 'container' });

    // R6. Loading Skeleton State
    if (this.state.loading) {
      const skeletonContainer = new DOMNode('div', { class: 'skeleton-grid' });
      for (let i = 0; i < 8; i++) {
        const skeletonCard = new DOMNode('div', { class: 'skeleton-card' });
        skeletonContainer.appendChild(skeletonCard);
      }
      main.appendChild(skeletonContainer);
      body.appendChild(main);
      return;
    }

    // Error State
    if (this.state.error) {
      const errorDiv = new DOMNode('div', { class: 'error-state' });
      errorDiv.textContent = this.state.error;
      main.appendChild(errorDiv);
      body.appendChild(main);
      return;
    }

    // R4. Detail View Mode
    if (this.state.selectedCountryCca3) {
      const country = this.state.countries.find(c => c.cca3 === this.state.selectedCountryCca3);
      if (country) {
        const detailContainer = new DOMNode('div', { class: 'country-detail' });
        
        const backBtn = new DOMNode('button', { class: 'back-button' });
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', () => this.goBack());
        detailContainer.appendChild(backBtn);

        const detailContent = new DOMNode('div', { class: 'detail-content' });
        
        const nameEl = new DOMNode('h2', { class: 'country-name' });
        nameEl.textContent = country.name.common;
        detailContent.appendChild(nameEl);

        const nativeNameVal = country.name.nativeName ? 
          Object.values(country.name.nativeName)[0]?.common || country.name.common : country.name.common;
        const nativeNameEl = new DOMNode('p', { class: 'native-name' });
        nativeNameEl.textContent = `Native Name: ${nativeNameVal}`;
        detailContent.appendChild(nativeNameEl);

        const popEl = new DOMNode('p', { class: 'population' });
        popEl.textContent = `Population: ${country.population ? country.population.toLocaleString() : 0}`;
        detailContent.appendChild(popEl);

        const regionEl = new DOMNode('p', { class: 'region' });
        regionEl.textContent = `Region: ${country.region}`;
        detailContent.appendChild(regionEl);

        const subregionEl = new DOMNode('p', { class: 'subregion' });
        subregionEl.textContent = `Sub Region: ${country.subregion || 'N/A'}`;
        detailContent.appendChild(subregionEl);

        const capitalEl = new DOMNode('p', { class: 'capital' });
        capitalEl.textContent = `Capital: ${country.capital ? country.capital.join(', ') : 'N/A'}`;
        detailContent.appendChild(capitalEl);

        const tldEl = new DOMNode('p', { class: 'tld' });
        tldEl.textContent = `Top Level Domain: ${country.tld ? country.tld.join(', ') : 'N/A'}`;
        detailContent.appendChild(tldEl);

        const currenciesVal = country.currencies ? 
          Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A';
        const currEl = new DOMNode('p', { class: 'currencies' });
        currEl.textContent = `Currencies: ${currenciesVal}`;
        detailContent.appendChild(currEl);

        const languagesVal = country.languages ? 
          Object.values(country.languages).join(', ') : 'N/A';
        const langEl = new DOMNode('p', { class: 'languages' });
        langEl.textContent = `Languages: ${languagesVal}`;
        detailContent.appendChild(langEl);

        // Borders Navigation Badges
        const borderSection = new DOMNode('div', { class: 'border-countries' });
        const borderTitle = new DOMNode('span', { class: 'border-title' });
        borderTitle.textContent = 'Border Countries:';
        borderSection.appendChild(borderTitle);

        if (country.borders && country.borders.length > 0) {
          const badgeContainer = new DOMNode('div', { class: 'border-badges' });
          for (const borderCca3 of country.borders) {
            const borderCountry = this.state.countries.find(c => c.cca3 === borderCca3);
            const borderName = borderCountry ? borderCountry.name.common : borderCca3;
            const badge = new DOMNode('button', { 
              class: 'border-badge', 
              'data-cca3': borderCca3 
            });
            badge.textContent = borderName;
            badge.addEventListener('click', () => this.selectCountry(borderCca3));
            badgeContainer.appendChild(badge);
          }
          borderSection.appendChild(badgeContainer);
        } else {
          const noBorders = new DOMNode('span', { class: 'no-borders' });
          noBorders.textContent = ' None';
          borderSection.appendChild(noBorders);
        }

        detailContent.appendChild(borderSection);
        detailContainer.appendChild(detailContent);
        main.appendChild(detailContainer);
        body.appendChild(main);
        return;
      }
    }

    // R3. Homepage Grid Mode (Filter Controls + Cards)
    const filterSection = new DOMNode('div', { class: 'filter-section' });

    const searchInput = new DOMNode('input', {
      type: 'text',
      id: 'search-input',
      placeholder: 'Search for a country...',
      value: this.state.searchQuery
    });
    searchInput.value = this.state.searchQuery;
    searchInput.addEventListener('input', (e) => this.setSearchQuery(e.target.value));
    filterSection.appendChild(searchInput);

    const regionSelect = new DOMNode('select', {
      id: 'region-filter',
      value: this.state.selectedRegion
    });
    regionSelect.value = this.state.selectedRegion;
    const regions = ['', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
    for (const r of regions) {
      const opt = new DOMNode('option', { value: r });
      opt.textContent = r || 'Filter by Region';
      regionSelect.appendChild(opt);
    }
    regionSelect.addEventListener('change', (e) => this.setSelectedRegion(e.target.value));
    filterSection.appendChild(regionSelect);

    main.appendChild(filterSection);

    // Filtered Country Cards
    const filtered = this.getFilteredCountries();

    if (filtered.length === 0) {
      // R6. Empty State Feedback
      const emptyState = new DOMNode('div', { class: 'empty-state' });
      emptyState.textContent = 'No results found';
      main.appendChild(emptyState);
    } else {
      const grid = new DOMNode('div', { class: 'countries-grid' });
      for (const country of filtered) {
        const card = new DOMNode('div', { 
          class: 'country-card',
          'data-cca3': country.cca3
        });
        
        const flag = new DOMNode('img', { 
          src: country.flags?.svg || country.flags?.png, 
          alt: `${country.name.common} flag` 
        });
        card.appendChild(flag);

        const cardName = new DOMNode('h3', { class: 'card-title' });
        cardName.textContent = country.name.common;
        card.appendChild(cardName);

        const cardPop = new DOMNode('p', { class: 'card-pop' });
        cardPop.textContent = `Population: ${country.population ? country.population.toLocaleString() : 0}`;
        card.appendChild(cardPop);

        const cardRegion = new DOMNode('p', { class: 'card-region' });
        cardRegion.textContent = `Region: ${country.region}`;
        card.appendChild(cardRegion);

        const cardCap = new DOMNode('p', { class: 'card-capital' });
        cardCap.textContent = `Capital: ${country.capital ? country.capital.join(', ') : 'N/A'}`;
        card.appendChild(cardCap);

        card.addEventListener('click', () => this.selectCountry(country.cca3));
        grid.appendChild(card);
      }
      main.appendChild(grid);
    }

    body.appendChild(main);
  }
}

export function createTestEnvironment() {
  const browser = new MockBrowser();
  const simulator = new AppSimulator(browser);
  return { browser, simulator };
}
