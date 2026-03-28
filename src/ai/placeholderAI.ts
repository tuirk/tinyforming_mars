import type { GameState, GameAction, CardSideId, HexId } from '@/engine/types';
import { getLegalActions, getValidHexesForPlacement } from '@/engine/rules';

/**
 * Pick a random legal action during the action phase.
 * Returns a random action from all legal actions available to the AI.
 */
export function pickRandomAction(state: GameState): GameAction {
  const actions = getLegalActions(state, 'ai');
  if (actions.length === 0) {
    return { type: 'pass' };
  }
  return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * Pick a random card orientation during the research phase draft.
 * Returns the side that should face the HUMAN player.
 * (Since AI picks randomly, it just flips a coin.)
 */
export function pickRandomDraftSide(): CardSideId {
  // AI randomly picks which side faces the human
  return Math.random() < 0.5 ? 'A' : 'B';
}

/**
 * Pick a random valid hex for city placement during setup.
 * Returns a random hex ID from all valid city placement hexes.
 */
export function pickRandomCityHex(state: GameState): HexId | null {
  const validHexes = getValidHexesForPlacement(state, 'city', 'ai');
  if (validHexes.length === 0) return null;
  return validHexes[Math.floor(Math.random() * validHexes.length)];
}
