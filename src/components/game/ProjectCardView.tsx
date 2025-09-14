'use client';

import type { PlayerProjectCard, PlayerColor } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardViewProps {
  playerCard: PlayerProjectCard;
  playerId: PlayerColor;
  canActivate: boolean;
  onActivate: () => void;
}

export function ProjectCardView({ playerCard, playerId, canActivate, onActivate }: ProjectCardViewProps) {
  const { card, facingPlayerId } = playerCard;
  // The effect that is facing the current player
  const effect = card.effects[facingPlayerId];
  
  // The effect on the other side of the card
  const otherPlayerId = facingPlayerId === 'White' ? 'Black' : 'White';
  const otherEffect = card.effects[otherPlayerId];

  const isPlayerSide = playerId === facingPlayerId;

  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm", playerCard.usedThisGeneration && "opacity-50")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{card.title}</CardTitle>
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
                {effect.cost} <Coins className="h-4 w-4" />
            </div>
        </div>
        <div className="flex gap-1 pt-1">
            {card.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{effect.description}</p>
        <CardDescription className="text-xs mt-2">
            <span className="font-semibold">Other side:</span> {otherEffect.description} ({otherEffect.cost}C)
        </CardDescription>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
