import { defineConfig, devices } from '@playwright/test';

// Keep browser binaries off C: — it has ~7 GB free vs ~130 GB on D:.
// Also set by scripts/demo.mjs so the setting survives a bare `npx playwright test`.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= 'D:\\pw-browsers';

export const MEDIA_ROOT = 'D:\\tinyformers-media';

export default defineConfig({
  testDir: './demo',
  // A full game is ~3-6 min of scripted delays plus minimax compute per AI turn.
  timeout: 25 * 60 * 1000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: `${MEDIA_ROOT}\\_pw`,

  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1600, height: 900 },
    actionTimeout: 20_000,
    trace: 'off',
  },

  projects: [
    {
      name: 'demo',
      use: { ...devices['Desktop Chrome'], channel: undefined },
    },
  ],

  // Record against a production build: `next dev --turbopack` paints a dev-tools
  // badge in the corner and double-renders under Strict Mode, both of which
  // would end up in the video.
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 10 * 60 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
