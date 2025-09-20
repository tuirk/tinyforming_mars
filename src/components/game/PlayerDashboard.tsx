
'use client';

import type { Player, PlayerColor, Tag } from '@/lib/game/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SpecialProjectToken, WaterCube, GreeneryCube, HeatCube, NatureResource, ProductionResource, ScienceResource } from './icons';
import { cn } from '@/lib/utils';
import { Coins, Star, Building2, Flame } from 'lucide-react';
import { TagIcon } from './icons';

interface PlayerDashboardProps {
  player: Player;
  currentPlayerId: PlayerColor;
}

export function PlayerDashboard({ player, currentPlayerId }: PlayerDashboardProps) {
  const isCurrentPlayer = player.id === currentPlayerId;

  const allTags = {
    ...player.permanentTags,
  };
  
  // This logic to sum up tags from different sources will be more complex later
  // For now, we just combine permanent and bonus tags
  for (const key in player.bonusTagsFromCities) {
    const tag = key as keyof typeof player.bonusTagsFromCities;
    allTags[tag] = (allTags[tag] || 0) + player.bonusTagsFromCities[tag];
  }
  
  const hasTags = Object.values(allTags).some(count => count > 0);
  const hasResourceTokens = Object.values(player.resourceTokens).some(count => count > 0);

  return (
    <Card className={cn(
      'transition-all duration-300 w-full',
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

        <div className="grid grid-cols-3 gap-2 text-center my-3 text-xs min-h-[40px] items-start">
          {hasTags ? (
            Object.entries(allTags).map(([tag, count]) => (
                (count ?? 0) > 0 && (
                <div key={tag} className="flex items-center justify-center gap-1">
                  <TagIcon tag={tag as any} className="w-4 h-4" />
                  <span>{count}</span>
                </div>
                )
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground italic">No tags</div>
          )}
        </div>
        
        <Separator className="my-2" />
        
        <div className="grid grid-cols-3 gap-2 text-center my-3 text-xs min-h-[20px]">
          {hasResourceTokens ? (
              <>
                {(player.resourceTokens.Nature ?? 0) > 0 && <div className="flex items-center justify-center gap-1"><NatureResource className="w-4 h-4" /><span>{player.resourceTokens.Nature}</span></div>}
                {(player.resourceTokens.Production ?? 0) > 0 && <div className="flex items-center justify-center gap-1"><ProductionResource className="w-4 h-4" /><span>{player.resourceTokens.Production}</span></div>}
                {(player.resourceTokens.Science ?? 0) > 0 && <div className="flex items-center justify-center gap-1"><ScienceResource className="w-4 h-4" /><span>{player.resourceTokens.Science}</span></div>}
              </>
          ) : (
            <div className="col-span-3 text-center text-muted-foreground italic">No resource tokens</div>
          )}
        </div>


        <Separator className="my-2" />
        
        <div className="flex justify-around gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <Building2 className="h-8 w-8" />
            <span className="font-bold text-md">{player.tokens.city - player.cities.length}</span>
            <span className="text-xs text-muted-foreground">Cities</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SpecialProjectToken className="h-8 w-8" />
            <span className="font-bold text-md">{player.tokens.specialProject}</span>
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
           <div className="flex flex-col items-center gap-1">
            <Flame className="h-8 w-8 text-red-500" />
            <span className="font-bold text-md">{player.personalSupply.heat}</span>
            <span className="text-xs text-muted-foreground">Heat</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
