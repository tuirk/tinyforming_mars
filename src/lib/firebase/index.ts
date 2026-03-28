export { auth, db, app } from './config';
export { signUp, signIn, signOut, signInWithGoogle, resetPassword, onAuthChange } from './auth';
export { createUserDocument, getUserDocument, updateUserDocument } from './user';
export { getAuthErrorMessage } from './errors';
