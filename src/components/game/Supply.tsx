'use client';

import type { GameState } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatureResource, ProductionResource, ScienceResource, WaterCube, GreeneryCube, HeatCube } from './icons';

interface SupplyProps {
  gameState: GameState;
}

const resourceIcons = {
  Nature: NatureResource,
  Production: ProductionResource,
  Science: ScienceResource,
};

const cubeIcons = {
    Water: WaterCube,
    Greenery: GreeneryCube,
    Heat: HeatCube,
}

export function Supply({ gameState }: SupplyProps) {
  return (
    <Card className="w-full">
        <CardHeader className="pb-2 pt-3">
            <CardTitle className="font-headline text-lg text-center">Supply</CardTitle>
        </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        <div className="flex gap-4">
            {Object.entries(gameState.cubeSupply).map(([type, value]) => {
                const Icon = cubeIcons[type as keyof typeof cubeIcons];
                return (
                <div key={type} className="flex items-center gap-2">
                    <Icon className="h-8 w-8" />
                    <span className="font-bold text-lg">{value}</span>
                </div>
                );
            })}
        </div>
        <div className="flex gap-4">
            {Object.entries(gameState.resourceSupply).map(([type, value]) => {
                const Icon = resourceIcons[type as keyof typeof resourceIcons];
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
