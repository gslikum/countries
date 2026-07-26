# Project: "Where in the World?" Countries Web Application

## Architecture
Single-page React web application built with Vite, React, and CSS/Tailwind CSS.
- **Data Layer**: API fetch client querying `https://restcountries.com/v3.1/all` with dynamic fallback to `/data.json` (or bundled local dataset safeguard).
- **State Management**: React state / context for active search query, selected region filter, current theme (light/dark), and selected country view route/state.
- **Routing/Navigation**: Dynamic client-side routing (hash router or lightweight component view state) supporting main grid view and country detail view with full browser history support and state preservation.
- **Theme Engine**: Light/Dark mode toggling attached to `document.documentElement` class list or CSS data attribute, with state persisted in `localStorage`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite | Requirements R1-R6 test runner & case generator (Tiers 1-4) | None | DONE |
| 1 | Scaffolding & Core Architecture | Vite + React setup, package.json, static data.json asset, layout structure | None | DONE |
| 2 | Data Acquisition & Resilient Fallback | API fetch hook/service querying REST API with local data.json safeguard fallback | M1 | DONE |
| 3 | Theme Engine & LocalStorage Persistence | Theme switcher component, theme state context, localStorage sync | M1 | DONE |
| 4 | Homepage Grid & Simultaneous Filtering | Country cards grid, search input, region dropdown filter, combined search+region logic, skeleton loaders, empty state | M1, M2, M3 | DONE |
| 5 | Country Detail View & Border Navigation | Extended metadata view, 3-letter CCA3 code mapping to full country names, border badges navigation, state-preserving Back button | M2, M4 | DONE |
| 6 | README Documentation | Comprehensive README.md detailing features, tech stack, setup, and multi-agent AI teamwork verification | M1-M5 | DONE |
| 7 | E2E Pass & Hardening | 100% E2E test suite pass (Tiers 1-4) + Tier 5 white-box adversarial coverage hardening | M1-M6, E2E | DONE |
| 8 | Git Commit & GitHub Push | Initialize git, clean commit, push to https://github.com/gslikum/countries.git | M1-M7 | PLANNED |

## Interface Contracts
### Country Data Schema
```typescript
interface Country {
  name: { common: string; official: string; nativeName?: Record<string, { official: string; common: string }> };
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  flags: { png: string; svg: string; alt?: string };
  tld?: string[];
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  borders?: string[];
}
```

### Theme Engine Contract
- Key in `localStorage`: `theme` (values: `'light'` | `'dark'`)
- Class on `<html>` or `<body>`: `light` or `dark`

### Filter Engine Contract
- Active State: `{ searchQuery: string, selectedRegion: string }`
- Combined Filter: `countries.filter(c => matchesSearch(c, query) && matchesRegion(c, region))`

## Code Layout
```
/Users/gerrell/Documents/antigravity/agitated-babbage/
├── public/
│   └── data.json              # Local fallback dataset safeguard
├── src/
│   ├── assets/                # Static icons, styles
│   ├── components/            # UI components (Header, CountryCard, SearchFilter, DetailView, Skeleton)
│   ├── context/               # ThemeContext, CountryDataContext
│   ├── services/              # api.ts / fetchCountries.ts
│   ├── utils/                 # formatters.ts, cca3Resolver.ts
│   ├── App.jsx / App.tsx      # Main layout & routing state
│   ├── index.css              # Styling / theme variables
│   └── main.jsx / main.tsx    # Entry point
├── tests/                     # Playwright / Vitest / E2E test suites
├── index.html
├── package.json
├── vite.config.js / ts
└── README.md
```
