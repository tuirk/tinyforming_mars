// Authentication — anonymous and email auth
// TODO: Implement in Phase 1F task 1F.4

import { signInAnonymously as firebaseSignInAnonymously, type User } from 'firebase/auth';
import { auth } from './config';

/** Sign in anonymously (no account required to play) */
export async function signInAnonymously(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

/** Sign in with email for cross-device game persistence */
export async function signInWithEmail(
  _email: string,
  _password: string,
): Promise<User> {
  // TODO (1F.4): Implement email auth
  throw new Error('Not implemented — Phase 1F task 1F.4');
}

/** Get the current authenticated user, or null */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
