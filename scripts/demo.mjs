#!/usr/bin/env node
/**
 * Run the gameplay recorder.
 *
 * Exists mainly to pin PLAYWRIGHT_BROWSERS_PATH to D: before Playwright starts —
 * C: has very little free space, and npm scripts cannot set env vars portably on
 * Windows without an extra dependency.
 *
 * Extra args are forwarded, e.g. `npm run demo:record -- --headed`.
 */

import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? 'D:\\pw-browsers',
};

const args = ['playwright', 'test', '--config', 'e2e/playwright.config.ts', ...process.argv.slice(2)];

const res = spawnSync('npx', args, {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(res.status ?? 1);
