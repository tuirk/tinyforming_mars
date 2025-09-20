
'use client';

import type { PlayerProjectCard, PlayerColor } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle, Flame, Leaf, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagIcon } from './icons';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface ProjectCardViewProps {
  card: PlayerProjectCard;
  playerId: PlayerColor;
  canActivate: boolean;
  onActivate: () => void;
}

export function ProjectCardView({ card, playerId, canActivate, onActivate }: ProjectCardViewProps) {
  const { effect, usedThisGeneration } = card;

  const cardTypeStyles: Record<string, string> = {
      heat: 'bg-red-950/30 border-red-500/30',
      greenery: 'bg-green-950/30 border-green-500/30',
      water: 'bg-blue-950/30 border-blue-500/30',
      utility: 'bg-gray-800/30 border-gray-500/30'
  };
  
  const cardTypeIcons: Record<string, React.ReactNode> = {
      heat: <Flame className="w-5 h-5 text-red-400" />,
      greenery: <Leaf className="w-5 h-5 text-green-400" />,
      water: <Droplets className="w-5 h-5 text-blue-400" />,
      utility: null,
  };

  const cost = effect.cost.credits;
  const isReducible = effect.cost.reducible;

  const requirementEntries = Object.entries(effect.tagRequirements).filter(([, value]) => value > 0);
  const paramRequirementEntries = Object.entries(effect.parameterRequirements).filter(([, value]) => value > 0);
  
  const automaticTags = Object.entries(effect.automaticTags).filter(([, value]) => value > 0);

  return (
    <Card className={cn("w-full h-auto flex flex-col relative overflow-hidden", cardTypeStyles[effect.effectType])}>
        {usedThisGeneration && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
        )}
        <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="font-headline text-lg">{effect.name}</CardTitle>
                <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0">
                    {cost}{isReducible ? '*' : ''} <Coins className="h-4 w-4" />
                </div>
            </div>
             <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex gap-2 items-center flex-wrap">
                    {automaticTags.map(([tag, count]) => (
                        <TooltipProvider key={tag}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                                        <TagIcon tag={tag as any} className="w-3 h-3" />
                                        {tag} {count > 1 ? `x${count}`: ''}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Automatic Tag</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
                 <div className="flex items-center gap-1">
                    {cardTypeIcons[effect.effectType]}
                 </div>
            </div>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
            <p className="text-sm text-foreground/90">{effect.effect}</p>
             {(requirementEntries.length > 0 || paramRequirementEntries.length > 0) && (
                <div className="text-xs mt-2 italic text-muted-foreground space-y-1">
                    <p>
                        Requires: 
                        {requirementEntries.map(([tag, value]) => `${value} ${tag}`).join(', ')}
                        {requirementEntries.length > 0 && paramRequirementEntries.length > 0 && ', '}
                        {paramRequirementEntries.map(([param, value]) => `${value} ${param}`).join(', ')}
                    </p>
                    {effect.costReductionRule && <p>Reduction: {effect.costReductionRule}</p>}
                    {effect.parameterReductionRule && <p>Reduction: {effect.parameterReductionRule}</p>}
                </div>
             )}
        </CardContent>
        <CardFooter className="p-2 flex gap-2">
            <Button size="sm" className="w-full" disabled={!canActivate} onClick={onActivate}>
                <Zap className="mr-2 h-4 w-4" />
                Activate
            </Button>
        </CardFooter>
    </Card>
  );
}
