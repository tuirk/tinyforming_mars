
'use client';

import type { GameState } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatureResource, ProductionResource, ScienceResource } from './icons';

interface ResourceTokenSupplyProps {
  gameState: GameState;
}

const resourceIcons = {
    Nature: NatureResource,
    Production: ProductionResource,
    Science: ScienceResource,
}

export function ResourceTokenSupply({ gameState }: ResourceTokenSupplyProps) {
  return (
    <Card className="w-full">
        <CardHeader className="pb-2 pt-3">
            <CardTitle className="font-headline text-lg text-center">Resource Tokens</CardTitle>
        </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        {Object.entries(gameState.supplies.resourceTokens).map(([type, value]) => {
            const Icon = resourceIcons[type as keyof typeof resourceIcons];
            return (
            <div key={type} className="flex items-center gap-2">
                <Icon className="h-8 w-8" />
                <span className="font-bold text-lg">{value}</span>
            </div>
            );
        })}
      </CardContent>
    </Card>
  );
}
