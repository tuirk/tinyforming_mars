'use client';

import type { Phase } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { HelpPanel } from '@/components/help/HelpPanel';
import { HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface RulesDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPhase?: Phase;
}

export function RulesDrawer({ isOpen, onToggle, currentPhase }: RulesDrawerProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex flex-col items-center gap-2 px-1.5 py-3 border-l border-border bg-card/50 hover:bg-card transition-colors cursor-pointer"
        title="Open Rules"
      >
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <span
          className="text-[10px] text-muted-foreground font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Rules
        </span>
        <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="font-headline text-sm font-semibold">Rules</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <HelpPanel currentPhase={currentPhase} />
      </div>
    </div>
  );
}
