// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:8082',
    channel: 'chrome',
    viewport: { width: 430, height: 920 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/start-e2e.js --port 8082',
    url: 'http://127.0.0.1:8082',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
