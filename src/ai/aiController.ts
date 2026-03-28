// ============================================================
// TINYforming Mars — AI Controller (Tasks 1C.3, 1C.4, 1C.5)
// Orchestrates heuristic evaluation to pick optimal actions,
// draft orientations, and setup city placements.
// ============================================================

import type { GameState, GameAction, CardId, CardSideId } from '../engine/types';
import { getLegalActions, getValidHexesForPlacement } from '../engine/rules';
import { executeAction } from '../engine/actions';
import { getCard } from '../engine/cards';
import { draftCard } from '../engine/gameState';
import { evaluate } from './heuristic';
import { pickRandomAction, pickRandomDraftSide, pickRandomCityHex } from './placeholderAI';

// ============================================================
// Scored action interface
// ============================================================

export interface ScoredAction {
  action: GameAction;
  score: number;
}

// ============================================================
// Task 1C.3: pickBestAction
// ============================================================

/**
 * Evaluate every legal action for the AI and return the one
 * with the highest heuristic score.
 *
 * executeAction already clones internally, so no need for
 * structuredClone before calling it.
 */
export function pickBestAction(state: GameState): ScoredAction {
  try {
    const actions = getLegalActions(state, 'ai');

    if (actions.length === 0) {
      return { action: { type: 'pass' }, score: 0 };
    }

    const scored: ScoredAction[] = actions.map((action) => {
      const newState = executeAction(state, action, 'ai');
      const score = evaluate(newState, 'ai') - evaluate(newState, 'human');
      return { action, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored[0];
  } catch (err) {
    console.error('[AI] pickBestAction failed, falling back to random:', err);
    return { action: pickRandomAction(state), score: 0 };
  }
}

// ============================================================
// Task 1C.4: pickBestDraftSide
// ============================================================

/**
 * Determine which card orientation gives the AI the biggest
 * advantage during the research/draft phase.
 *
 * For each orientation (Side A or B facing human):
 *   - Apply draftCard to get the resulting state
 *   - Evaluate from both perspectives
 *   - Maximize the gap: aiScore − humanScore
 *
 * Returns the humanFacingSide choice and its gap score.
 */
export function pickBestDraftSide(
  state: GameState,
  cardId: CardId,
): { side: CardSideId; score: number } {
  try {
    // Orientation 1: Side A faces human → AI gets Side B
    const stateA = draftCard(state, cardId, 'A');
    const aiScoreA = evaluate(stateA, 'ai');
    const humanScoreA = evaluate(stateA, 'human');
    const gapA = aiScoreA - humanScoreA;

    // Orientation 2: Side B faces human → AI gets Side A
    const stateB = draftCard(state, cardId, 'B');
    const aiScoreB = evaluate(stateB, 'ai');
    const humanScoreB = evaluate(stateB, 'human');
    const gapB = aiScoreB - humanScoreB;

    if (gapA >= gapB) {
      return { side: 'A', score: gapA };
    }
    return { side: 'B', score: gapB };
  } catch (err) {
    console.error('[AI] pickBestDraftSide failed, falling back to random:', err);
    return { side: pickRandomDraftSide(), score: 0 };
  }
}

// ============================================================
// Task 1C.5: pickBestCityHex
// ============================================================

/**
 * Choose the best hex for AI setup city placement (before the
 * action phase begins).
 *
 * pickBestAction already handles tile/city placement during the
 * action phase via getLegalActions. This function is specifically
 * for SETUP city placement where we simulate directly.
 *
 * Returns the hex ID with the highest evaluated score, or null
 * if no valid placement exists.
 */
export function pickBestCityHex(state: GameState): number | null {
  try {
    const validHexes = getValidHexesForPlacement(state, 'city', 'ai');

    if (validHexes.length === 0) return null;

    let bestHex = validHexes[0];
    let bestScore = -Infinity;

    for (const hexId of validHexes) {
      // Simulate placing city on a cloned state
      const newState = structuredClone(state);
      const hex = newState.board.find((h) => h.id === hexId)!;
      hex.city = { playerId: 'ai' };
      newState.players.ai.cities.push(hexId);

      const score = evaluate(newState, 'ai');
      if (score > bestScore) {
        bestScore = score;
        bestHex = hexId;
      }
    }

    return bestHex;
  } catch (err) {
    console.error('[AI] pickBestCityHex failed, falling back to random:', err);
    return pickRandomCityHex(state);
  }
}
