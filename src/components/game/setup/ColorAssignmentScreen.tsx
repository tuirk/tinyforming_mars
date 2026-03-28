'use client';

import { useEffect } from 'react';
import type { PlayerColor } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorAssignmentScreenProps {
  humanColor: PlayerColor;
  onContinue: () => void;
}

export function ColorAssignmentScreen({ humanColor, onContinue }: ColorAssignmentScreenProps) {
  // Auto-advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onContinue, 3000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold tracking-tight">Your Color</h1>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full border-2 border-border',
            humanColor === 'white' ? 'bg-gray-200' : 'bg-gray-700',
          )}
        />
        <span className="text-2xl font-semibold capitalize">{humanColor}</span>
      </div>

      <p className="text-muted-foreground text-center max-w-md">
        White goes first in odd generations (1, 3, 5 ...).
        Black goes first in even generations (2, 4, 6 ...).
      </p>

      <Button variant="outline" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
