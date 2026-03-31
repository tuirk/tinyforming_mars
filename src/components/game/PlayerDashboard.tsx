
'use client';

import type { PlayerState, TagType, ResourceType } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TagBadge } from './GameIcons';
import {
  CreditsStamp,
  HeatStamp,
  NatureTokenStamp,
  ProductionTokenStamp,
  ScienceTokenStamp,
  CityStamp,
} from './GameIcons';

interface PlayerDashboardProps {
  player: PlayerState;
  tagCounts: Record<TagType, number>;
  isCurrentTurn: boolean;
}

const TAG_ORDER: TagType[] = ['energy', 'production', 'nature', 'science', 'space'];

const RESOURCE_STAMPS: Record<ResourceType, React.ComponentType<{ size?: number }>> = {
  nature: NatureTokenStamp,
  production: ProductionTokenStamp,
  science: ScienceTokenStamp,
};

export function PlayerDashboard({ player, tagCounts, isCurrentTurn }: PlayerDashboardProps) {
  const hasTags = Object.values(tagCounts).some(count => count > 0);

  // Count resource tokens from the array
  const resourceCounts: Record<ResourceType, number> = {
    nature: player.resourceTokens.filter(t => t === 'nature').length,
    production: player.resourceTokens.filter(t => t === 'production').length,
    science: player.resourceTokens.filter(t => t === 'science').length,
  };
  const hasResourceTokens = Object.values(resourceCounts).some(count => count > 0);

  const playerLabel = player.id === 'human' ? 'Human' : 'AI';
  const colorLabel = player.color === 'white' ? 'White' : 'Black';

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cn(
        'transition-all duration-300 w-full',
        isCurrentTurn ? 'border-primary shadow-lg shadow-primary/20' : ''
      )}>
        <CardHeader className="flex-row items-center justify-between pb-2 pt-3 px-4">
          <CardTitle className="font-headline text-base flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              player.color === 'white' ? 'bg-gray-200' : 'bg-gray-700'
            )} />
            {playerLabel} ({colorLabel})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex justify-between items-center mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <CreditsStamp size={18} />
                  <span className="font-bold text-green-400">Credits: {player.credits}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Credits are used to pay for projects. Max 5 between generations.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <HeatStamp size={18} />
                  <span className="font-bold text-red-400">Heat: {player.heatTilesPersonal}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Heat tiles in your supply = 1 VP each at end of game.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center gap-3 my-2 text-sm">
            <span className="text-muted-foreground text-xs">Tags:</span>
            {hasTags ? (
              <div className="flex gap-2">
                {TAG_ORDER.map(tag => (
                  tagCounts[tag] > 0 && (
                    <Tooltip key={tag}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <TagBadge tag={tag} size={16} />
                          <span>{tagCounts[tag]}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs capitalize">{tag} tag. Sources: project cards, bonus hexes, resource tokens.</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground italic">None</span>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex items-center gap-3 text-sm my-2">
            <span className="text-muted-foreground text-xs">Tokens:</span>
            {hasResourceTokens ? (
              <div className="flex gap-2">
                {(Object.entries(resourceCounts) as [ResourceType, number][]).map(([type, count]) => {
                  if (count === 0) return null;
                  const Stamp = RESOURCE_STAMPS[type];
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Stamp size={18} />
                          <span>x{count}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs capitalize">{type} token. Can be spent as a {type} tag for any project requirement.</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground italic">None</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm mt-2">
            <CityStamp size={18} />
            <span className="text-muted-foreground">Cities: {player.cities.length}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
