'use client';

import type { Phase, PlayerState } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Coins, Flame, HelpCircle } from 'lucide-react';

interface TopBarProps {
  generation: number;
  phase: Phase;
  humanPlayer: PlayerState;
  isAIThinking: boolean;
  onHelpClick?: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  setup: 'Setup',
  research: 'Research',
  action: 'Action',
  income: 'Income',
  game_over: 'Game Over',
};

export function TopBar({ generation, phase, humanPlayer, isAIThinking, onHelpClick }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/80 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Gen {generation}</span>
        <Badge variant="secondary" className="capitalize">
          {PHASE_LABELS[phase]}
        </Badge>
        <div className="flex items-center gap-1">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              humanPlayer.color === 'white' ? 'bg-gray-200' : 'bg-gray-700',
            )}
          />
          <span className="text-xs text-muted-foreground capitalize">{humanPlayer.color}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-green-400" data-tutorial="credits">
          <Coins className="h-3.5 w-3.5" />
          <span>{humanPlayer.credits}</span>
        </div>
        <div className="flex items-center gap-1 text-red-400">
          <Flame className="h-3.5 w-3.5" />
          <span>{humanPlayer.heatTilesPersonal}</span>
        </div>
        {isAIThinking && (
          <span className="text-xs text-amber-400 animate-pulse">AI thinking...</span>
        )}
        <Button variant="ghost" size="sm" onClick={onHelpClick} title="Rules & Help">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
