// Minimax search with alpha-beta pruning
// TODO: Implement in Phase 1D task 1D.1

import type { GameAction, GameState } from '../engine/types';

export interface MinimaxResult {
  bestAction: GameAction;
  score: number;
}

/**
 * Minimax search with alpha-beta pruning.
 * See PRD Section 4.2 for algorithm specification.
 *
 * @param state - Current game state
 * @param depth - Search depth (start at 2, increase to 3 if performance allows)
 * @param aiPlayerId - The AI player's ID
 * @returns Best action and its evaluated score
 */
export function minimax(
  _state: GameState,
  _depth: number,
  _aiPlayerId: string,
): MinimaxResult {
  // TODO (1D.1): Implement minimax with alpha-beta pruning
  // Move ordering optimization (1D.3): sort by heuristic score first
  throw new Error('Not implemented — Phase 1D task 1D.1');
}
