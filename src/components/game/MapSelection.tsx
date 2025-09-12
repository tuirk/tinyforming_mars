'use client';

import { useState } from 'react';
import type { MapData, MapId } from '@/lib/game/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HexGrid } from './HexGrid';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface MapSelectionProps {
  maps: MapData[];
  onMapSelect: (mapId: MapId) => void;
}

export function MapSelection({ maps, onMapSelect }: MapSelectionProps) {
  const [selectedMapId, setSelectedMapId] = useState<MapId>(maps[0].id);

  const selectedMap = maps.find(m => m.id === selectedMapId) || maps[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Choose Your Map</CardTitle>
          <CardDescription>Select a map layout to begin your terraforming journey.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow">
            <h3 className="font-headline text-xl mb-4 text-center">{selectedMap.name}</h3>
            <HexGrid map={selectedMap} onHexClick={() => {}} />
          </div>
          <div className="md:w-1/3 flex flex-col justify-between">
            <RadioGroup value={selectedMapId} onValueChange={(id) => setSelectedMapId(id as MapId)}>
                <div className="space-y-4">
                    {maps.map((map) => (
                        <div key={map.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={map.id} id={map.id} />
                            <Label htmlFor={map.id} className="text-lg font-medium">{map.name}</Label>
                        </div>
                    ))}
                </div>
            </RadioGroup>
            <Button size="lg" className="w-full mt-8" onClick={() => onMapSelect(selectedMapId)}>
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}