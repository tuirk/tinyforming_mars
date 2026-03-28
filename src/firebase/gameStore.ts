// Firestore game persistence — save/load/list games
// TODO: Implement in Phase 1F task 1F.5

import type { GameState } from '../engine/types';

/** Save game state to Firestore (auto-save after each action) */
export async function saveGame(_gameState: GameState): Promise<void> {
  // TODO (1F.5): Write to /games/{gameId} in Firestore
  throw new Error('Not implemented — Phase 1F task 1F.5');
}

/** Load a game by ID */
export async function loadGame(_gameId: string): Promise<GameState | null> {
  // TODO (1F.5): Read from /games/{gameId}
  throw new Error('Not implemented — Phase 1F task 1F.5');
}

/** List active games for the current user */
export async function listGames(_userId: string): Promise<{ id: string; updatedAt: number }[]> {
  // TODO (1F.5): Query /games where userId == current user
  throw new Error('Not implemented — Phase 1F task 1F.5');
}
