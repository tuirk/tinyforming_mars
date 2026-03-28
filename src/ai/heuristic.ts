// Board state evaluation function
// TODO: Implement in Phase 1C task 1C.1

import type { GameState } from '../engine/types';

/**
 * Evaluate a game state from a player's perspective.
 * Returns a numeric score — higher is better for the given player.
 * Used by both standalone heuristic decisions and minimax search.
 *
 * See PRD Section 4.1 for scoring weights.
 */
export function evaluate(_state: GameState, _playerId: string): number {
  // TODO (1C.1): Implement scoring weights from PRD Section 4.1:
  // - Heat tile in personal supply: +1.0
  // - Greenery adjacent to only my city: +2.0
  // - Greenery adjacent to my city (shared): +1.0
  // - Greenery adjacent to opponent only: -1.0
  // - Heat on map adjacent to my city: -1.0
  // - Heat on map adjacent to opponent: +0.5
  // - Water adjacent to only my city: +1.5
  // - Water adjacent to both: +0.5
  // - Credits in hand: +0.3
  // - City on bonus hex: +0.5-1.5
  // - Resource token held: +0.8
  // - Available legal moves: +0.1 each
  return 0;
}
