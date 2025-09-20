'use client';

import type { PlayerProjectCard, PlayerColor } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle, Flame, Leaf, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagIcon } from './icons';

interface ProjectCardViewProps {
  playerCard: PlayerProjectCard;
  playerId: PlayerColor;
  canActivate: boolean;
  onActivate: () => void;
}

export function ProjectCardView({ playerCard, playerId, canActivate, onActivate }: ProjectCardViewProps) {
  const { effect, usedThisGeneration } = playerCard;

  const cardType = effect.tags?.includes('Heat') ? 'Heat' :
                   effect.tags?.includes('Plant') ? 'Greenery' :
                   effect.tags?.includes('Water') ? 'Water' : 'Grey';

  const cardTypeStyles: Record<string, string> = {
      Heat: 'bg-red-950/30 border-red-500/30',
      Greenery: 'bg-green-950/30 border-green-500/30',
      Water: 'bg-blue-950/30 border-blue-500/30',
      Grey: 'bg-gray-800/30 border-gray-500/30'
  }
  
  const cardTypeIcons: Record<string, React.ReactNode> = {
      Heat: <Flame className="w-5 h-5 text-red-400" />,
      Greenery: <Leaf className="w-5 h-5 text-green-400" />,
      Water: <Droplets className="w-5 h-5 text-blue-400" />,
      Grey: null,
  }

  return (
    <Card className={cn("w-full h-[220px] flex flex-col", playerCard.usedThisGeneration && "opacity-50", cardTypeStyles[cardType])}>
        <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="font-headline text-lg">{effect.name}</CardTitle>
                {effect.cost && (
                  <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0">
                      {effect.cost} <Coins className="h-4 w-4" />
                  </div>
                )}
            </div>
             <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex gap-2 items-center">
                    {effect.tags?.map(tag => (
                         <Badge key={tag} variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                            <TagIcon tag={tag as any} className="w-3 h-3" />
                            {tag}
                         </Badge>
                    ))}
                </div>
                 <div className="flex items-center gap-1">
                    {cardTypeIcons[cardType]}
                 </div>
            </div>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
            <p className="text-sm text-foreground/90">{effect.effect}</p>
             {effect.requirements && (
                <CardDescription className="text-xs mt-2 italic">
                    Requires: {effect.requirements.join(', ')}
                </CardDescription>
             )}
        </CardContent>
        <CardFooter className="p-2 flex gap-2">
            <Button size="sm" className="w-full" disabled={!canActivate} onClick={onActivate}>
                {usedThisGeneration ? (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Used
                    </>
                ) : (
                    <>
                        <Zap className="mr-2 h-4 w-4" />
                        Activate
                    </>
                )}
            </Button>
        </CardFooter>
    </Card>
  );
}
