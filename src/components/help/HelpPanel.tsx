'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { HELP_SECTIONS } from './HelpContent';
import { CardReference } from './CardReference';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import type { Phase } from '@/engine/types';
import { cn } from '@/lib/utils';

interface HelpPanelProps {
  currentPhase?: Phase;
}

/** Maps the active game phase to the most relevant help section ID */
const PHASE_SECTION_MAP: Partial<Record<Phase, string>> = {
  research: 'project_cards',
  action: 'game_flow',
  income: 'income',
  game_over: 'end_game',
};

const PHASE_LABELS: Partial<Record<Phase, string>> = {
  setup: 'Setup',
  research: 'Research',
  action: 'Action',
  income: 'Income',
  game_over: 'Game Over',
};

export function HelpPanel({ currentPhase }: HelpPanelProps) {
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const highlightedSection = currentPhase
    ? PHASE_SECTION_MAP[currentPhase]
    : undefined;

  const filteredSections = HELP_SECTIONS.filter((section) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      section.title.toLowerCase().includes(term) ||
      section.content.toLowerCase().includes(term) ||
      section.keywords.some((kw) => kw.toLowerCase().includes(term))
    );
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isSectionOpen = (id: string) => {
    // If the user explicitly toggled, respect that
    if (id in openSections) return openSections[id];
    // Auto-open the highlighted section when there is no search query
    if (!search.trim() && id === highlightedSection) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Phase indicator */}
      {currentPhase && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current phase:</span>
          <Badge variant="secondary" className="text-xs">
            {PHASE_LABELS[currentPhase] ?? currentPhase}
          </Badge>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Collapsible sections */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 pr-2">
          {filteredSections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No matching rules found.
            </p>
          )}

          {filteredSections.map((section) => {
            const isHighlighted = section.id === highlightedSection;
            const isOpen = isSectionOpen(section.id);
            const isCardRef = section.id === 'card_reference';

            return (
              <Collapsible
                key={section.id}
                open={isOpen}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50',
                    isHighlighted && 'bg-accent/30 ring-1 ring-primary/40',
                  )}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-left flex-1">{section.title}</span>
                  {isHighlighted && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Active
                    </Badge>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent className="px-3 pb-3 pt-1">
                  {isCardRef ? (
                    <CardReference />
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
