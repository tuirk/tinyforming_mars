
'use client';

import { Player } from '@/lib/game/types';
import { Card } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GameStatusProps {
  generation: number;
  currentPlayerIndex: number;
  players: Player[];
  isAIThinking: boolean;
  onStopGame: () => void;
}

const TOTAL_GENERATIONS = 12;

export function GameStatus({ generation, currentPlayerIndex, players, isAIThinking, onStopGame }: GameStatusProps) {
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
        <div className="flex items-center gap-4">
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Stop Game</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to stop the game?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will end the current game and return you to the map selection screen. Your progress will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onStopGame}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
