#!/usr/bin/env node
/**
 * Convert the recorded gameplay WebM into an H.264 MP4.
 *
 * Playwright writes VP8 WebM with no audio track. Most editors and upload
 * pipelines want H.264 in MP4, and `-pix_fmt yuv420p` is required or QuickTime
 * and Premiere reject the file outright.
 *
 * Usage:
 *   node scripts/make-video.mjs            # newest run under D:\tinyformers-media
 *   node scripts/make-video.mjs <runDir>   # a specific run
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MEDIA_ROOT = process.env.TF_MEDIA_ROOT ?? 'D:\\tinyformers-media';
const FFMPEG = process.env.FFMPEG_PATH ?? 'D:\\tools\\ffmpeg\\bin\\ffmpeg.exe';

function die(msg) {
  console.error(`make-video: ${msg}`);
  process.exit(1);
}

function resolveRunDir() {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;

  const pointer = join(MEDIA_ROOT, 'latest.txt');
  if (existsSync(pointer)) {
    const p = readFileSync(pointer, 'utf8').trim();
    if (p && existsSync(p)) return p;
  }

  if (!existsSync(MEDIA_ROOT)) die(`no media root at ${MEDIA_ROOT} — record a game first`);
  const runs = readdirSync(MEDIA_ROOT)
    .filter((n) => !n.startsWith('_') && n !== 'latest.txt')
    .map((n) => join(MEDIA_ROOT, n))
    .filter((p) => statSync(p).isDirectory())
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (runs.length === 0) die(`no runs found under ${MEDIA_ROOT}`);
  return runs[0];
}

if (!existsSync(FFMPEG)) {
  die(
    `ffmpeg not found at ${FFMPEG}\n` +
      `  Install the portable build to D:\\tools\\ffmpeg, or set FFMPEG_PATH.`,
  );
}

const runDir = resolveRunDir();
const input = join(runDir, 'raw', 'game.webm');
if (!existsSync(input)) die(`no recording at ${input}`);

const outDir = join(runDir, 'out');
mkdirSync(outDir, { recursive: true });
const output = join(outDir, 'game.mp4');

console.log(`ffmpeg: ${input}\n     -> ${output}`);

const args = [
  '-y',
  '-i', input,
  '-c:v', 'libx264',
  // CRF 16, chosen by measuring SSIM against the source on real gameplay:
  //   crf 20 -> 0.998532   crf 18 -> 0.998982   crf 16 -> 0.999303
  // `-tune stillimage` scored worse (0.999267) for a larger file, so it is not
  // used despite this being mostly-static screen content.
  '-crf', '16',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an', // Playwright video has no audio track
  output,
];

const res = spawnSync(FFMPEG, args, { stdio: ['ignore', 'inherit', 'inherit'] });
if (res.error) die(String(res.error));
if (res.status !== 0) die(`ffmpeg exited with code ${res.status}`);

const mb = (statSync(output).size / 1024 / 1024).toFixed(1);
console.log(`\nDone: ${output} (${mb} MB)`);
