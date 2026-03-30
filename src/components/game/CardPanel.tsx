
'use client';

import type { CardSide } from '@/engine/types';
import { ProjectCardView } from './ProjectCardView';
interface CardPanelProps {
  cardSides: CardSide[];
  effectiveCosts: number[];
  canActivate: boolean[];
  usedCardIds: number[];
  isHumanTurn: boolean;
  onActivateCard: (index: number) => void;
}

export function CardPanel({
  cardSides,
  effectiveCosts,
  canActivate,
  usedCardIds,
  isHumanTurn,
  onActivateCard,
}: CardPanelProps) {
  if (cardSides.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-muted-foreground text-sm">No project cards this generation.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {cardSides.map((cardSide, index) => {
        const isUsed = usedCardIds.includes(cardSide.cardId);

        return (
          <div
            key={`${cardSide.cardId}-${cardSide.side}`}
            className="transition-transform duration-200 hover:-translate-y-1"
          >
            <ProjectCardView
              cardSide={cardSide}
              effectiveCost={effectiveCosts[index] ?? cardSide.cost}
              canActivate={canActivate[index] ?? false}
              isUsedThisGen={isUsed}
              isHumanTurn={isHumanTurn}
              onActivate={() => onActivateCard(index)}
            />
          </div>
        );
      })}
    </div>
  );
}
