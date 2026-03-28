// Action execution — project cards and standard projects
// TODO: Implement in Phase 1A tasks 1A.8, 1A.9, 1A.10

import type { GameAction, GameState } from './types';

/** Execute a validated game action and return the new state */
export function executeAction(_state: GameState, _action: GameAction): GameState {
  // TODO (1A.8, 1A.9): Handle all action types:
  // - activate_project: deduct credits, spend tokens, execute card effect
  // - standard_project: execute one of the 5 standard projects
  // - pass: mark player as passed
  throw new Error('Not implemented — Phase 1A tasks 1A.8/1A.9');
}
