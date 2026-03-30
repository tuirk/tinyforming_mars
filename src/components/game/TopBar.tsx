'use client';

import type { AIMode, Phase, PlayerState } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

const MAX_GENERATION = 12;

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

function GenerationTracker({ generation }: { generation: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1">Gen</span>
      {Array.from({ length: MAX_GENERATION }, (_, i) => {
        const genNum = i + 1;
        const isFilled = genNum <= generation;
        const isCurrent = genNum === generation;
        return (
          <div
            key={genNum}
            className={cn(
              'w-3 h-3 rounded-full border transition-all',
              isFilled
                ? 'bg-primary border-primary'
                : 'bg-transparent border-muted-foreground/40',
              isCurrent && 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background',
            )}
            title={`Generation ${genNum}`}
          />
        );
      })}
    </div>
  );
}

export function TopBar({ generation, phase, humanPlayer, isAIThinking, onHelpClick, aiMode, onAIModeChange }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/80 backdrop-blur">
      {/* Left: generation tracker + phase + player color */}
      <div className="flex items-center gap-3">
        <GenerationTracker generation={generation} />
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
        {isAIThinking && (
          <span className="text-xs text-amber-400 animate-pulse">AI thinking...</span>
        )}
      </div>

      {/* Right: AI mode selector + help */}
      <div className="flex items-center gap-3">
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
        <Button variant="ghost" size="sm" onClick={onHelpClick} title="Rules & Help">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
