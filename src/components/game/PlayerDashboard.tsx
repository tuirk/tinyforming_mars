
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
        <CardHeader className="flex-row items-center justify-between pb-1 pt-2 px-3">
          <CardTitle className="font-headline text-sm flex items-center gap-1.5">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              player.color === 'white' ? 'bg-gray-200' : 'bg-gray-700'
            )} />
            {playerLabel} ({colorLabel})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0">
          <div className="flex justify-between items-center mb-1 text-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1" data-tutorial="credits">
                  <CreditsStamp size={14} />
                  <span className="font-bold text-green-400 text-xs">Credits: {player.credits}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Credits are used to pay for projects. Max 5 between generations.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <HeatStamp size={14} />
                  <span className="font-bold text-red-400 text-xs">Heat: {player.heatTilesPersonal}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Heat tiles in your supply = 1 VP each at end of game.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator className="my-1" />

          <div className="flex items-center gap-2 my-1 text-xs">
            <span className="text-muted-foreground text-[10px]">Tags:</span>
            {hasTags ? (
              <div className="flex gap-1.5">
                {TAG_ORDER.map(tag => (
                  tagCounts[tag] > 0 && (
                    <Tooltip key={tag}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-0.5">
                          <TagBadge tag={tag} size={12} />
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
              <span className="text-muted-foreground italic text-[10px]">None</span>
            )}
          </div>

          <Separator className="my-1" />

          <div className="flex items-center gap-2 text-xs my-1">
            <span className="text-muted-foreground text-[10px]">Tokens:</span>
            {hasResourceTokens ? (
              <div className="flex gap-1.5">
                {(Object.entries(resourceCounts) as [ResourceType, number][]).map(([type, count]) => {
                  if (count === 0) return null;
                  const Stamp = RESOURCE_STAMPS[type];
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-0.5">
                          <Stamp size={14} />
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
              <span className="text-muted-foreground italic text-[10px]">None</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs mt-1">
            <CityStamp size={14} />
            <span className="text-muted-foreground text-[10px]">Cities: {player.cities.length}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
