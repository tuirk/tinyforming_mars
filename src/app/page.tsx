'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { GameScreen } from '@/components/game/GameScreen';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return <AuthCard />;
  }

  return (
    <main className="min-h-screen">
      <GameScreen />
    </main>
  );
}
