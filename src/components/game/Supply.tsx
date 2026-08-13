
'use client';

import type { GameState } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditsStamp, HeatStamp, GreeneryStamp, WaterStamp } from './GameIcons';

interface SupplyProps {
  parameterSupply: GameState['parameterSupply'];
  creditSupply: number;
  compact?: boolean;
}

const parameterStamps = {
  heat: HeatStamp,
  greenery: GreeneryStamp,
  water: WaterStamp,
};

const parameterLabels: Record<string, string> = {
  heat: 'Heat',
  greenery: 'Greenery',
  water: 'Water',
};

export function Supply({ parameterSupply, creditSupply, compact }: SupplyProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1" title="Credits in shared supply">
          <CreditsStamp size={18} />
          <span className="font-bold text-sm">{creditSupply}</span>
        </div>
        {(Object.entries(parameterSupply) as [keyof typeof parameterStamps, number][]).map(([type, value]) => {
          const Stamp = parameterStamps[type];
          return (
            <div key={type} className="flex items-center gap-1" title={`${parameterLabels[type]} tiles in supply`}>
              <Stamp size={18} />
              <span className="font-bold text-sm">{value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="font-headline text-lg text-center">Global Supply</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        <div className="flex items-center gap-2" title="Credits in Supply">
          <CreditsStamp size={32} />
          <span className="font-bold text-lg">{creditSupply}</span>
        </div>
        <div className="flex gap-4">
          {(Object.entries(parameterSupply) as [keyof typeof parameterStamps, number][]).map(([type, value]) => {
            const Stamp = parameterStamps[type];
            return (
              <div key={type} className="flex items-center gap-2" title={parameterLabels[type]}>
                <Stamp size={32} />
                <span className="font-bold text-lg">{value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
