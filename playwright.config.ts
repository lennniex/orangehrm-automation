import { defineConfig, devices } from '@playwright/test';

// BrowserStack credentials (set as environment variables)
const BS_USERNAME = process.env.BROWSERSTACK_USERNAME || '';
const BS_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || '';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  timeout: 60000,
  
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Local browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // BrowserStack - Chrome
    {
      name: 'browserstack-chrome',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'name': 'OrangeHRM E2E Test',
            'build': 'Playwright Build',
            'browserstack.username': BS_USERNAME,
            'browserstack.accessKey': BS_ACCESS_KEY,
          }))}`,
        },
      },
    },
    
    // BrowserStack - Firefox
    {
      name: 'browserstack-firefox',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-firefox',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'name': 'OrangeHRM E2E Test Firefox',
            'build': 'Playwright Build',
            'browserstack.username': BS_USERNAME,
            'browserstack.accessKey': BS_ACCESS_KEY,
          }))}`,
        },
      },
    },
  ],

  outputDir: 'test-results/',
});