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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mars Awaits</h1>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="text-lg md:text-xl text-muted-foreground">
          Map: <span className="font-semibold text-foreground">{mapName}</span>
        </p>
        <Button size="lg" onClick={onContinue}>
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
