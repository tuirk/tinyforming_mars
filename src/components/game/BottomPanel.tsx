
'use client';

import type { CardSide, StandardProjectId } from '@/engine/types';
import { CardPanel } from './CardPanel';
import { StandardProjects } from './StandardProjects';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

interface BottomPanelProps {
  cardSides: CardSide[];
  effectiveCosts: number[];
  canActivateCards: boolean[];
  usedCardIds: number[];
  standardProjectCanActivate: Record<StandardProjectId, boolean>;
  alreadyUsedStdProject: boolean;
  isHumanTurn: boolean;
  hasPassed: boolean;
  onActivateCard: (index: number) => void;
  onStandardProject: (projectId: StandardProjectId) => void;
  onPass: () => void;
  onPassMouseEnter?: () => void;
}

export function BottomPanel({
  cardSides,
  effectiveCosts,
  canActivateCards,
  usedCardIds,
  standardProjectCanActivate,
  alreadyUsedStdProject,
  isHumanTurn,
  hasPassed,
  onActivateCard,
  onStandardProject,
  onPass,
  onPassMouseEnter,
}: BottomPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-30">
      <div className="flex items-end gap-4 px-4 py-2 max-w-screen-xl mx-auto">
        {/* Fanned cards — takes ~65% */}
        <div className="flex-[65] min-w-0">
          <CardPanel
            cardSides={cardSides}
            effectiveCosts={effectiveCosts}
            canActivate={canActivateCards}
            usedCardIds={usedCardIds}
            isHumanTurn={isHumanTurn}
            onActivateCard={onActivateCard}
          />
        </div>

        {/* Standard projects + pass — takes ~35% */}
        <div className="flex-[35] flex flex-col items-center gap-2 pb-2">
          <div data-tutorial="standard-projects">
            <StandardProjects
              canActivate={standardProjectCanActivate}
              alreadyUsedThisGen={alreadyUsedStdProject}
              isHumanTurn={isHumanTurn}
              onStandardProject={onStandardProject}
            />
          </div>
          <Button
            variant="outline"
            className="w-full max-w-[200px]"
            disabled={!isHumanTurn || hasPassed}
            onClick={onPass}
            onMouseEnter={onPassMouseEnter}
            data-tutorial="pass-button"
          >
            <Flag className="mr-2 h-4 w-4" />
            {hasPassed ? 'Passed' : 'Pass'}
          </Button>
        </div>
      </div>
    </div>
  );
}
