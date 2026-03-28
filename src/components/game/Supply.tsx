
'use client';

import type { GameState } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterCube, GreeneryCube, HeatCube } from './icons';
import { Coins } from 'lucide-react';

interface SupplyProps {
  parameterSupply: GameState['parameterSupply'];
  creditSupply: number;
}

const parameterIcons = {
  heat: HeatCube,
  greenery: GreeneryCube,
  water: WaterCube,
};

const parameterLabels: Record<string, string> = {
  heat: 'Heat',
  greenery: 'Greenery',
  water: 'Water',
};

export function Supply({ parameterSupply, creditSupply }: SupplyProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="font-headline text-lg text-center">Global Supply</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        <div className="flex items-center gap-2" title="Credits in Supply">
          <Coins className="h-8 w-8 text-yellow-400" />
          <span className="font-bold text-lg">{creditSupply}</span>
        </div>
        <div className="flex gap-4">
          {(Object.entries(parameterSupply) as [keyof typeof parameterIcons, number][]).map(([type, value]) => {
            const Icon = parameterIcons[type];
            return (
              <div key={type} className="flex items-center gap-2" title={parameterLabels[type]}>
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
