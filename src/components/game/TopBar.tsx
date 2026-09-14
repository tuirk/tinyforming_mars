'use client';

import type { Phase, PlayerState } from '@/engine/types';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const MAX_GENERATION = 12;

interface TopBarProps {
  generation: number;
  phase: Phase;
  humanPlayer: PlayerState;
  isAIThinking: boolean;
  onBack?: () => void;
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
      <span className="font-headline text-[13px] font-semibold text-[#E8872D] mr-2">GEN</span>
      <svg width={MAX_GENERATION * 16 + 4} height={20} viewBox={`0 0 ${MAX_GENERATION * 16 + 4} 20`}>
        {Array.from({ length: MAX_GENERATION }, (_, i) => {
          const gen = i + 1;
          const cx = 8 + i * 16;
          const cy = 10;

          if (gen < generation) {
            return <circle key={gen} cx={cx} cy={cy} r={6} fill="#C4623A" stroke="#E8872D" strokeWidth={1} />;
          } else if (gen === generation) {
            return <circle key={gen} cx={cx} cy={cy} r={7} fill="#E8872D" stroke="#F0A850" strokeWidth={1.5} />;
          } else {
            return <circle key={gen} cx={cx} cy={cy} r={6} fill="#3A2218" stroke="#5A3A28" strokeWidth={1} />;
          }
        })}
      </svg>
    </div>
  );
}

export function TopBar({ generation, phase, humanPlayer, isAIThinking, onBack }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-card/80 backdrop-blur">
      {/* Left: back button + generation tracker + AI thinking */}
      <div className="flex items-center gap-2.5">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1" title="Back to Dashboard">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <span data-testid="generation" data-generation={generation} hidden />
        <GenerationTracker generation={generation} />
        {isAIThinking && (
          <span data-testid="ai-thinking" className="text-xs text-amber-400 animate-pulse font-body">AI thinking...</span>
        )}
      </div>

      {/* Right: player color + phase badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              humanPlayer.color === 'white' ? 'bg-gray-200' : 'bg-gray-700',
            )}
          />
          <span className="text-xs text-muted-foreground capitalize">{humanPlayer.color}</span>
        </div>
        <span
          data-testid="phase-badge"
          data-phase={phase}
          className="font-headline text-[10px] font-medium text-[#e0e0e0] bg-[#2a2a3e] rounded-full px-2.5 py-0.5"
        >
          {PHASE_LABELS[phase]}
        </span>
      </div>
    </div>
  );
}
