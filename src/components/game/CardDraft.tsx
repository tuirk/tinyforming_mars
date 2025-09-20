
'use client';

import type { Player, ProjectCardData, CardSide } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCardView } from './ProjectCardView';
import { ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface CardDraftProps {
  player: Player;
  card: ProjectCardData | null;
  onDraft: (chosenSide: CardSide) => void;
  draftTurn: number;
}

export function CardDraft({ player, card, onDraft, draftTurn }: CardDraftProps) {
    if (!player) return null;

    if (player.isAI) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-2xl font-headline">AI is choosing a card...</p>
                <p className="text-muted-foreground">Draft turn {draftTurn + 1} of 3</p>
            </div>
        )
    }

    if (!card) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-2xl font-headline">Drawing card...</p>
            </div>
        )
    }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Card Draft (Turn {draftTurn + 1} of 3)</CardTitle>
          <CardDescription>
            It's <span className="font-bold text-primary">{player.id}'s</span> turn to choose a card side.
            <br/>
            The project in Slot 1 will go to you, and the project in Slot 2 will go to your opponent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Side A */}
                <div className="flex flex-col gap-4 items-center p-4 rounded-lg border border-dashed">
                    <h3 className="font-headline text-xl">Choose Side A</h3>
                    <div className="w-[250px]">
                        <p className="text-center font-semibold mb-2">Your Project (Slot 1)</p>
                        <ProjectCardView card={{effect: card.sideA.slot1, usedThisGeneration: false}} canActivate={false} onActivate={()=>{}} playerId={player.id}/>
                    </div>
                    <ArrowRight className="w-8 h-8 text-muted-foreground shrink-0 rotate-90 md:rotate-0"/>
                    <div className="w-[250px]">
                        <p className="text-center font-semibold mb-2">Opponent's Project (Slot 2)</p>
                        <ProjectCardView card={{effect: card.sideA.slot2, usedThisGeneration: false}} canActivate={false} onActivate={()=>{}} playerId={player.id === 'White' ? 'Black' : 'White'}/>
                    </div>
                    <Button onClick={() => onDraft(card.sideA)} className="mt-4 w-full">Select Side A</Button>
                </div>
                 {/* Side B */}
                 <div className="flex flex-col gap-4 items-center p-4 rounded-lg border border-dashed">
                    <h3 className="font-headline text-xl">Choose Side B</h3>
                    <div className="w-[250px]">
                        <p className="text-center font-semibold mb-2">Your Project (Slot 1)</p>
                        <ProjectCardView card={{effect: card.sideB.slot1, usedThisGeneration: false}} canActivate={false} onActivate={()=>{}} playerId={player.id}/>
                    </div>
                    <ArrowRight className="w-8 h-8 text-muted-foreground shrink-0 rotate-90 md:rotate-0"/>
                    <div className="w-[250px]">
                        <p className="text-center font-semibold mb-2">Opponent's Project (Slot 2)</p>
                        <ProjectCardView card={{effect: card.sideB.slot2, usedThisGeneration: false}} canActivate={false} onActivate={()=>{}} playerId={player.id === 'White' ? 'Black' : 'White'}/>
                    </div>
                    <Button onClick={() => onDraft(card.sideB)} className="mt-4 w-full">Select Side B</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
