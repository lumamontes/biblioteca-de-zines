import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './production',
  reporter: 'line',
  forbidOnly: true,
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'https://www.biblioteca-de-zines.com.br',
    userAgent: devices['Desktop Chrome'].userAgent + ' BibliotecaSyntheticReader/1.0',
  },
});
