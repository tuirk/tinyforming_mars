'use client';

import type { CardSide, TagType } from '@/engine/types';
import { describeCardEffect, describeCostReduction, describeParameterReduction } from '@/lib/cardDescriptions';
import { TagIcon } from './icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardSideViewProps {
  cardSide: CardSide;
  label?: string; // e.g., "Your side" or "AI's side"
}

const cardColorStyles: Record<string, string> = {
  red: 'bg-red-950/30 border-red-700/40',
  green: 'bg-green-950/30 border-green-700/40',
  blue: 'bg-blue-950/30 border-blue-700/40',
  grey: 'bg-gray-800/30 border-gray-600/40',
};

const TAG_COLORS: Record<TagType, string> = {
  energy: 'text-yellow-400',
  production: 'text-orange-400',
  nature: 'text-green-400',
  science: 'text-blue-400',
  space: 'text-purple-400',
};

export function CardSideView({ cardSide, label }: CardSideViewProps) {
  const hasTagReqs = cardSide.tagRequirements.length > 0;
  const hasParamReqs = cardSide.parameterRequirements.length > 0;
  const hasRequirements = hasTagReqs || hasParamReqs;
  const hasCostReduction = cardSide.costReduction !== null;
  const hasParamReduction = cardSide.parameterReduction !== null;

  return (
    <Card
      className={cn(
        'w-full h-auto flex flex-col overflow-hidden',
        cardColorStyles[cardSide.color] ?? cardColorStyles.grey,
      )}
    >
      {/* Header: optional label, name + cost */}
      <CardHeader className="pb-2 pt-3 px-3">
        {label && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            {label}
          </p>
        )}
        <div className="flex justify-between items-start gap-2">
          <span className="font-headline text-sm leading-tight font-semibold">
            {cardSide.name}
          </span>
          <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0 text-sm">
            {cardSide.cost}
            {hasCostReduction ? '*' : ''}
            <Coins className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Tags (always 2) */}
        <div className="flex gap-1.5 items-center pt-1">
          {cardSide.tags.map((tag, i) => (
            <Badge key={`${tag}-${i}`} variant="secondary" className="gap-1 text-xs px-1.5 py-0.5">
              <TagIcon tag={tag} className={cn('w-3 h-3', TAG_COLORS[tag])} />
              <span className="capitalize">{tag}</span>
            </Badge>
          ))}
        </div>
      </CardHeader>

      {/* Requirements section */}
      {hasRequirements && (
        <div className="px-3 py-1.5 border-t border-border/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Requires
          </p>
          {hasTagReqs && (
            <div className="flex flex-wrap gap-1.5 mb-0.5">
              {cardSide.tagRequirements.map((req) => (
                <div
                  key={req.tag}
                  className="flex items-center gap-0.5 text-xs text-muted-foreground"
                >
                  <TagIcon tag={req.tag} className={cn('w-3 h-3', TAG_COLORS[req.tag])} />
                  <span>x{req.count}</span>
                </div>
              ))}
            </div>
          )}
          {hasParamReqs && (
            <div className="space-y-0.5">
              {cardSide.parameterRequirements.map((req) => (
                <p key={req.type} className="text-xs text-muted-foreground">
                  {req.count} {req.type.charAt(0).toUpperCase() + req.type.slice(1)} tiles
                </p>
              ))}
            </div>
          )}
          {hasParamReduction && cardSide.parameterReduction && (
            <p className="text-[10px] text-muted-foreground italic mt-0.5">
              {describeParameterReduction(cardSide.parameterReduction)}
            </p>
          )}
        </div>
      )}

      {/* Effect description */}
      <CardContent className="py-2 px-3 flex-grow border-t border-border/30">
        <p className="text-xs text-foreground/90">{describeCardEffect(cardSide.effect)}</p>
      </CardContent>

      {/* Cost reduction (if any) */}
      {hasCostReduction && cardSide.costReduction && (
        <div className="px-3 py-1 border-t border-border/30">
          <p className="text-[10px] italic text-amber-400/80">
            {describeCostReduction(cardSide.costReduction)}
          </p>
        </div>
      )}
    </Card>
  );
}
