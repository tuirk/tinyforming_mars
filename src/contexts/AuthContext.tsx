'use client';

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signOut } from '@/lib/firebase/auth';
import { doc, onSnapshot, db } from '@/lib/firebase/firestore';
import { createUserDocument } from '@/lib/firebase/user';
import type { UserProfile } from '@/types/user';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  profileError: false,
});

function parseUserDoc(data: Record<string, unknown>): UserProfile {
  return {
    uid: data.uid as string,
    email: data.email as string,
    displayName: data.displayName as string | undefined,
    photoURL: data.photoURL as string | undefined,
    authProvider: data.authProvider as 'email' | 'google',
    stats: (data.stats as UserProfile['stats']) ?? { wins: 0, losses: 0, totalGames: 0 },
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const loadingResolved = useRef(false);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const timeout = setTimeout(() => {
      if (!loadingResolved.current) {
        loadingResolved.current = true;
        setLoading(false);
      }
    }, 30000);

    const unsubAuth = onAuthChange((user) => {
      setFirebaseUser(user);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setProfileError(false);

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setUserProfile(parseUserDoc(snap.data()));
            } else {
              createUserDocument(user).catch((err) =>
                console.error('Auto-create user document failed:', err),
              );
            }
            if (!loadingResolved.current) {
              loadingResolved.current = true;
              setLoading(false);
            }
          },
          (error) => {
            console.error('Firestore profile listener error:', error);
            if ((error as { code?: string }).code === 'permission-denied') {
              signOut().catch(() => {});
              return;
            }
            setProfileError(true);
            if (!loadingResolved.current) {
              loadingResolved.current = true;
              setLoading(false);
            }
          },
        );
      } else {
        setUserProfile(null);
        if (!loadingResolved.current) {
          loadingResolved.current = true;
          setLoading(false);
        }
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, profileError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
