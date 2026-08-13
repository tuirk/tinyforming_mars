type LookupUser = {
  localId?: string;
  providerUserInfo?: { providerId?: string }[];
};

/**
 * Verifies a Firebase ID token via Identity Toolkit (no Admin SDK).
 * Gemini / Genkit server paths must call this before spending the API key.
 */
export async function requireFirebaseUser(
  idToken: string | undefined,
  options?: { allowAnonymous?: boolean },
): Promise<{ uid: string }> {
  if (!idToken) {
    throw new Error('Sign in required');
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase is not configured');
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!res.ok) {
    throw new Error('Sign in required');
  }

  const data = (await res.json()) as { users?: LookupUser[] };
  const user = data.users?.[0];
  if (!user?.localId) {
    throw new Error('Sign in required');
  }

  const providers = user.providerUserInfo ?? [];
  const isAnonymous =
    providers.length === 0 || providers.some((p) => p.providerId === 'anonymous');

  if (isAnonymous && options?.allowAnonymous !== true) {
    throw new Error('Gemini requires a Google or email account, not guest');
  }

  return { uid: user.localId };
}
