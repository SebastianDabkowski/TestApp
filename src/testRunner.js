const { chromium } = require('playwright');

/**
 * Runs Playwright tests based on generated test scenarios.
 *
 * @param {string} baseUrl - Base URL of the application to test
 * @param {Array<{ name: string, description: string, steps: Array<{ action: string, selector: string|null, value: string|null, expected: string|null }> }>} scenarios
 * @param {{ headed: boolean, timeout: number }} options
 * @returns {Promise<Array<{ name: string, description: string, status: string, duration: number, error: string|null, screenshots: string[] }>>}
 */
async function runTests(baseUrl, scenarios, options = {}) {
  const { headed = false, timeout = 30000 } = options;
  const results = [];

  const browser = await chromium.launch({ headless: !headed });

  try {
    for (const scenario of scenarios) {
      const result = await runSingleTest(browser, baseUrl, scenario, timeout);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Runs a single test scenario.
 *
 * @param {import('playwright').Browser} browser
 * @param {string} baseUrl
 * @param {{ name: string, description: string, steps: Array<{ action: string, selector: string|null, value: string|null, expected: string|null }> }} scenario
 * @param {number} timeout
 * @returns {Promise<{ name: string, description: string, status: string, duration: number, error: string|null, screenshots: string[] }>}
 */
async function runSingleTest(browser, baseUrl, scenario, timeout) {
  const startTime = Date.now();
  const screenshots = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(timeout);

  try {
    for (const step of scenario.steps) {
      await executeStep(page, baseUrl, step, screenshots);
    }

    return {
      name: scenario.name,
      description: scenario.description || '',
      status: 'passed',
      duration: Date.now() - startTime,
      error: null,
      screenshots,
    };
  } catch (error) {
    return {
      name: scenario.name,
      description: scenario.description || '',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      screenshots,
    };
  } finally {
    await context.close();
  }
}

/**
 * Executes a single test step.
 *
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {{ action: string, selector: string|null, value: string|null, expected: string|null }} step
 * @param {string[]} screenshots
 */
async function executeStep(page, baseUrl, step, screenshots) {
  switch (step.action) {
    case 'navigate': {
      const url = step.value.startsWith('http') ? step.value : new URL(step.value, baseUrl).href;
      await page.goto(url, { waitUntil: 'networkidle' });
      break;
    }

    case 'click':
      await page.click(step.selector);
      break;

    case 'type':
      await page.fill(step.selector, step.value || '');
      break;

    case 'select':
      await page.selectOption(step.selector, step.value || '');
      break;

    case 'wait':
      await page.waitForTimeout(parseInt(step.value, 10) || 1000);
      break;

    case 'assert_visible':
      await page.waitForSelector(step.selector, { state: 'visible' });
      break;

    case 'assert_text': {
      const element = await page.waitForSelector(step.selector);
      const text = await element.textContent();
      if (!text.includes(step.value)) {
        throw new Error(`Expected text "${step.value}" not found in "${text}"`);
      }
      break;
    }

    case 'assert_url': {
      const currentUrl = page.url();
      if (!currentUrl.includes(step.value)) {
        throw new Error(`Expected URL to contain "${step.value}", got "${currentUrl}"`);
      }
      break;
    }

    case 'screenshot': {
      const screenshotPath = `screenshot-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push(screenshotPath);
      break;
    }

    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

module.exports = { runTests, runSingleTest, executeStep };
