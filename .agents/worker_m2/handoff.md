# Milestone 2 Handoff Report — Data Acquisition & Resilient Fallback

## 1. Observation
- Primary API fetch target: `https://restcountries.com/v3.1/all` with 5-second (5000 ms) timeout.
- Safeguard local dataset: `/data.json`.
- Files created:
  - `src/services/fetchCountries.js`: Service module querying REST API using `async/await` with `AbortController` timeout and automatic fallback to `/data.json`.
  - `src/context/CountryContext.jsx`: React context and `useCountries` hook exposing `{ countries, loading, error, isFallback, refetch }`.
  - `tests/fetchCountries.test.jsx`: Unit and integration tests validating API success, non-200 status, network error, timeout, dual failure, and schema compliance.
  - `tests/fetchCountries.test.js`: ESM test module registered in `tests/run_tests.js`.
- Build & Test execution:
  - Command: `PATH="$(pwd)/node_bin:$PATH" npm run build && PATH="$(pwd)/node_bin:$PATH" npm test`
  - Build Output: `✓ built in 350ms` (vite build success).
  - Test Output: 46 total test cases executed, 46 passed, 0 failed.

## 2. Logic Chain
1. Requirement R2 dictates querying `https://restcountries.com/v3.1/all` via `async/await` and falling back to `/data.json` if network fails, times out (5s), or returns non-200.
2. `src/services/fetchCountries.js` implements this exact logic:
   - Sets up `AbortController` with a 5000 ms timer.
   - Executes `fetch(apiUrl, { signal })`. If response is OK (200), returns `{ data, isFallback: false }`.
   - If `fetch` throws, times out (`AbortError`), or returns non-200, it catches the error and executes `fetch(fallbackUrl)`.
   - If fallback succeeds, returns `{ data: fallbackData, isFallback: true }`. If fallback also fails, throws a descriptive error.
3. `src/context/CountryContext.jsx` manages component state (`countries`, `loading`, `error`, `isFallback`) and provides `refetch` capability via `useCountries()`.
4. `src/App.jsx` was updated to wrap `AppContent` with `<CountryProvider>` to enable application-wide data access.
5. Unit and integration tests in `tests/fetchCountries.test.js` and `tests/fetchCountries.test.jsx` simulate all primary API success/failure modes and verify schema compliance.

## 3. Caveats
- No caveats. The fallback mechanism handles API timeouts, non-200 HTTP responses, and network exceptions seamlessly.

## 4. Conclusion
- Requirement R2 (Milestone 2) is completely satisfied. All data acquisition and fallback mechanisms are built, tested, and verified.

## 5. Verification Method
To independently verify:
1. Run build:
   `PATH="$(pwd)/node_bin:$PATH" npm run build`
2. Run test suite:
   `PATH="$(pwd)/node_bin:$PATH" npm test`
3. Inspect created files:
   - `src/services/fetchCountries.js`
   - `src/context/CountryContext.jsx`
   - `tests/fetchCountries.test.jsx`
