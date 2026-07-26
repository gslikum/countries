/**
 * Authentic Test Framework & Assertion Library for E2E Test Suite (ESM)
 */

const suites = [];
let currentSuite = null;

export function describe(title, fn) {
  const suite = {
    title,
    tests: [],
    beforeEachFns: [],
    afterEachFns: []
  };
  suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = null;
}

export function it(title, fn) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      it(title, fn);
    });
    return;
  }
  currentSuite.tests.push({ title, fn });
}

export const test = it;

export function beforeEach(fn) {
  if (currentSuite) {
    currentSuite.beforeEachFns.push(fn);
  }
}

export function afterEach(fn) {
  if (currentSuite) {
    currentSuite.afterEachFns.push(fn);
  }
}

export class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

export function expect(actual) {
  const createMatcher = (isNot = false) => ({
    toBe(expected) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected) {
      const actualJson = JSON.stringify(actual);
      const expectedJson = JSON.stringify(expected);
      const pass = actualJson === expectedJson;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actualJson} ${isNot ? 'not to equal' : 'to equal'} ${expectedJson}`);
      }
    },
    toContain(expectedSub) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(expectedSub);
      } else if (Array.isArray(actual)) {
        pass = actual.includes(expectedSub);
      }
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to contain' : 'to contain'} ${JSON.stringify(expectedSub)}`);
      }
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be truthy' : 'to be truthy'}`);
      }
    },
    toBeFalsy() {
      const pass = !Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be falsy' : 'to be falsy'}`);
      }
    },
    toBeGreaterThan(n) {
      const pass = actual > n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be greater than' : 'to be greater than'} ${n}`);
      }
    },
    toBeGreaterThanOrEqual(n) {
      const pass = actual >= n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be >=' : 'to be >= '} ${n}`);
      }
    },
    toBeLessThan(n) {
      const pass = actual < n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be less than' : 'to be less than'} ${n}`);
      }
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be null' : 'to be null'}`);
      }
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be undefined' : 'to be undefined'}`);
      }
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'to be undefined' : 'to be defined'}`);
      }
    },
    toThrow(expectedMsg) {
      let threw = false;
      let thrownError = null;
      if (typeof actual === 'function') {
        try {
          actual();
        } catch (e) {
          threw = true;
          thrownError = e;
        }
      }
      if (isNot ? threw : !threw) {
        throw new AssertionError(`Expected function ${isNot ? 'not to throw' : 'to throw an error'}`);
      }
      if (expectedMsg && thrownError) {
        const msg = thrownError.message || String(thrownError);
        if (typeof expectedMsg === 'string' && !msg.includes(expectedMsg)) {
          throw new AssertionError(`Expected error message "${msg}" to contain "${expectedMsg}"`);
        } else if (expectedMsg instanceof RegExp && !expectedMsg.test(msg)) {
          throw new AssertionError(`Expected error message "${msg}" to match ${expectedMsg}`);
        }
      }
    },
    toMatch(regex) {
      const pass = regex.test(String(actual));
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected "${actual}" ${isNot ? 'not to match' : 'to match'} ${regex}`);
      }
    }
  });

  const matcher = createMatcher(false);
  matcher.not = createMatcher(true);
  return matcher;
}

export async function runAllSuites() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    suites: []
  };

  const startTime = Date.now();

  for (const suite of suites) {
    const suiteResult = {
      title: suite.title,
      tests: [],
      passed: 0,
      failed: 0
    };

    for (const testCase of suite.tests) {
      results.total++;
      const testResult = {
        title: testCase.title,
        status: 'passed',
        error: null,
        durationMs: 0
      };

      const testStart = Date.now();

      try {
        for (const fn of suite.beforeEachFns) {
          await fn();
        }
        await testCase.fn();
        for (const fn of suite.afterEachFns) {
          await fn();
        }
        results.passed++;
        suiteResult.passed++;
      } catch (err) {
        results.failed++;
        suiteResult.failed++;
        testResult.status = 'failed';
        testResult.error = err;
      }

      testResult.durationMs = Date.now() - testStart;
      suiteResult.tests.push(testResult);
    }

    results.suites.push(suiteResult);
  }

  results.totalDurationMs = Date.now() - startTime;
  return results;
}

export function clearSuites() {
  suites.length = 0;
}
