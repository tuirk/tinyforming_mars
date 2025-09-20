
'use client';

import type { GameState } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatureResource, ProductionResource, ScienceResource, WaterCube, GreeneryCube, HeatCube } from './icons';
import { Coins } from 'lucide-react';

interface SupplyProps {
  gameState: GameState;
}

const parameterIcons = {
    Water: WaterCube,
    Greenery: GreeneryCube,
    Heat: HeatCube,
}

export function Supply({ gameState }: SupplyProps) {
  return (
    <Card className="w-full">
        <CardHeader className="pb-2 pt-3">
            <CardTitle className="font-headline text-lg text-center">Global Supply</CardTitle>
        </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        <div className="flex items-center gap-2" title="Credits in Supply">
            <Coins className="h-8 w-8 text-yellow-400" />
            <span className="font-bold text-lg">{gameState.creditsInSupply}</span>
        </div>
        <div className="flex gap-4">
            {Object.entries(gameState.parametersInSupply).map(([type, value]) => {
                const Icon = parameterIcons[type as keyof typeof parameterIcons];
                return (
                <div key={type} className="flex items-center gap-2">
                    <Icon className="h-8 w-8" />
                    <span className="font-bold text-lg">{value}</span>
                </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
