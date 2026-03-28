
'use client';

import type { PlayerState, TagType, ResourceType, Phase } from '@/engine/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Coins, Flame, Building2 } from 'lucide-react';
import { TagIcon, NatureResource, ProductionResource, ScienceResource } from './icons';

interface PlayerDashboardProps {
  player: PlayerState;
  tagCounts: Record<TagType, number>;
  isCurrentTurn: boolean;
  generation: number;
  phase: Phase;
}

const TAG_ORDER: TagType[] = ['energy', 'production', 'nature', 'science', 'space'];

const RESOURCE_ICONS: Record<ResourceType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  nature: NatureResource,
  production: ProductionResource,
  science: ScienceResource,
};

export function PlayerDashboard({ player, tagCounts, isCurrentTurn, generation, phase }: PlayerDashboardProps) {
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
        <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              player.color === 'white' ? 'bg-gray-200' : 'bg-gray-700'
            )} />
            {playerLabel} ({colorLabel})
          </CardTitle>
          <div className="text-sm text-muted-foreground font-medium">
            Gen {generation}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-md mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-green-400">
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">Credits: {player.credits}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Credits are used to pay for projects. Max 5 between generations.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-red-400">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold">Heat: {player.heatTilesPersonal}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Heat tiles in your supply = 1 VP each at end of game.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator className="my-2" />

          <div className="text-xs text-muted-foreground mb-1">Tags:</div>
          <div className="grid grid-cols-3 gap-2 text-center my-2 text-xs min-h-[40px] items-start">
            {hasTags ? (
              TAG_ORDER.map(tag => (
                tagCounts[tag] > 0 && (
                  <Tooltip key={tag}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center gap-1">
                        <TagIcon tag={tag} className="w-4 h-4" />
                        <span>{tagCounts[tag]}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs capitalize">{tag} tag. Sources: project cards, bonus hexes, resource tokens.</p>
                    </TooltipContent>
                  </Tooltip>
                )
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground italic">No tags</div>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex items-center gap-2 text-xs my-2 min-h-[20px]">
            <span className="text-muted-foreground">Tokens:</span>
            {hasResourceTokens ? (
              <div className="flex gap-3">
                {(Object.entries(resourceCounts) as [ResourceType, number][]).map(([type, count]) => {
                  if (count === 0) return null;
                  const Icon = RESOURCE_ICONS[type];
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Icon className="w-4 h-4" />
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

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-xs my-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cities: {player.cities.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">You have {player.cities.length} of 2 maximum cities.</p>
            </TooltipContent>
          </Tooltip>

          <Separator className="my-2" />

          <div className="text-xs text-muted-foreground text-center">
            Phase: <span className="font-medium capitalize">{phase}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
