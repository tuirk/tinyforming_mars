'use client';

import type { Player } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SpecialProjectToken, WaterCube, GreeneryCube, HeatCube } from './icons';
import { cn } from '@/lib/utils';
import { Coins, Star, Building2 } from 'lucide-react';

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
      <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", player.id === 'White' ? 'bg-gray-200' : 'bg-gray-700')} />
          {player.id} {player.isAI && '(AI)'}
        </CardTitle>
        <div className="flex items-center gap-2 text-md font-bold text-yellow-400">
           <Star className="h-4 w-4" />
           {player.victoryPoints}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center text-md mb-2">
            <div className="flex items-center gap-2 text-green-400">
                <Coins className="h-4 w-4" />
                <span className="font-bold">{player.credits} Credits</span>
            </div>
        </div>
        <Separator className="my-2" />

        <div className="grid grid-cols-3 gap-2 text-center my-3">
            <div>
                <WaterCube className="h-8 w-8 mx-auto" />
                <span className="font-bold text-sm">{player.parameterCubes.Water}</span>
            </div>
            <div>
                <GreeneryCube className="h-8 w-8 mx-auto" />
                <span className="font-bold text-sm">{player.parameterCubes.Greenery}</span>
            </div>
            <div>
                <HeatCube className="h-8 w-8 mx-auto" />
                <span className="font-bold text-sm">{player.parameterCubes.Heat}</span>
            </div>
        </div>

        <Separator className="my-2" />
        
        <div className="flex justify-around gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <Building2 className="h-8 w-8" />
            <span className="font-bold text-md">{player.tokens.city}</span>
            <span className="text-xs text-muted-foreground">Cities</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SpecialProjectToken className="h-8 w-8" />
            <span className="font-bold text-md">{player.tokens.specialProject}</span>
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
