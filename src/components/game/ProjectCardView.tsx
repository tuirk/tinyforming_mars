'use client';

import { useState } from 'react';
import type { PlayerProjectCard, PlayerColor, CardType, ProjectCardEffect } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle, Flame, Leaf, Droplets, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagIcon } from './icons';

interface ProjectCardViewProps {
  playerCard: PlayerProjectCard;
  playerId: PlayerColor;
  canActivate: boolean;
  onActivate: () => void;
}

const cardTypeStyles: Record<CardType, string> = {
    Heat: 'bg-red-950/30 border-red-500/30',
    Greenery: 'bg-green-950/30 border-green-500/30',
    Water: 'bg-blue-950/30 border-blue-500/30',
    Grey: 'bg-gray-800/30 border-gray-500/30'
}

const cardTypeIcons: Record<CardType, React.ReactNode> = {
    Heat: <Flame className="w-5 h-5 text-red-400" />,
    Greenery: <Leaf className="w-5 h-5 text-green-400" />,
    Water: <Droplets className="w-5 h-5 text-blue-400" />,
    Grey: null,
}

const CardFace = ({ card, effect, type, isOpponentView }: { card: PlayerProjectCard['card'], effect: ProjectCardEffect, type: 'player' | 'opponent', isOpponentView: boolean}) => {
    return (
        <Card className={cn(
            "w-full h-full backface-hidden absolute transition-all",
            cardTypeStyles[card.type],
        )}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg">{card.title}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0">
                        {effect.cost} <Coins className="h-4 w-4" />
                    </div>
                </div>
                 <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex gap-2 items-center">
                        {card.tags.map(tag => (
                             <Badge key={tag} variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                                <TagIcon tag={tag} className="w-3 h-3" />
                                {tag}
                             </Badge>
                        ))}
                    </div>
                     <div className="flex items-center gap-1">
                        {cardTypeIcons[card.type]}
                     </div>
                </div>
            </CardHeader>
            <CardContent className="py-2">
                <p className="text-sm text-foreground/90">{effect.description}</p>
                 {isOpponentView && <CardDescription className="text-xs mt-2 italic">Opponent's view</CardDescription>}
            </CardContent>
        </Card>
    )
}

export function ProjectCardView({ playerCard, playerId, canActivate, onActivate }: ProjectCardViewProps) {
  const { card, effects } = playerCard;
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={cn("relative h-[220px] perspective", playerCard.usedThisGeneration && "opacity-50")}>
      <div 
        className="relative w-full h-full transition-transform duration-700 preserve-3d"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front Face */}
        <div className="absolute w-full h-full backface-hidden">
             <CardFace card={card} effect={effects.player} type="player" isOpponentView={false} />
        </div>

        {/* Back Face */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <CardFace card={card} effect={effects.opponent} type="opponent" isOpponentView={true}/>
        </div>
      </div>

       {/* Actions are outside the flip container */}
      <CardFooter className="absolute bottom-0 w-full bg-card/80 backdrop-blur-sm rounded-b-lg p-2 flex gap-2 z-10">
        <Button size="sm" className="w-full" disabled={!canActivate} onClick={onActivate}>
            {playerCard.usedThisGeneration ? (
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
        <Button size="sm" variant="outline" onClick={() => setIsFlipped(f => !f)} className="px-3">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </div>
  );
}
