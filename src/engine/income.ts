// Income phase calculation
// TODO: Implement in Phase 1A task 1A.11

import type { GameState } from './types';

/** Process the income phase for both players and return updated state */
export function processIncomePhase(_state: GameState): GameState {
  // TODO (1A.11): For each player (starting player first):
  // 1. +1 credit per city
  // 2. +1 credit per water tile adjacent to each city
  //    (water touching both cities counts for both)
  // 3. Add to unspent credits
  // 4. Cap at 5 credits (return excess to supply)
  // 5. Return all credits from project cards to supply
  // 6. Discard project cards
  throw new Error('Not implemented — Phase 1A task 1A.11');
}
