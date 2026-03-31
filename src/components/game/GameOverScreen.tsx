'use client';
import type { GameState, ScoreBreakdown } from '@/engine/types';
import { calculateGameResult } from '@/engine/scoring';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameOverScreenProps {
  state: GameState;
  onPlayAgain: () => void;
  onBackToDashboard?: () => void;
}

const CATEGORY_LABELS: { key: keyof Omit<ScoreBreakdown, 'total'>; label: string }[] = [
  { key: 'cityPoints', label: 'City Points' },
  { key: 'greeneryPoints', label: 'Greenery' },
  { key: 'waterPoints', label: 'Water' },
  { key: 'heatPoints', label: 'Heat' },
];

const TIEBREAKER_LABELS: Record<string, string> = {
  cityPoints: 'City Points',
  greeneryPoints: 'Greenery',
  waterPoints: 'Water',
  heatPoints: 'Heat',
};

export function GameOverScreen({ state, onPlayAgain, onBackToDashboard }: GameOverScreenProps) {
  const result = calculateGameResult(state);

  const bannerText =
    result.winner === 'human'
      ? 'You Win!'
      : result.winner === 'ai'
        ? 'AI Wins!'
        : "It's a Tie!";

  const bannerColor =
    result.winner === 'human'
      ? 'text-yellow-400'
      : result.winner === 'ai'
        ? 'text-red-400'
        : 'text-muted-foreground';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center gap-2">
            {result.winner && (
              <Trophy
                className={cn(
                  'h-10 w-10',
                  result.winner === 'human' ? 'text-yellow-400' : 'text-red-400',
                )}
              />
            )}
            <h1 className={cn('text-3xl font-bold tracking-tight', bannerColor)}>
              {bannerText}
            </h1>
            {state.endCondition && (
              <p className="text-sm text-muted-foreground">
                Game ended: {formatEndCondition(state.endCondition)}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6">
          {/* Score Table */}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-center font-medium">You</th>
                  <th className="px-4 py-2 text-center font-medium">AI</th>
                  <th className="w-8 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {CATEGORY_LABELS.map(({ key, label }) => {
                  const humanVal = result.human[key];
                  const aiVal = result.ai[key];
                  const humanHigher = humanVal > aiVal;
                  const aiHigher = aiVal > humanVal;

                  return (
                    <tr key={key} className="border-b last:border-b-0">
                      <td className="px-4 py-2 font-medium">{label}</td>
                      <td
                        className={cn(
                          'px-4 py-2 text-center tabular-nums',
                          humanHigher && 'font-bold text-green-400',
                        )}
                      >
                        {humanVal}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-2 text-center tabular-nums',
                          aiHigher && 'font-bold text-red-400',
                        )}
                      >
                        {aiVal}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {(humanHigher || aiHigher) && (
                          <Star className="inline-block h-4 w-4 text-yellow-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="border-t-2 bg-muted/30">
                  <td className="px-4 py-2 font-bold">Total</td>
                  <td
                    className={cn(
                      'px-4 py-2 text-center font-bold tabular-nums',
                      result.human.total > result.ai.total && 'text-green-400',
                    )}
                  >
                    {result.human.total}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-2 text-center font-bold tabular-nums',
                      result.ai.total > result.human.total && 'text-red-400',
                    )}
                  >
                    {result.ai.total}
                  </td>
                  <td className="px-2 py-2" />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tiebreaker info */}
          {result.tiebreaker && (
            <p className="mt-3 text-center text-sm text-amber-400">
              Tiebreaker: {TIEBREAKER_LABELS[result.tiebreaker] ?? result.tiebreaker}
            </p>
          )}
        </CardContent>

        <CardFooter className="justify-center pb-6 gap-3">
          <Button size="lg" onClick={onPlayAgain} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
          {onBackToDashboard && (
            <Button size="lg" variant="outline" onClick={onBackToDashboard}>
              Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function formatEndCondition(condition: string): string {
  switch (condition) {
    case 'parameters':
      return '2 parameter types exhausted';
    case 'hexes_full':
      return 'All hexes occupied';
    case 'generation_12':
      return 'Generation 12 completed';
    default:
      return condition;
  }
}
