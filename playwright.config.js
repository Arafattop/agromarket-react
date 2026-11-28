import { defineConfig, devices } from '@playwright/test';

// Адрес можно задать через E2E_BASE_URL или BASE_URL
const remote = process.env.E2E_BASE_URL || process.env.BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,                    // Render Free может «просыпаться» до минуты
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: remote || 'http://localhost:5173',
    trace: 'retain-on-failure',       // запись шагов при падении
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Локально сайт поднимается сам; на продакшен не поднимаем
  webServer: remote ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
