'use client';

import type { PlayerColor } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorAssignmentScreenProps {
  humanColor: PlayerColor;
  onContinue: () => void;
}

export function ColorAssignmentScreen({ humanColor, onContinue }: ColorAssignmentScreenProps) {
  // No auto-advance — a timer remounted the next setup screen (and tutorial tip) mid-read.
  return (
    <div className="tf-setup-screen gap-6">
      <h1 className="tf-setup-title">Your Color</h1>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'h-10 w-10 rounded-full border-2 border-border',
            humanColor === 'white' ? 'bg-gray-200' : 'bg-gray-700',
          )}
        />
        <span className="font-headline text-2xl font-semibold capitalize tracking-wide">
          {humanColor}
        </span>
      </div>

      <p className="tf-setup-subtitle max-w-md text-center leading-relaxed">
        White goes first in odd generations (1, 3, 5…).
        Black goes first in even generations (2, 4, 6…).
      </p>

      <Button
        variant="launch"
        size="xs"
        className="normal-case tracking-wide"
        data-testid="setup-continue"
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}
