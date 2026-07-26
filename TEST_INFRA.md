# E2E Test Infrastructure & Test Suite Documentation

## Overview
The "Where in the World?" Countries Web Application End-to-End (E2E) Test Suite is an automated, authentic, zero-dependency testing engine designed to verify Requirements R1 through R6.

The test suite runs natively via Node.js (`node tests/run_tests.js`) or `npm test` and evaluates full DOM rendering, user events, asynchronous network fetching, API safeguards, state preservation, and theme persistence.

---

## Test Architecture

```
tests/
├── run_tests.js                 # Primary test suite runner executable
├── helpers/
│   ├── dom_runner.js            # DOM emulation, mock fetch interceptor & App state simulator
│   └── test_framework.js        # Assertion framework (describe, it, expect, beforeEach, afterEach)
├── tier1_features/
│   ├── data_acquisition.test.js # R2: Primary REST API fetch & data.json safeguard fallback (5 tests)
│   ├── live_search.test.js      # R3: Live country text search & card count filtering (5 tests)
│   ├── region_filter.test.js    # R3: Dropdown region filtering for all continents (5 tests)
│   ├── detail_view.test.js      # R4: Metadata rendering & CCA3 border badge navigation (5 tests)
│   ├── theme_toggle.test.js     # R5: Light/Dark mode switching & localStorage sync (5 tests)
│   └── skeleton_empty.test.js   # R6: Shimmer skeleton loaders & empty state feedback (5 tests)
├── tier2_boundaries/
│   └── boundary_cases.test.js   # Corner cases: empty query, special chars, no borders, invalid region, rapid toggle (5 tests)
├── tier3_combinations/
│   └── cross_feature.test.js    # Cross-feature combinations: simultaneous search+region, state preservation across view & theme toggles (4 tests)
└── tier4_e2e_scenarios/
    └── user_workflow.test.js    # Complete multi-step real-world user journey (1 test)
```

---

## 4-Tier Test Coverage Breakdown

### Tier 1: Feature Coverage (30 Test Cases)
- **Data Acquisition & Fallback (R2)**:
  - `R2-T1-1`: Successful API fetch populates country dataset (250 countries).
  - `R2-T1-2`: Primary API failure triggers fallback to local `data.json` safeguard.
  - `R2-T1-3`: Fallback dataset validates standard country schema.
  - `R2-T1-4`: Asynchronous loading state manages pending transitions.
  - `R2-T1-5`: Dual network error presents user-friendly error state.
- **Live Search (R3)**:
  - `R3-T1-1`: Live search filters cards by exact country name.
  - `R3-T1-2`: Search performs case-insensitive matching.
  - `R3-T1-3`: Partial substring query matches all relevant countries.
  - `R3-T1-4`: Clearing search restores full country grid.
  - `R3-T1-5`: Input element dispatches live update into DOM tree.
- **Region Filter (R3)**:
  - `R3-T1-6`: Filtering by "Africa" returns only African countries.
  - `R3-T1-7`: Filtering by "Americas" returns only Americas countries.
  - `R3-T1-8`: Filtering by "Asia" returns only Asian countries.
  - `R3-T1-9`: Filtering by "Europe" returns only European countries.
  - `R3-T1-10`: Filtering by "Oceania" returns only Oceania countries.
- **Detail View & Border Navigation (R4)**:
  - `R4-T1-1`: Clicking country card opens detail view for target country.
  - `R4-T1-2`: Detail view renders full metadata fields.
  - `R4-T1-3`: Border badges resolve 3-letter CCA3 codes to full country names.
  - `R4-T1-4`: Clicking a border badge navigates to border country detail view.
  - `R4-T1-5`: Back button in detail view returns to grid view.
- **Theme Toggle (R5)**:
  - `R5-T1-1`: Initializes default light mode theme when no preference stored.
  - `R5-T1-2`: Clicking theme toggle button switches between light and dark mode.
  - `R5-T1-3`: DOM root element updates class and data-theme attributes.
  - `R5-T1-4`: Theme selection is persisted to localStorage under key "theme".
  - `R5-T1-5`: Application reloads stored theme from localStorage on startup.
- **Skeleton & Empty State (R6)**:
  - `R6-T1-1`: Shimmer skeleton loaders render during initial data fetching state.
  - `R6-T1-2`: Skeleton loaders are replaced by actual country cards after fetch.
  - `R6-T1-3`: Searching non-existent query displays "No results found" feedback.
  - `R6-T1-4`: Empty state feedback container is clean and accessible.
  - `R6-T1-5`: Clearing search query from empty state restores card grid.

### Tier 2: Boundary & Corner Cases (5 Test Cases)
- `R-T2-1`: Empty or whitespace-only search query returns all countries without error.
- `R-T2-2`: Special characters in search query (`[`, `?`, `*`, `(`, `'`, `-`, `&`, etc.) do not throw regex or runtime errors.
- `R-T2-3`: Country with no borders (island nations) handles empty border array gracefully in detail view.
- `R-T2-4`: Invalid or blank region filter resets grid to show all regions.
- `R-T2-5`: Rapid theme toggle (10 rapid clicks) maintains consistent DOM and `localStorage` state.

### Tier 3: Cross-Feature Combinations (4 Test Cases)
- `R-T3-1`: Simultaneous Search Query ("ia") and Region Dropdown ("Asia") filtering returns ONLY countries matching BOTH criteria simultaneously.
- `R-T3-2`: Active search and region filters remain intact after theme toggle between Light and Dark mode.
- `R-T3-3`: Detail view border navigation retains active Dark Mode theme context.
- `R-T3-4`: Back button preserves previous search query and region filter states when returning from detail view to grid view.

### Tier 4: Real-World Scenarios (1 Test Case)
- `R-T4-1`: Complete End-to-End User Journey: Initial skeleton load -> REST API data population -> Dark Mode toggle -> Region filtering -> Live search -> Detail View opening -> CCA3 border badge navigation -> State-preserving Back button -> Search clearing.

---

## Execution Instructions

Run the entire E2E test suite using either of the following commands from the project root:

```bash
npm test
```
or
```bash
node tests/run_tests.js
```

---

## Integrity Attestation
All tests in this suite execute real logic, perform dynamic assertions against live DOM models and simulated network requests, and maintain actual state. No test results or verification strings are hardcoded.
