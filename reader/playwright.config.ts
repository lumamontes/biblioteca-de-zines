import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './smoke',
  timeout: 120_000,
  use: { baseURL: 'http://127.0.0.1:4174', ...devices['Desktop Chrome'] },
  webServer: { command: 'pnpm dev --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174', reuseExistingServer: true, timeout: 120_000 },
});
