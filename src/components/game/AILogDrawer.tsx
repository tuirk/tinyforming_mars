'use client';

import { useMemo } from 'react';
import type { AILogEntry, AIMode, GameAction } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Brain, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AILogDrawerProps {
  entries: AILogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  aiMode?: AIMode;
  onAIModeChange?: (mode: AIMode) => void;
}

const MODE_LABELS: Record<AIMode, string> = {
  random: 'Rand',
  heuristic: 'Heur',
  minimax: 'Mini',
  gemini: 'Gem',
};

const CLOUD_DISABLED_MODES = new Set<AIMode>(['gemini']);

function describeAction(action: GameAction): string {
  switch (action.type) {
    case 'activate_project':
      return `Activate Card ${action.cardId}${action.side}`;
    case 'standard_project':
      return `Standard: ${action.projectId}`;
    case 'pass':
      return 'Pass';
  }
}

function modeBadge(source: AILogEntry['decisionSource']) {
  switch (source) {
    case 'random':
      return <Badge variant="secondary" className="bg-gray-600/50 text-gray-300 text-[10px]">Random</Badge>;
    case 'heuristic':
      return <Badge variant="secondary" className="bg-blue-600/50 text-blue-300 text-[10px]">Heuristic</Badge>;
    case 'minimax':
      return <Badge variant="secondary" className="bg-purple-600/50 text-purple-300 text-[10px]">Minimax</Badge>;
    case 'gemini':
      return <Badge variant="secondary" className="bg-amber-600/50 text-amber-300 text-[10px]">Gemini</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{source}</Badge>;
  }
}

export function AILogDrawer({ entries, isOpen, onToggle, aiMode, onAIModeChange }: AILogDrawerProps) {
  const groupedEntries = useMemo(() => {
    const groups = new Map<number, AILogEntry[]>();
    for (const entry of entries) {
      const list = groups.get(entry.generation) ?? [];
      list.push(entry);
      groups.set(entry.generation, list);
    }
    const sorted = Array.from(groups.entries()).sort(([a], [b]) => b - a);
    return sorted.map(([gen, items]) => ({
      generation: gen,
      entries: [...items].reverse(),
    }));
  }, [entries]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-2 px-1.5 py-3 border-l border-border bg-card/50 hover:bg-card transition-colors cursor-pointer"
        title="Open AI Log"
      >
        <Brain className="h-4 w-4 text-muted-foreground" />
        <span
          className="text-[10px] text-muted-foreground font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          AI Log
        </span>
        <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-headline text-sm font-semibold">AI Log</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* AI Mode Selector */}
      {aiMode && onAIModeChange && (
        <div className="px-2 py-1.5 border-b border-border">
          <TooltipProvider delayDuration={200}>
            <div className="flex bg-[#12121f] rounded-md p-0.5 gap-0.5">
              {(Object.keys(MODE_LABELS) as AIMode[]).map((m) => {
                const cloudDisabled = CLOUD_DISABLED_MODES.has(m);
                const selected = aiMode === m;

                const button = (
                  <button
                    type="button"
                    disabled={cloudDisabled}
                    onClick={() => {
                      if (!cloudDisabled) onAIModeChange(m);
                    }}
                    className={cn(
                      'w-full text-center py-1 text-[10px] font-body rounded transition-colors',
                      cloudDisabled && 'opacity-40 cursor-not-allowed text-[#5a5a7a]',
                      !cloudDisabled && selected && 'text-[#e0e0e0] bg-[#2a2a3e]',
                      !cloudDisabled && !selected && 'text-[#5a5a7a] hover:text-[#8a8aaa]',
                    )}
                  >
                    {MODE_LABELS[m]}
                  </button>
                );

                if (!cloudDisabled) {
                  return (
                    <div key={m} className="flex-1">
                      {button}
                    </div>
                  );
                }

                return (
                  <Tooltip key={m}>
                    <TooltipTrigger asChild>
                      <span className="flex-1">{button}</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Not enabled for cloud.
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {groupedEntries.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No AI decisions yet.
            </p>
          )}

          {groupedEntries.map(({ generation, entries: genEntries }) => (
            <div key={generation}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Generation {generation}
              </h3>
              <div className="space-y-2">
                {genEntries.map((entry, idx) => (
                  <div
                    key={`${generation}-${idx}`}
                    className="rounded-md border border-border bg-background/50 px-3 py-2 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {describeAction(entry.decision)}
                      </span>
                      {modeBadge(entry.decisionSource)}
                    </div>

                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                      {entry.thinkingTimeMs !== undefined && <span>⏱ {entry.thinkingTimeMs.toFixed(0)}ms</span>}
                      {entry.actionsEvaluated !== undefined && <span>🔍 {entry.actionsEvaluated} states</span>}
                      {entry.searchDepth !== undefined && <span>📊 depth {entry.searchDepth}</span>}
                    </div>

                    {entry.geminiReasoning && (
                      <p className="text-[10px] text-amber-300/80 mt-0.5 italic">
                        {entry.geminiReasoning}
                      </p>
                    )}

                    {entry.evaluatedActions && entry.evaluatedActions.length > 0 && (
                      <details className="mt-1">
                        <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                          Top {entry.evaluatedActions.length} considered
                        </summary>
                        <div className="pl-2 mt-1 space-y-0.5">
                          {entry.evaluatedActions.map((ea, i) => (
                            <div key={i} className="text-[10px] flex justify-between">
                              <span className={i === 0 ? 'text-green-400' : 'text-muted-foreground'}>
                                {i === 0 ? '→ ' : '  '}{describeAction(ea.action)}
                              </span>
                              <span className="font-mono text-muted-foreground">{ea.score.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {entry.minimaxAdjustment && entry.minimaxAdjustment.length > 0 && (
                      <div className="text-[10px] text-purple-300/70 mt-0.5">
                        Heuristic: <span className="font-mono">{entry.minimaxAdjustment[0].originalScore.toFixed(1)}</span> → Minimax: <span className="font-mono">{entry.minimaxAdjustment[0].adjustedScore.toFixed(1)}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-muted-foreground/60">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
