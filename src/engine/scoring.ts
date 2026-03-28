// End-game scoring with tiebreaker logic
// TODO: Implement in Phase 1A tasks 1A.12, 1A.13

import type { EndCondition, GameResult, GameState, ScoreBreakdown } from './types';

/** Check if the game should end. Returns the condition or null. */
export function checkEndCondition(_state: GameState): EndCondition | null {
  // TODO (1A.12): Check:
  // (a) 2+ of 3 parameter tile types exhausted from supply
  // (b) No unoccupied hexes remaining on map
  // (c) Generation counter reaches 12
  throw new Error('Not implemented — Phase 1A task 1A.12');
}

/** Calculate score breakdown for a single player */
export function calculatePlayerScore(
  _state: GameState,
  _playerId: string,
): ScoreBreakdown {
  // TODO (1A.13): Calculate:
  // - cityPoints: per city, +1 per adjacent greenery, -1 per adjacent heat on map
  // - greeneryPoints: +1 per greenery adjacent to only this player's cities
  // - waterPoints: +1 per water adjacent to only this player's cities
  // - heatPoints: +1 per heat tile in personal supply
  throw new Error('Not implemented — Phase 1A task 1A.13');
}

/** Calculate final game result with tiebreaker */
export function calculateGameResult(_state: GameState): GameResult {
  // TODO (1A.13): Sum scores, apply tiebreaker sequence:
  // 1. City points → 2. Greenery points → 3. Water points → 4. Heat points
  throw new Error('Not implemented — Phase 1A task 1A.13');
}
