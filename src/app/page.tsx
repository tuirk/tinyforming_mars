'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { MatchType } from '@/engine/types';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GameScreen } from '@/components/game/GameScreen';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { firebaseUser, userProfile, loading } = useAuth();
  const [activeGame, setActiveGame] = useState<MatchType | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0d0d1a' }}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated → landing page
  if (!firebaseUser || !userProfile) {
    return <LandingPage />;
  }

  // Authenticated + game active → game screen
  if (activeGame) {
    return (
      <GameScreen
        uid={firebaseUser.uid}
        tutorialCompleted={userProfile.tutorialCompleted}
        onBackToDashboard={() => setActiveGame(null)}
      />
    );
  }

  // Authenticated + no active game → dashboard
  const isGuest = firebaseUser.isAnonymous;

  return (
    <Dashboard
      userProfile={userProfile}
      isGuest={isGuest}
      onStartGame={(matchType) => setActiveGame(matchType)}
    />
  );
}
