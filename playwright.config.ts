import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// env.e2eファイルを読み込み（存在する場合）
dotenv.config({ path: path.join(process.cwd(), 'env.e2e') });

// 通常の.envも読み込み
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // 順次実行（API制限対策）
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.FRONTEND_URL || 'https://trade-nearby.pages.dev',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',

    /* Timeout settings */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Service Token認証用のHTTPヘッダーを設定
        extraHTTPHeaders: process.env.CF_ACCESS_CLIENT_ID ? {
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
        } : undefined
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        extraHTTPHeaders: process.env.CF_ACCESS_CLIENT_ID ? {
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
        } : undefined
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        extraHTTPHeaders: process.env.CF_ACCESS_CLIENT_ID ? {
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
        } : undefined
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        extraHTTPHeaders: process.env.CF_ACCESS_CLIENT_ID ? {
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
        } : undefined
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        extraHTTPHeaders: process.env.CF_ACCESS_CLIENT_ID ? {
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
        } : undefined
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  
  /* Test timeout */
  timeout: process.env.CI ? 60000 : 30000,
  
  /* Global timeout for the whole test run */
  globalTimeout: process.env.CI ? 30 * 60 * 1000 : 15 * 60 * 1000,
  
  /* Maximum time to wait for a page to load */
  expect: {
    timeout: 10000
  },
});
