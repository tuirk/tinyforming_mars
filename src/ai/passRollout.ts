import type { GameState, GameAction } from '../engine/types';
import { getLegalActions } from '../engine/rules';
import { executeAction } from '../engine/actions';
import { evaluate } from './heuristic';

/**
 * After the passer has passed, keep taking the unpassed opponent's
 * 1-ply-best non-pass action until they would rather pass (or 8 moves).
 * Does not call pickBestAction (no recursion).
 */
export function rolloutUnpassedOpponent(
  state: GameState,
  actorId: 'human' | 'ai',
  untilPasserId: 'human' | 'ai',
  maxActions = 8,
): GameState {
  let s = state;
  for (let i = 0; i < maxActions; i++) {
    if (s.players[actorId].hasPassed) break;
    const legal = getLegalActions(s, actorId).filter((a) => a.type !== 'pass');
    if (legal.length === 0) break;
    const passScore = evaluate(s, actorId) - evaluate(s, untilPasserId);
    let best: GameAction | null = null;
    let bestScore = passScore;
    for (const action of legal) {
      const ns = executeAction(s, action, actorId);
      const score = evaluate(ns, actorId) - evaluate(ns, untilPasserId);
      if (score > bestScore) {
        bestScore = score;
        best = action;
      }
    }
    if (best === null) break;
    s = executeAction(s, best, actorId);
  }
  return s;
}
