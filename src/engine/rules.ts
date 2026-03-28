// Legal move validation and requirement checking
// TODO: Implement in Phase 1A tasks 1A.5, 1A.6, 1A.7

import type { GameAction, GameState, CardSide, PlayerState, TagType } from './types';

/** Count a player's available tags from all sources */
export function countPlayerTags(_player: PlayerState, _state: GameState): Record<TagType, number> {
  // TODO (1A.5): Count tags from:
  // (a) Bottom tags on all 3 project card sides facing them
  // (b) Bonus hex tags from cities on bonus hexes
  // (c) Held resource tokens (spendable as matching tags)
  throw new Error('Not implemented — Phase 1A task 1A.5');
}

/** Check if a player meets all requirements for a card or standard project */
export function checkRequirements(
  _player: PlayerState,
  _state: GameState,
  _card: CardSide,
): boolean {
  // TODO (1A.6): Check credit cost (after reductions), tag requirements, parameter requirements
  throw new Error('Not implemented — Phase 1A task 1A.6');
}

/** Get all legal actions for a player in the current game state */
export function getLegalActions(_state: GameState, _playerId: string): GameAction[] {
  // TODO (1A.7): Return activatable project cards, available standard projects, pass
  throw new Error('Not implemented — Phase 1A task 1A.7');
}
