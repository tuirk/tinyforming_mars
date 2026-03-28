'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { GameScreen } from '@/components/game/GameScreen';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

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
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {userProfile.displayName || userProfile.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="mr-1 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <GameScreen />
    </main>
  );
}
