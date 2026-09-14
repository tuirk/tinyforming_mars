import { test, expect, chromium } from '@playwright/test';
import { mkdirSync, renameSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { GameDriver } from './driver';
import { CURSOR_INIT_SCRIPT } from './cursor';
import { MEDIA_ROOT } from '../playwright.config';

const VIEWPORT = { width: 1920, height: 1080 };

// Playwright's screencast is a fairly low-bitrate VP8 stream, so the source
// quality — not the MP4 encode — is the real ceiling. Rendering at 2x and
// letting the screencast downsample supersamples the frame: measured on this
// app's landing page, the same 1600x900 output went from 279 KB to 372 KB of
// retained detail per frame just by raising this.
const DEVICE_SCALE_FACTOR = 2;

test('records a full human-vs-AI game', async () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const runDir = join(MEDIA_ROOT, stamp);
  const rawDir = join(runDir, 'raw');
  mkdirSync(rawDir, { recursive: true });

  // A manually managed context so the video lands in a directory we choose and
  // is finalised deterministically: Playwright only writes the file on close.
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    recordVideo: { dir: rawDir, size: VIEWPORT },
  });

  // Turn on the demo bridge before any app code runs. Not `tutorialCompleted`:
  // we want the first few tips on camera.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('__tfDemo', '1');
      localStorage.setItem('aiMode', 'minimax');
    } catch {
      /* private browsing — the run will fail loudly later */
    }
  });

  // Draw a visible pointer so clicks have a visible cause in the video.
  await context.addInitScript(CURSOR_INIT_SCRIPT);

  const page = await context.newPage();
  page.on('pageerror', (err) => console.error('[page error]', err.message));

  const driver = new GameDriver(page, { runDir });
  let result: Awaited<ReturnType<GameDriver['playToGameOver']>> = null;

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    result = await driver.playToGameOver();
  } finally {
    driver.flushLog();
    const videoPath = await page.video()?.path();
    // Close the context first — this is what flushes the video to disk.
    await context.close();
    await browser.close();

    if (videoPath) {
      try {
        renameSync(videoPath, join(rawDir, 'game.webm'));
      } catch {
        const found = readdirSync(rawDir).find((f) => f.endsWith('.webm'));
        if (found && found !== 'game.webm') renameSync(join(rawDir, found), join(rawDir, 'game.webm'));
      }
    }
    writeFileSync(join(MEDIA_ROOT, 'latest.txt'), runDir, 'utf8');
    console.log(`\nRun directory: ${runDir}`);
  }

  expect(result, 'game should have reached the game-over screen').not.toBeNull();
  expect(result!.endCondition, 'game should end via a real end condition').toBeTruthy();
});
