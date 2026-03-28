// AI decision router — orchestrates heuristic, minimax, and Gemini layers
// TODO: Implement in Phase 1C task 1C.3, enhanced in 1D.4 and 1E.4/1E.5

import type { GameAction, GameState } from '../engine/types';

/**
 * Main AI decision function.
 * Routes to the appropriate decision layer based on context.
 * See PRD Section 4.4 for decision flow.
 */
export async function getAIDecision(
  _state: GameState,
  _aiPlayerId: string,
): Promise<GameAction> {
  // TODO: Decision flow (PRD Section 4.4):
  // 1. Research Phase → Call Gemini thinking node (1E.4)
  // 2. Action Phase → Run minimax (1D.4)
  //    → If top actions within margin → Call Gemini tiebreaker (1E.5)
  //    → Otherwise → Return highest-scored action
  throw new Error('Not implemented — Phase 1C task 1C.3');
}
