/** Strip Windows newlines that Secret Manager / .env.local can leave on NEXT_PUBLIC_ values. */
export function trimPublicEnv(value: string | undefined): string | undefined {
  if (value == null) return value;
  const trimmed = value.replace(/[\r\n]+/g, '').trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Mutate env in place so Next inlines clean values at build time. */
export function sanitizeFirebasePublicEnv(env: Record<string, string | undefined>): void {
  for (const key of Object.keys(env)) {
    if (!key.startsWith('NEXT_PUBLIC_FIREBASE_')) continue;
    env[key] = trimPublicEnv(env[key]);
  }
}
