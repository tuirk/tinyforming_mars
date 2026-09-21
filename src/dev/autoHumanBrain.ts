/**
 * Heuristic picker for the HUMAN side, used only by the demo recorder.
 *
 * Why this exists: every entry point in `@/ai/aiController` is hardcoded to the
 * `'ai'` player — `getLegalActions(state, 'ai')`, `minimaxSearch(state, 2, 'ai')`,
 * `evaluate(s, 'ai') - evaluate(s, 'human')`. Driving the human side with those
 * would mean threading a playerId through the whole controller and re-testing the
 * AI. The layer underneath is already player-generic, so we mirror the three
 * `pickBest*` functions here with the perspective flipped.
 *
 * This is scoring only — it never mutates real game state. The caller (the
 * Playwright driver) clicks the returned action through the actual UI, so every
 * rule check still runs in the normal code path.
 */

import type {
  CardId,
  CardSideId,
  GameAction,
  GameState,
  HexId,
} from '@/engine/types';
import { getLegalActions, getValidHexesForPlacement } from '@/engine/rules';
import { executeAction } from '@/engine/actions';
import { draftCard } from '@/engine/gameState';
import { evaluate } from '@/ai/heuristic';
import { rolloutUnpassedOpponent } from '@/ai/passRollout';

/** Positive = good for the human. Mirrors aiController's gap scoring. */
function gap(state: GameState): number {
  return evaluate(state, 'human') - evaluate(state, 'ai');
}

/**
 * Score a candidate action, mirroring `scoreAfterAiAction` in aiController.
 *
 * The rollout is the important part. Evaluating a pass on the resulting state
 * alone makes passing look nearly free — it banks credits and the position is
 * unchanged. The AI avoids that trap by simulating the opponent continuing to
 * play after it passes, which is what actually makes passing expensive. Without
 * the same treatment the human passed after roughly one action per generation
 * and handed the AI a long run of unopposed turns.
 */
function scoreAfterHumanAction(state: GameState, action: GameAction): number {
  let next = executeAction(state, action, 'human');
  if (action.type === 'pass' && !next.players.ai.hasPassed) {
    next = rolloutUnpassedOpponent(next, 'ai', 'human');
  }
  return gap(next);
}

/**
 * Best action for the human this turn.
 *
 * Argmax over legal actions, matching `pickBestAction`, with passing scored
 * through an opponent rollout exactly as the AI scores its own pass. Ties break
 * towards doing something, so the human never folds while a move is free.
 */
export function pickHumanAction(state: GameState): GameAction {
  const actions = getLegalActions(state, 'human');
  if (actions.length === 0) return { type: 'pass' };

  let best: GameAction | null = null;
  let bestScore = -Infinity;

  for (const action of actions) {
    let score: number;
    try {
      score = scoreAfterHumanAction(state, action);
    } catch {
      continue; // unreachable in theory; skip rather than abort the game
    }
    const isBetter =
      score > bestScore ||
      // tie-break: prefer acting over passing
      (score === bestScore && best?.type === 'pass' && action.type !== 'pass');
    if (isBetter) {
      bestScore = score;
      best = action;
    }
  }

  return best ?? { type: 'pass' };
}

/**
 * Which side of `cardId` the human should keep.
 *
 * `draftCard`'s third argument is always the HUMAN-facing side regardless of who
 * is drafting, so this returns exactly what `handleHumanDraft` expects.
 */
export function pickHumanDraftSide(state: GameState, cardId: CardId): CardSideId {
  try {
    return gap(draftCard(state, cardId, 'A')) >= gap(draftCard(state, cardId, 'B'))
      ? 'A'
      : 'B';
  } catch {
    return 'A';
  }
}

/** Best hex for the human's setup city. Mirrors `pickBestCityHex`. */
export function pickHumanCityHex(state: GameState): HexId | null {
  const valid = getValidHexesForPlacement(state, 'city', 'human');
  if (valid.length === 0) return null;

  let bestHex = valid[0];
  let bestScore = -Infinity;

  for (const hexId of valid) {
    const next = structuredClone(state);
    const hex = next.board.find((h) => h.id === hexId);
    if (!hex) continue;
    hex.city = { playerId: 'human' };
    next.players.human.cities.push(hexId);

    const score = gap(next);
    if (score > bestScore) {
      bestScore = score;
      bestHex = hexId;
    }
  }

  return bestHex;
}
