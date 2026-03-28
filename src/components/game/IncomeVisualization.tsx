'use client';
import { useState, useEffect, useRef } from 'react';
import type { GameState } from '@/engine/types';
import { computeIncomeBreakdown, type IncomeStep } from '@/engine/incomeBreakdown';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Coins, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncomeVisualizationProps {
  state: GameState;
  onComplete: () => void;
}

export function IncomeVisualization({ state, onComplete }: IncomeVisualizationProps) {
  const stepsRef = useRef<IncomeStep[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Compute steps once on mount
  if (stepsRef.current.length === 0) {
    stepsRef.current = computeIncomeBreakdown(state);
  }
  const steps = stepsRef.current;

  useEffect(() => {
    if (steps.length === 0) {
      // No income steps — just call onComplete after a short delay
      const timer = setTimeout(() => onCompleteRef.current(), 500);
      return () => clearTimeout(timer);
    }

    if (visibleCount < steps.length) {
      const timer = setTimeout(() => setVisibleCount(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }

    // All steps shown — wait 1s then complete
    const timer = setTimeout(() => onCompleteRef.current(), 1000);
    return () => clearTimeout(timer);
  }, [visibleCount, steps.length]);

  function getStepStyle(step: IncomeStep) {
    if (step.creditChange > 0) return 'text-green-400';
    if (step.creditChange < 0) return 'text-amber-400';
    return 'text-muted-foreground';
  }

  function getStepIcon(step: IncomeStep) {
    if (step.creditChange !== 0) {
      return <CheckCircle2 className="h-4 w-4 shrink-0" />;
    }
    return <ArrowRight className="h-4 w-4 shrink-0" />;
  }

  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span>Income Phase &mdash; Generation {state.generation}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground">No income to process.</p>
            )}
            {steps.slice(0, visibleCount).map((step, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 text-sm transition-opacity duration-300',
                  getStepStyle(step),
                )}
              >
                {getStepIcon(step)}
                <span>{step.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
