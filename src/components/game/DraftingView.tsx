'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, CardId, CardSideId } from '@/engine/types';
import { getCard } from '@/engine/cards';
import { draftCard, getDraftingPlayerId } from '@/engine/gameState';
import { pickBestDraftSide } from '@/ai/aiController';
import { CardSideView } from './CardSideView';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DraftingViewProps {
  state: GameState;
  drawnCardIds: CardId[];
  onDraftComplete: (newState: GameState) => void;
}

export function DraftingView({ state, drawnCardIds, onDraftComplete }: DraftingViewProps) {
  const [draftIndex, setDraftIndex] = useState(0);
  const [localState, setLocalState] = useState<GameState>(state);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const draftingPlayerId = getDraftingPlayerId(localState);
  const isHumanTurn = draftingPlayerId === 'human';

  const currentCard = draftIndex < drawnCardIds.length
    ? getCard(drawnCardIds[draftIndex])
    : undefined;

  const handleHumanDraft = useCallback((humanSide: CardSideId) => {
    if (!currentCard || isAIThinking) return;

    const newState = draftCard(localState, currentCard.id, humanSide);
    const nextIndex = draftIndex + 1;

    if (nextIndex >= 3) {
      onDraftComplete(newState);
    } else {
      setLocalState(newState);
      setDraftIndex(nextIndex);
    }
  }, [currentCard, isAIThinking, localState, draftIndex, onDraftComplete]);

  // AI auto-draft with delay
  useEffect(() => {
    if (isHumanTurn || !currentCard || draftIndex >= 3) return;

    setIsAIThinking(true);

    const timer = setTimeout(() => {
      // pickBestDraftSide returns the human-facing side
      const humanSide = pickBestDraftSide(localState, currentCard.id).side;
      const newState = draftCard(localState, currentCard.id, humanSide);
      const nextIndex = draftIndex + 1;

      setIsAIThinking(false);

      if (nextIndex >= 3) {
        onDraftComplete(newState);
      } else {
        setLocalState(newState);
        setDraftIndex(nextIndex);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHumanTurn, currentCard, draftIndex, localState, onDraftComplete]);

  if (!currentCard) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-2xl font-headline">Loading cards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center pb-4">
          <h2 className="font-headline text-2xl">
            Research Phase — Card {draftIndex + 1} of 3
          </h2>
          {isAIThinking ? (
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-lg">AI is choosing...</span>
            </div>
          ) : (
            <p className="text-muted-foreground mt-1">Your pick</p>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Side A column */}
            <div className="flex flex-col gap-3">
              <h3 className="font-headline text-lg text-center">Side A</h3>
              <CardSideView
                cardSide={currentCard.sideA}
                label={isHumanTurn ? 'You get this side' : undefined}
              />
              {isHumanTurn && (
                <div className="flex flex-col items-center gap-1">
                  <Button
                    className="w-full"
                    data-testid="draft-A"
                    onClick={() => handleHumanDraft('A')}
                    disabled={isAIThinking}
                  >
                    Keep this side &rarr;
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    AI gets Side B
                  </p>
                </div>
              )}
            </div>

            {/* Side B column */}
            <div className="flex flex-col gap-3">
              <h3 className="font-headline text-lg text-center">Side B</h3>
              <CardSideView
                cardSide={currentCard.sideB}
                label={isHumanTurn ? 'You get this side' : undefined}
              />
              {isHumanTurn && (
                <div className="flex flex-col items-center gap-1">
                  <Button
                    className="w-full"
                    data-testid="draft-B"
                    onClick={() => handleHumanDraft('B')}
                    disabled={isAIThinking}
                  >
                    &larr; Keep this side
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    AI gets Side A
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
