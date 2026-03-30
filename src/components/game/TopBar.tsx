'use client';

import type { AIMode, Phase, PlayerState } from '@/engine/types';
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
  aiMode?: AIMode;
  onAIModeChange?: (mode: AIMode) => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  setup: 'Setup',
  research: 'Research',
  action: 'Action',
  income: 'Income',
  game_over: 'Game Over',
};

export function TopBar({ generation, phase, humanPlayer, isAIThinking, onHelpClick, aiMode, onAIModeChange }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/80 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Gen {generation}</span>
        <Badge variant="secondary" className="capitalize">
          {PHASE_LABELS[phase]}
        </Badge>
        {aiMode && onAIModeChange && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {(['random', 'heuristic', 'minimax'] as AIMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onAIModeChange(mode)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                  aiMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {mode === 'random' ? '🎲' : mode === 'heuristic' ? '🧠' : '♟️'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}
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
