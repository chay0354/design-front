import { defineConfig, devices } from '@playwright/test'

/**
 * Add-on flows (coupons, gift vouchers, archive, admin) against a mocked
 * backend and Supabase — runs without real credentials or payments.
 * PW_CHROMIUM_PATH lets it use a preinstalled Chromium.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /addons\.spec\.ts/,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:5174',
    locale: 'he-IL',
    trace: 'off',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'mock-anon-key',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
