
'use client';

import type { GameState } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatureResource, ProductionResource, ScienceResource } from './icons';

interface ResourceTokenSupplyProps {
  resourceTokenSupply: GameState['resourceTokenSupply'];
}

const resourceIcons = {
  nature: NatureResource,
  production: ProductionResource,
  science: ScienceResource,
};

const resourceLabels: Record<string, string> = {
  nature: 'Nature',
  production: 'Production',
  science: 'Science',
};

export function ResourceTokenSupply({ resourceTokenSupply }: ResourceTokenSupplyProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="font-headline text-lg text-center">Resource Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-6 p-3">
        {(Object.entries(resourceTokenSupply) as [keyof typeof resourceIcons, number][]).map(([type, value]) => {
          const Icon = resourceIcons[type];
          return (
            <div key={type} className="flex items-center gap-2" title={resourceLabels[type]}>
              <Icon className="h-8 w-8" />
              <span className="font-bold text-lg">{value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
