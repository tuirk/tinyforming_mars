
'use client';

import type { GameState } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatureTokenStamp, ProductionTokenStamp, ScienceTokenStamp } from './GameIcons';

interface ResourceTokenSupplyProps {
  resourceTokenSupply: GameState['resourceTokenSupply'];
  compact?: boolean;
}

const resourceStamps = {
  nature: NatureTokenStamp,
  production: ProductionTokenStamp,
  science: ScienceTokenStamp,
};

const resourceLabels: Record<string, string> = {
  nature: 'Nature',
  production: 'Production',
  science: 'Science',
};

export function ResourceTokenSupply({ resourceTokenSupply, compact }: ResourceTokenSupplyProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        {(Object.entries(resourceTokenSupply) as [keyof typeof resourceStamps, number][]).map(([type, value]) => {
          const Stamp = resourceStamps[type];
          return (
            <div key={type} className="flex items-center gap-1" title={`${resourceLabels[type]} tokens in supply`}>
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
        <CardTitle className="font-headline text-lg text-center">Resource Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        {(Object.entries(resourceTokenSupply) as [keyof typeof resourceStamps, number][]).map(([type, value]) => {
          const Stamp = resourceStamps[type];
          return (
            <div key={type} className="flex items-center gap-2" title={resourceLabels[type]}>
              <Stamp size={32} />
              <span className="font-bold text-lg">{value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
