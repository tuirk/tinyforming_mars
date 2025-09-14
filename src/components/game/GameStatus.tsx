'use client';

import { PlayerColor } from '@/lib/game/types';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface GameStatusProps {
  generation: number;
  currentPlayerId: PlayerColor;
  isAIThinking: boolean;
}

export function GameStatus({ generation, currentPlayerId, isAIThinking }: GameStatusProps) {
  return (
    <Card className="w-full p-2 px-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="font-headline text-lg">Generation: {generation}</div>
        <div className="flex items-center gap-2 text-lg">
          {isAIThinking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-headline text-primary">AI is thinking...</span>
            </>
          ) : (
            <span className="font-headline">
              Current Player: <span className={currentPlayerId === 'White' ? 'text-primary' : 'text-accent'}>{currentPlayerId}</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
