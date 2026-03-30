'use client';

import { useMemo } from 'react';
import type { AILogEntry, GameAction, Phase } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HelpPanel } from '@/components/help/HelpPanel';
import { Brain, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

interface AILogDrawerProps {
  entries: AILogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  defaultTab?: 'ai' | 'rules';
  currentPhase?: Phase;
}

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
    default:
      return <Badge variant="secondary" className="text-[10px]">{source}</Badge>;
  }
}

export function AILogDrawer({ entries, isOpen, onToggle, defaultTab, currentPhase }: AILogDrawerProps) {
  // Group entries by generation, most recent generation first
  const groupedEntries = useMemo(() => {
    const groups = new Map<number, AILogEntry[]>();
    for (const entry of entries) {
      const list = groups.get(entry.generation) ?? [];
      list.push(entry);
      groups.set(entry.generation, list);
    }
    // Sort by generation descending, entries within each group reversed (most recent first)
    const sorted = Array.from(groups.entries()).sort(([a], [b]) => b - a);
    return sorted.map(([gen, items]) => ({
      generation: gen,
      entries: [...items].reverse(),
    }));
  }, [entries]);

  // --- Collapsed state ---
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-2 px-2 py-4 border-l border-border bg-card/50 hover:bg-card transition-colors cursor-pointer"
        title="Open AI Log"
      >
        <Brain className="h-5 w-5 text-muted-foreground" />
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <span
          className="text-xs text-muted-foreground font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          AI / Rules
        </span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  // --- Expanded state ---
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-headline text-sm font-semibold">AI / Rules</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggle}
          title="Close panel"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue={defaultTab || 'ai'} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full shrink-0 mx-0 rounded-none">
          <TabsTrigger value="ai" className="flex-1">
            <Brain className="h-4 w-4 mr-1" /> AI Thinking
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1">
            <HelpCircle className="h-4 w-4 mr-1" /> Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {groupedEntries.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No AI decisions yet. The log will populate as the AI takes actions.
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

                        {entry.evaluatedActions && entry.evaluatedActions.length > 0 && (
                          <details className="mt-1">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                              Top {entry.evaluatedActions.length} actions considered
                            </summary>
                            <div className="pl-2 mt-1 space-y-0.5">
                              {entry.evaluatedActions.map((ea, i) => (
                                <div key={i} className="text-[10px] flex justify-between">
                                  <span className={i === 0 ? 'text-green-400' : 'text-muted-foreground'}>
                                    {i === 0 ? '→ ' : '  '}{describeAction(ea.action)}
                                  </span>
                                  <span className="text-muted-foreground">{ea.score.toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {entry.minimaxAdjustment && entry.minimaxAdjustment.length > 0 && (
                          <div className="text-[10px] text-purple-300/70 mt-0.5">
                            Heuristic: {entry.minimaxAdjustment[0].originalScore.toFixed(1)} → Minimax: {entry.minimaxAdjustment[0].adjustedScore.toFixed(1)}
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
        </TabsContent>

        <TabsContent value="rules" className="flex-1 min-h-0 mt-0">
          <HelpPanel currentPhase={currentPhase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
