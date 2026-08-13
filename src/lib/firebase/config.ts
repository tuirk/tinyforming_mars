import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { trimPublicEnv } from './env';

const firebaseConfig = {
  apiKey: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: trimPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
