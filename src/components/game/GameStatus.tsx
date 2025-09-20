
'use client';

import { Player, PlayerColor } from '@/lib/game/types';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  generation: number;
  currentPlayerIndex: number;
  players: Player[];
  isAIThinking: boolean;
}

const TOTAL_GENERATIONS = 12;

export function GameStatus({ generation, currentPlayerIndex, players, isAIThinking }: GameStatusProps) {
  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerId = currentPlayer.id;

  return (
    <Card className="w-full p-2 px-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="font-headline text-lg">Generation: {generation}</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_GENERATIONS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-4 w-4 rounded-sm border border-primary/50',
                  i < generation ? 'bg-primary' : 'bg-secondary'
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-lg">
          {isAIThinking && currentPlayer.isAI ? (
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
