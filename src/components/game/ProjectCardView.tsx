
'use client';

import type { CardSide, TagType } from '@/engine/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagBadge } from './GameIcons';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { describeCardEffect, describeCostReduction, describeParameterReduction } from '@/lib/cardDescriptions';

interface ProjectCardViewProps {
  cardSide: CardSide;
  effectiveCost: number;
  canActivate: boolean;
  isUsedThisGen: boolean;
  isHumanTurn: boolean;
  onActivate: () => void;
  disabledReason?: string;
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

export function ProjectCardView({
  cardSide,
  effectiveCost,
  canActivate,
  isUsedThisGen,
  isHumanTurn,
  onActivate,
  disabledReason,
}: ProjectCardViewProps) {
  const hasTagReqs = cardSide.tagRequirements.length > 0;
  const hasParamReqs = cardSide.parameterRequirements.length > 0;
  const hasRequirements = hasTagReqs || hasParamReqs;
  const hasCostReduction = cardSide.costReduction !== null;
  const hasParamReduction = cardSide.parameterReduction !== null;
  const isReducible = hasCostReduction;

  return (
    <Card
      className={cn(
        'w-full h-full flex flex-col relative overflow-hidden',
        cardColorStyles[cardSide.color] ?? cardColorStyles.grey,
        !canActivate && !isUsedThisGen && 'opacity-50',
      )}
    >
      {/* Used-this-generation overlay */}
      {isUsedThisGen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      )}

      {/* Header: name + cost */}
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="font-headline text-sm leading-tight">
            {cardSide.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-yellow-400 font-bold shrink-0 text-sm">
            {effectiveCost}
            {isReducible ? '*' : ''}
            <Coins className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Bottom tags (always 2) */}
        <div className="flex gap-1.5 items-center pt-1">
          {cardSide.tags.map((tag, i) => (
            <TooltipProvider key={`${tag}-${i}`}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="gap-1 text-xs px-1.5 py-0.5">
                    <TagBadge tag={tag} size={14} />
                    <span className="capitalize">{tag}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bottom tag: {tag}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    canActivate ? 'text-green-400' : 'text-muted-foreground',
                  )}
                >
                  <TagBadge tag={req.tag} size={14} />
                  <span>x{req.count}</span>
                  {canActivate && <CheckCircle className="w-2.5 h-2.5 text-green-500" />}
                </div>
              ))}
            </div>
          )}
          {hasParamReqs && (
            <div className="space-y-0.5">
              {cardSide.parameterRequirements.map((req) => (
                <p
                  key={req.type}
                  className={cn(
                    'text-xs',
                    canActivate ? 'text-green-400' : 'text-muted-foreground',
                  )}
                >
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

      {/* Activate button */}
      <CardFooter className="p-2 flex-col items-stretch gap-0">
        <Button
          size="sm"
          className="w-full"
          data-testid={`activate-${cardSide.cardId}${cardSide.side}`}
          disabled={!canActivate || isUsedThisGen || !isHumanTurn}
          onClick={onActivate}
        >
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Activate
        </Button>
        {(() => {
          const reason = isUsedThisGen
            ? 'Used this generation'
            : !isHumanTurn
              ? 'Not your turn'
              : !canActivate && disabledReason
                ? disabledReason
                : !canActivate
                  ? 'Requirements not met'
                  : null;
          return reason ? (
            <p className="text-xs text-red-400/70 mt-1 text-center">{reason}</p>
          ) : null;
        })()}
      </CardFooter>
    </Card>
  );
}
