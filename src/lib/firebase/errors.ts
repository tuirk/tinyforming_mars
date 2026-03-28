const ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
};

export function getAuthErrorMessage(code: string): string {
  return ERROR_MAP[code] ?? 'Something went wrong. Please try again.';
}
