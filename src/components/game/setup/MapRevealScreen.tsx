'use client';

import type { GameState } from '@/engine/types';
import { MarsBoard } from '../MarsBoard';
import { Button } from '@/components/ui/button';

interface MapRevealScreenProps {
  state: GameState;
  onContinue: () => void;
}

const MAP_DISPLAY_NAMES: Record<string, string> = {
  tharsis: 'Tharsis',
  elysium: 'Elysium',
};

export function MapRevealScreen({ state, onContinue }: MapRevealScreenProps) {
  const mapName = MAP_DISPLAY_NAMES[state.map] ?? state.map;

  return (
    <div className="tf-setup-screen">
      <h1 className="tf-setup-title">Mars Awaits</h1>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <p className="tf-setup-subtitle">
          Map:{' '}
          <span className="font-headline font-semibold tracking-wide text-foreground">
            {mapName}
          </span>
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

      <div className="w-full max-w-[min(92vw,520px)]">
        <MarsBoard
          board={state.board}
          mapId={state.map}
          disabled
        />
      </div>
    </div>
  );
}
