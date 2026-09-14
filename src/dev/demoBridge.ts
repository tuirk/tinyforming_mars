'use client';

/**
 * Read-only bridge that exposes live game state to the demo recorder.
 *
 * Gated on a localStorage flag rather than `NEXT_PUBLIC_*` because
 * NEXT_PUBLIC values are inlined at build time, which would force a separate
 * build just to record a video. This way one production build serves both real
 * players and the recorder, and Playwright flips the flag with `addInitScript`
 * before the first navigation.
 *
 * Nothing here mutates game state, and with the flag unset it is inert.
 */

import { useEffect } from 'react';

const FLAG = '__tfDemo';
const NAMESPACE = '__tf';

type DemoWindow = Window & { [NAMESPACE]?: Record<string, unknown> };

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(FLAG) === '1';
  } catch {
    return false; // private browsing / blocked site data
  }
}

/**
 * Publish `value` at `window.__tf[slot]` while demo mode is on, and clear the
 * slot on unmount so the driver never reads state from a screen that is gone.
 */
export function useDemoBridge(slot: string, value: unknown): void {
  useEffect(() => {
    if (!isDemoMode()) return;
    const w = window as DemoWindow;
    w[NAMESPACE] = w[NAMESPACE] ?? {};
    w[NAMESPACE]![slot] = value;
  }, [slot, value]);

  // Separate effect so the slot is cleared only on unmount, not on every
  // dependency change — otherwise the driver could poll during the gap.
  useEffect(() => {
    if (!isDemoMode()) return;
    return () => {
      const w = window as DemoWindow;
      if (w[NAMESPACE]) delete w[NAMESPACE]![slot];
    };
  }, [slot]);
}
