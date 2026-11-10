import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: false
  },
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'on',
    trace: 'retain-on-failure'
  }
});
