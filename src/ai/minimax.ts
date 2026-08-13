// ============================================================
// TINYforming Mars — Minimax with Alpha-Beta Pruning (Task 1D.1)
// ============================================================

import type { GameState, GameAction } from '../engine/types';
import { getLegalActions, getOpponentId, getPlayerById } from '../engine/rules';
import { executeAction } from '../engine/actions';
import { evaluate } from './heuristic';

// ============================================================
// Public types
// ============================================================

export interface MinimaxResult {
  bestAction: GameAction;
  score: number;
  nodesEvaluated: number;
  depth: number;
}

// ============================================================
// Internal recursive minimax with alpha-beta pruning
// ============================================================

function minimax(
  state: GameState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayerId: string,
  humanPlayerId: string,
  counter: { nodes: number },
): number {
  counter.nodes++;

  const currentPlayerId = isMaximizing ? aiPlayerId : humanPlayerId;
  const current = getPlayerById(state, currentPlayerId);
  const otherId = currentPlayerId === aiPlayerId ? humanPlayerId : aiPlayerId;
  const other = getPlayerById(state, otherId);

  if (depth === 0) {
    return evaluate(state, aiPlayerId) - evaluate(state, humanPlayerId);
  }

  if (current.hasPassed) {
    if (other.hasPassed) {
      return evaluate(state, aiPlayerId) - evaluate(state, humanPlayerId);
    }
    return minimax(
      state,
      depth,
      !isMaximizing,
      alpha,
      beta,
      aiPlayerId,
      humanPlayerId,
      counter,
    );
  }

  const actions = getLegalActions(state, currentPlayerId);

  if (actions.length === 0) {
    if (!other.hasPassed) {
      return minimax(
        state,
        depth,
        !isMaximizing,
        alpha,
        beta,
        aiPlayerId,
        humanPlayerId,
        counter,
      );
    }
    return evaluate(state, aiPlayerId) - evaluate(state, humanPlayerId);
  }

  // Move ordering: sort actions by quick heuristic eval for better pruning
  const scored = actions.map((action) => {
    const newState = executeAction(state, action, currentPlayerId);
    const quickScore =
      evaluate(newState, aiPlayerId) - evaluate(newState, humanPlayerId);
    return { action, newState, quickScore };
  });
  scored.sort((a, b) =>
    isMaximizing ? b.quickScore - a.quickScore : a.quickScore - b.quickScore,
  );

  if (isMaximizing) {
    let maxEval = -Infinity;
    let a = alpha;
    for (const { newState } of scored) {
      const eval_ = minimax(
        newState,
        depth - 1,
        false,
        a,
        beta,
        aiPlayerId,
        humanPlayerId,
        counter,
      );
      maxEval = Math.max(maxEval, eval_);
      a = Math.max(a, eval_);
      if (beta <= a) break; // beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    let b = beta;
    for (const { newState } of scored) {
      const eval_ = minimax(
        newState,
        depth - 1,
        true,
        alpha,
        b,
        aiPlayerId,
        humanPlayerId,
        counter,
      );
      minEval = Math.min(minEval, eval_);
      b = Math.min(b, eval_);
      if (b <= alpha) break; // alpha cutoff
    }
    return minEval;
  }
}

// ============================================================
// Public entry point
// ============================================================

/**
 * Minimax search with alpha-beta pruning.
 * See PRD Section 4.2 for algorithm specification.
 *
 * @param state    - Current game state
 * @param maxDepth - Search depth (default 2)
 * @param aiPlayerId - The AI player's ID
 * @returns Best action, its evaluated score, nodes evaluated, and depth
 */
export function minimaxSearch(
  state: GameState,
  maxDepth: number = 2,
  aiPlayerId: string,
): MinimaxResult {
  const humanPlayerId = getOpponentId(aiPlayerId);
  const counter = { nodes: 0 };

  try {
    const aiPlayer = getPlayerById(state, aiPlayerId);
    const humanPlayer = getPlayerById(state, humanPlayerId);
    const actions = getLegalActions(state, aiPlayerId);

    if (aiPlayer.hasPassed && !humanPlayer.hasPassed) {
      const score = minimax(
        state,
        maxDepth,
        false,
        -Infinity,
        Infinity,
        aiPlayerId,
        humanPlayerId,
        counter,
      );
      return {
        bestAction: { type: 'pass' },
        score,
        nodesEvaluated: counter.nodes,
        depth: maxDepth,
      };
    }

    if (actions.length === 0) {
      return {
        bestAction: { type: 'pass' },
        score: evaluate(state, aiPlayerId) - evaluate(state, humanPlayerId),
        nodesEvaluated: 1,
        depth: maxDepth,
      };
    }

    // Quick heuristic evaluation for move ordering at root level
    const scoredActions = actions.map((action) => {
      const newState = executeAction(state, action, aiPlayerId);
      const quickScore =
        evaluate(newState, aiPlayerId) - evaluate(newState, humanPlayerId);
      return { action, newState, quickScore };
    });
    scoredActions.sort((a, b) => b.quickScore - a.quickScore);

    let bestAction = scoredActions[0].action;
    let bestScore = -Infinity;

    let alpha = -Infinity;
    const beta = Infinity;

    for (const { action, newState } of scoredActions) {
      const score = minimax(
        newState,
        maxDepth - 1,
        false, // Next move is the human's (minimizing)
        alpha,
        beta,
        aiPlayerId,
        humanPlayerId,
        counter,
      );

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
      alpha = Math.max(alpha, score);
      // No pruning at root — we always want the best action
    }

    return {
      bestAction,
      score: bestScore,
      nodesEvaluated: counter.nodes,
      depth: maxDepth,
    };
  } catch (_error) {
    // Fallback: use heuristic-only evaluation (no search)
    const actions = getLegalActions(state, aiPlayerId);

    if (actions.length === 0) {
      return {
        bestAction: { type: 'pass' },
        score: 0,
        nodesEvaluated: 0,
        depth: 0,
      };
    }

    let bestAction = actions[0];
    let bestScore = -Infinity;

    for (const action of actions) {
      const newState = executeAction(state, action, aiPlayerId);
      const score =
        evaluate(newState, aiPlayerId) - evaluate(newState, humanPlayerId);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return {
      bestAction,
      score: bestScore,
      nodesEvaluated: actions.length,
      depth: 0,
    };
  }
}

// Backward-compatible alias used by aiController
export { minimaxSearch as minimax };
