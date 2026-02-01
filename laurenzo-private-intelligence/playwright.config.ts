import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  // Snapshot settings for visual regression
  snapshotDir: './e2e/visual/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // Threshold for pixel-by-pixel comparison
      maxDiffPixelRatio: 0.01,
      // Animation timeout
      animations: 'disabled',
      // Caret hiding
      caret: 'hide',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Viewport for consistent screenshots
    viewport: { width: 1280, height: 720 },
  },
  projects: [
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Visual regression tests run only on chromium for consistency
    {
      name: 'visual',
      testMatch: /visual.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Disable animations for consistent snapshots
        launchOptions: {
          args: ['--disable-animations'],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
