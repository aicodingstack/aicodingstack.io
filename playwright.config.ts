import { defineConfig, devices } from '@playwright/test'

const port = 3100
const host = 'localhost'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://${host}:${port}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev:e2e',
    // Locale negotiation redirects anonymous page requests once to set a cookie.
    // Use the locale-independent health endpoint so readiness checks cannot enter that redirect flow.
    url: `http://${host}:${port}/api/revalidate`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
