// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://localhost:8082',
    channel: 'chrome',
    viewport: { width: 430, height: 920 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx expo start --web --port 8082',
    url: 'http://localhost:8082',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
