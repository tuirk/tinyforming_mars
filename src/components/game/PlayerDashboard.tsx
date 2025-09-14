'use client';

import type { Player } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CityToken, SpecialProjectToken } from './icons';
import { cn } from '@/lib/utils';
import { Coins, Star } from 'lucide-react';

interface PlayerDashboardProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export function PlayerDashboard({ player, isCurrentPlayer }: PlayerDashboardProps) {
  return (
    <Card className={cn(
      'transition-all duration-300',
      isCurrentPlayer ? 'border-primary shadow-primary/20 shadow-lg' : ''
    )}>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <div className={cn("w-4 h-4 rounded-full", player.id === 'White' ? 'bg-gray-200' : 'bg-gray-700')} />
          Player {player.id} {player.isAI && '(AI)'}
        </CardTitle>
        <div className="flex items-center gap-2 text-lg font-bold text-yellow-400">
           <Star className="h-5 w-5" />
           {player.victoryPoints}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-lg mb-2">
            <div className="flex items-center gap-2 text-green-400">
                <Coins className="h-5 w-5" />
                <span className="font-bold">{player.credits} Credits</span>
            </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-around gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <CityToken className="h-10 w-10" />
            <span className="font-bold text-lg">{player.tokens.city}</span>
            <span className="text-xs text-muted-foreground">Cities</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SpecialProjectToken className="h-10 w-10" />
            <span className="font-bold text-lg">{player.tokens.specialProject}</span>
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
