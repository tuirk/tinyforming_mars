'use client';

import { ProjectCardData } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap } from 'lucide-react';

interface ProjectCardViewProps {
  card: ProjectCardData;
  canActivate: boolean;
  onActivate: () => void;
}

export function ProjectCardView({ card, canActivate, onActivate }: ProjectCardViewProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{card.title}</CardTitle>
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
                {card.cost} <Coins className="h-4 w-4" />
            </div>
        </div>
        <div className="flex gap-1 pt-1">
            {card.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{card.description}</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full" disabled={!canActivate} onClick={onActivate}>
            <Zap className="mr-2 h-4 w-4" />
            Activate
        </Button>
      </CardFooter>
    </Card>
  );
}
