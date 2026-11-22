import { defineConfig, devices } from '@playwright/test';

const viewerOrigin = 'http://127.0.0.1:4100';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'line',
  use: {
    baseURL: viewerOrigin,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm exec next dev --turbopack -H 127.0.0.1 -p 4100',
    url: `${viewerOrigin}/embed/p/zine`,
    env: { NEXT_PUBLIC_READER_API_ORIGIN: viewerOrigin },
    reuseExistingServer: false,
  },
});
