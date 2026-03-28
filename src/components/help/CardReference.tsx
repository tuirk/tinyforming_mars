'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { PROJECT_CARDS } from '@/engine/cards';
import { CardSideView } from '@/components/game/CardSideView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

export function CardReference() {
  const [search, setSearch] = useState('');

  const filtered = PROJECT_CARDS.filter((card) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      card.sideA.name.toLowerCase().includes(term) ||
      card.sideB.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cards by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No cards match &ldquo;{search}&rdquo;
            </p>
          )}

          {filtered.map((card) => (
            <div key={card.id} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Card {card.id}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <CardSideView cardSide={card.sideA} label="Side A" />
                <CardSideView cardSide={card.sideB} label="Side B" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
