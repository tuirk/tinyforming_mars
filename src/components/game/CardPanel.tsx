
'use client';

import type { CardSide } from '@/engine/types';
import { ProjectCardView } from './ProjectCardView';
import { cn } from '@/lib/utils';

interface CardPanelProps {
  cardSides: CardSide[];
  effectiveCosts: number[];
  canActivate: boolean[];
  usedCardIds: number[];
  isHumanTurn: boolean;
  onActivateCard: (index: number) => void;
}

const fanConfig = [
  { rotate: -8, translateY: -10, translateX: -20 },
  { rotate: 0, translateY: 0, translateX: 0 },
  { rotate: 8, translateY: -10, translateX: 20 },
];

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
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">No project cards this generation.</p>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-2 relative py-2">
      {cardSides.map((cardSide, index) => {
        const fan = fanConfig[index] ?? fanConfig[1];
        const isCenter = index === 1;
        const isUsed = usedCardIds.includes(cardSide.cardId);

        return (
          <div
            key={`${cardSide.cardId}-${cardSide.side}`}
            className={cn(
              'w-[180px] transition-transform duration-200 hover:-translate-y-4',
              isCenter ? 'z-20' : 'z-10',
            )}
            style={{
              transform: `rotate(${fan.rotate}deg) translateY(${fan.translateY}px) translateX(${fan.translateX}px)`,
            }}
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
