# Original User Request

## 2026-07-26T17:06:34Z

<USER_REQUEST>
Build a complete, responsive, production-ready "Where in the World?" Countries Web Application featuring dynamic DOM rendering, asynchronous data fetching with fallback, client-side live search and region filtering, detailed views with border navigation, and persistent light/dark theme switching.

Working directory: `/Users/gerrell/Documents/antigravity/agitated-babbage`
Integrity mode: `development`

## Requirements

### R1. Scaffolding & Core Architecture
Scaffold a complete single-page web application structure in the working directory using modern web standards (vanilla HTML/CSS/JS or Vite/React). Include clean project configuration, assets, and modular components.

### R2. Data Acquisition & Resilient Fallback
Implement asynchronous fetching (`async/await`) to query the REST Countries API (`https://restcountries.com/v3.1/all`). Provide a local `data.json` safeguard fallback to ensure complete offline/network resilience.

### R3. Dynamic Homepage Grid & Simultaneous Filtering
- Render country cards displaying flag, country name, population (formatted), region, and capital.
- Implement live text search by country name and dropdown filtering by region (Africa, Americas, Asia, Europe, Oceania).
- Combine text search and region dropdown filtering seamlessly without state collisions.

### R4. Detailed Country Page & Border Navigation
- Provide a detailed country view displaying extended metadata (Native Name, Population, Region, Sub Region, Capital, Top Level Domain, Currencies, Languages, Border Countries).
- Render clickable border country badges resolving 3-letter CCA3 codes to full country names, navigating directly to the selected border country's detail view.
- Include a clean 'Back' button returning to the main grid view while preserving previous search and filter states.

### R5. Theme Engine & LocalStorage Persistence
Implement a light/dark mode theme engine toggled via header action button. Persist theme choice in `localStorage` across page reloads.

### R6. UX Polish & Error States
Render shimmer skeleton loading states during data fetching and present clear 'No results found' feedback for empty search queries.

### R7. Multi-Agent Teamwork Documentation in README
Create a comprehensive `README.md` file including:
- Overview of the application features, tech stack, and setup instructions.
- Dedicated section detailing how a multi-agent AI team (architect, developer, QA verifier) collaborated to design, scaffold, implement, verify, and test the project.

### R8. Git Commit & GitHub Repository Push
Initialize git (if needed), stage all project files, create a clear initial commit, and push the codebase to the target GitHub repository: `https://github.com/gslikum/countries.git`.

## Acceptance Criteria

### Functionality & Routing
- [ ] Application loads all countries from REST Countries API or local `data.json` fallback gracefully.
- [ ] Live text search filters cards in real time as user types.
- [ ] Region dropdown filters cards by selected continent.
- [ ] Combining search text and region filter correctly returns only countries matching both criteria simultaneously.
- [ ] Clicking a card transitions smoothly to the detail view with full country metadata.
- [ ] Clicking a border country badge updates detail view to that border country.
- [ ] Clicking 'Back' returns to grid view with previous search query and region filter intact.

### Theme & Design
- [ ] Toggling theme switches color scheme between Light Mode and Dark Mode instantly.
- [ ] Refreshing the page preserves the selected theme from `localStorage`.
- [ ] Responsive UI handles mobile viewport (375px), tablet, and desktop layouts elegantly.
- [ ] Skeleton loaders display during initial data load.

### Documentation & Repository
- [ ] `README.md` details project features, setup, and multi-agent AI teamwork verification process.
- [ ] All code is committed and pushed to `https://github.com/gslikum/countries.git`.

### Verification & Quality
- [ ] Production build script (`npm run build` or equivalent) runs without type or syntax errors.
- [ ] Zero broken links or unhandled JS errors in console.
</USER_REQUEST>
