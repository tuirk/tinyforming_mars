import { describe, expect, it } from 'vitest';
import { sanitizeFirebasePublicEnv, trimPublicEnv } from '../env';

describe('trimPublicEnv', () => {
  it('strips CR/LF that Windows .env and Secret Manager can leave on Firebase config', () => {
    expect(trimPublicEnv('studio-3765470109-337fd\r\n')).toBe('studio-3765470109-337fd');
    expect(trimPublicEnv('example.firebaseapp.com\n')).toBe('example.firebaseapp.com');
  });

  it('returns undefined for missing or blank values', () => {
    expect(trimPublicEnv(undefined)).toBeUndefined();
    expect(trimPublicEnv('  \r\n')).toBeUndefined();
  });
});

describe('sanitizeFirebasePublicEnv', () => {
  it('trims NEXT_PUBLIC_FIREBASE_ keys in place so webpack cannot inline \\r\\n', () => {
    const env = {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'studio-3765470109-337fd\r\n',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key\n',
      GOOGLE_GENAI_API_KEY: 'leave-me\r\n',
    };
    sanitizeFirebasePublicEnv(env);
    expect(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe('studio-3765470109-337fd');
    expect(env.NEXT_PUBLIC_FIREBASE_API_KEY).toBe('test-api-key');
    expect(env.GOOGLE_GENAI_API_KEY).toBe('leave-me\r\n');
  });
});
