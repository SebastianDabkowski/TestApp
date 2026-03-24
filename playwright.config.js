/** @type {import('playwright').LaunchOptions} */
const config = {
  headless: true,
  timeout: 30000,
  screenshot: 'on',
  video: 'retain-on-failure',
};

module.exports = config;
