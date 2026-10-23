import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath =
  process.env.PLAYWRIGHT_CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined);
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5192',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5192 --strictPort',
    url: 'http://127.0.0.1:5192',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'mobile-webkit',
      testMatch: ['**/mobile.spec.ts', '**/invitation.spec.ts', '**/effects.spec.ts'],
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
        viewport: { width: 390, height: 664 },
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        launchOptions: { executablePath },
      },
    },
    {
      name: 'mobile',
      testIgnore: ['**/responsive.spec.ts', '**/agentation.spec.ts', '**/mobile.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        launchOptions: { executablePath },
      },
    },
    {
      name: 'reduced-motion',
      testIgnore: ['**/responsive.spec.ts', '**/agentation.spec.ts', '**/mobile.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        reducedMotion: 'reduce',
        launchOptions: { executablePath },
      },
    },
  ],
});
