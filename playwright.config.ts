import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry on CI only. A test that passes on retry is reported as "flaky" by the github reporter,
  // so flakiness stays visible instead of being hidden.
  retries: isCI ? 1 : 0,
  // GitHub runners have 2-4 vCPUs. Parallel workers + animations = dropped frames = timing flakes.
  workers: isCI ? 1 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: isCI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isCI ? 'npm run start' : 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
