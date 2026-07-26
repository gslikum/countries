#!/usr/bin/env node

/**
 * E2E Test Suite Runner for "Where in the World?" Countries Application (ESM)
 * Requirements Coverage: R1 - R6 | Tiers 1-4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAllSuites, clearSuites } from './helpers/test_framework.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color constants for terminal formatting
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

async function main() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  "WHERE IN THE WORLD?" COUNTRIES WEB APP — E2E TEST SUITE RUNNER${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  Requirements Coverage: R1 - R6 | Tiers 1-4${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}\n`);

  clearSuites();

  const testFiles = [
    './fetchCountries.test.js',
    './tier1_features/data_acquisition.test.js',
    './tier1_features/live_search.test.js',
    './tier1_features/region_filter.test.js',
    './tier1_features/detail_view.test.js',
    './tier1_features/theme_toggle.test.js',
    './tier1_features/skeleton_empty.test.js',
    './tier2_boundaries/boundary_cases.test.js',
    './tier3_combinations/cross_feature.test.js',
    './tier4_e2e_scenarios/user_workflow.test.js',
    './tier5_adversarial/adversarial_stress.test.jsx',
    './HomepageGrid.test.jsx',
    './DetailView.test.jsx'
  ];

  for (const file of testFiles) {
    const fullPath = path.resolve(__dirname, file);
    try {
      if (file.endsWith('.jsx')) {
        const tempJsPath = fullPath.replace(/\.jsx$/, '.tmp.js');
        fs.writeFileSync(tempJsPath, fs.readFileSync(fullPath, 'utf8'), 'utf8');
        await import(`file://${tempJsPath}`);
        try { fs.unlinkSync(tempJsPath); } catch (e) {}
      } else {
        await import(`file://${fullPath}`);
      }
    } catch (e) {
      console.error(`${COLORS.red}Error loading test file ${file}:${COLORS.reset}`, e);
    }
  }

  const results = await runAllSuites();

  for (const suite of results.suites) {
    console.log(`${COLORS.bold}${COLORS.yellow}▶ ${suite.title}${COLORS.reset}`);
    for (const test of suite.tests) {
      if (test.status === 'passed') {
        console.log(`  ${COLORS.green}✔ ${test.title}${COLORS.reset} ${COLORS.gray}(${test.durationMs}ms)${COLORS.reset}`);
      } else {
        console.log(`  ${COLORS.red}✖ ${test.title}${COLORS.reset} ${COLORS.gray}(${test.durationMs}ms)${COLORS.reset}`);
        if (test.error) {
          console.log(`    ${COLORS.red}Error: ${test.error.message || test.error}${COLORS.reset}`);
        }
      }
    }
    console.log('');
  }

  console.log(`${COLORS.bold}${COLORS.cyan}------------------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}SUMMARY:${COLORS.reset}`);
  console.log(`  Total Test Cases: ${COLORS.bold}${results.total}${COLORS.reset}`);
  console.log(`  Passed:           ${COLORS.bold}${COLORS.green}${results.passed}${COLORS.reset}`);
  console.log(`  Failed:           ${COLORS.bold}${results.failed > 0 ? COLORS.red : COLORS.gray}${results.failed}${COLORS.reset}`);
  console.log(`  Total Time:       ${COLORS.bold}${results.totalDurationMs}ms${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}\n`);

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
