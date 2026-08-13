'use client';

import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { app } from './config';

let appCheck: AppCheck | null = null;

/**
 * Starts App Check when NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY is set.
 * Enable enforcement in the Firebase console after the reCAPTCHA key works.
 */
export function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheck) return appCheck;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!siteKey) return null;

  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    Object.assign(globalThis, { FIREBASE_APPCHECK_DEBUG_TOKEN: debugToken });
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheck;
}
