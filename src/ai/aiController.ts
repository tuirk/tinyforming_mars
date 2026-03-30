// ============================================================
// TINYforming Mars — AI Controller (Tasks 1C.3, 1C.4, 1C.5)
// Orchestrates heuristic evaluation to pick optimal actions,
// draft orientations, and setup city placements.
// ============================================================

import type { GameState, GameAction, CardId, CardSideId, AIMode } from '../engine/types';
import { getLegalActions, getValidHexesForPlacement } from '../engine/rules';
import { executeAction } from '../engine/actions';
import { getCard } from '../engine/cards';
import { draftCard } from '../engine/gameState';
import { evaluate } from './heuristic';
import { pickRandomAction, pickRandomDraftSide, pickRandomCityHex } from './placeholderAI';
import { minimaxSearch } from './minimax';

// ============================================================
// Scored action interface
// ============================================================

export interface ScoredAction {
  action: GameAction;
  score: number;
}

// ============================================================
// Enriched result interface for mode-dispatching functions
// ============================================================

export interface EnrichedResult {
  action: GameAction;
  score: number;
  decisionSource: AIMode;
  thinkingTimeMs: number;
  actionsEvaluated: number;
  searchDepth?: number;
  topActions?: { action: GameAction; score: number }[]; // top 5 scored
  minimaxAdjustments?: { action: GameAction; heuristicScore: number; minimaxScore: number }[];
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

// ============================================================
// Helper: getAllScoredActions
// Returns all legal actions with heuristic scores, sorted descending.
// ============================================================

export function getAllScoredActions(state: GameState): ScoredAction[] {
  const actions = getLegalActions(state, 'ai');
  const scored: ScoredAction[] = actions.map((action) => {
    const newState = executeAction(state, action, 'ai');
    const score = evaluate(newState, 'ai') - evaluate(newState, 'human');
    return { action, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ============================================================
// Mode-dispatching: pickActionByMode
// ============================================================

export function pickActionByMode(state: GameState, mode: AIMode): EnrichedResult {
  const startTime = performance.now();

  try {
    switch (mode) {
      case 'random': {
        const action = pickRandomAction(state);
        return {
          action,
          score: 0,
          decisionSource: 'random',
          thinkingTimeMs: performance.now() - startTime,
          actionsEvaluated: 0,
        };
      }
      case 'heuristic': {
        const result = pickBestAction(state);
        const allScored = getAllScoredActions(state);
        return {
          action: result.action,
          score: result.score,
          decisionSource: 'heuristic',
          thinkingTimeMs: performance.now() - startTime,
          actionsEvaluated: allScored.length,
          topActions: allScored.slice(0, 5),
        };
      }
      case 'minimax': {
        const mmResult = minimaxSearch(state, 2, 'ai');
        const heuristicResult = pickBestAction(state);
        return {
          action: mmResult.bestAction,
          score: mmResult.score,
          decisionSource: 'minimax',
          thinkingTimeMs: performance.now() - startTime,
          actionsEvaluated: mmResult.nodesEvaluated,
          searchDepth: mmResult.depth,
          minimaxAdjustments: [{
            action: mmResult.bestAction,
            heuristicScore: heuristicResult.score,
            minimaxScore: mmResult.score,
          }],
        };
      }
    }
  } catch (err) {
    console.error('[AI] pickActionByMode failed, falling back to random:', err);
    const action = pickRandomAction(state);
    return {
      action,
      score: 0,
      decisionSource: 'random',
      thinkingTimeMs: performance.now() - startTime,
      actionsEvaluated: 0,
    };
  }
}

// ============================================================
// Mode-dispatching: pickDraftByMode
// ============================================================

export function pickDraftByMode(
  state: GameState,
  cardId: CardId,
  mode: AIMode,
): { side: CardSideId; score: number; decisionSource: AIMode; thinkingTimeMs: number } {
  const startTime = performance.now();

  try {
    switch (mode) {
      case 'random': {
        const side = pickRandomDraftSide();
        return {
          side,
          score: 0,
          decisionSource: 'random',
          thinkingTimeMs: performance.now() - startTime,
        };
      }
      case 'heuristic':
      case 'minimax': {
        // Minimax draft would be too expensive — use heuristic for drafts
        const result = pickBestDraftSide(state, cardId);
        return {
          side: result.side,
          score: result.score,
          decisionSource: mode,
          thinkingTimeMs: performance.now() - startTime,
        };
      }
    }
  } catch (err) {
    console.error('[AI] pickDraftByMode failed, falling back to random:', err);
    return {
      side: pickRandomDraftSide(),
      score: 0,
      decisionSource: 'random',
      thinkingTimeMs: performance.now() - startTime,
    };
  }
}

// ============================================================
// Mode-dispatching: pickCityByMode
// ============================================================

export function pickCityByMode(state: GameState, mode: AIMode): number | null {
  try {
    switch (mode) {
      case 'random':
        return pickRandomCityHex(state);
      case 'heuristic':
      case 'minimax':
        return pickBestCityHex(state);
    }
  } catch (err) {
    console.error('[AI] pickCityByMode failed, falling back to random:', err);
    return pickRandomCityHex(state);
  }
}
