/**
 * Game persistence types and helpers.
 * Prep for multiplayer — defines the Firestore document schema for saved games.
 */

import type { MatchType } from '@/engine/types';

// Firestore document schema for games/{gameId}
export interface GameDocument {
  id: string;
  matchType: MatchType;
  playerUids: string[];                           // Firebase UIDs of participants
  playerMapping: Record<string, string>;          // uid → in-game player ID ('human'/'ai' or 'player1'/'player2')
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  winner?: string;                                // in-game player ID or 'draw'
}

// Access control rules (enforced at UI level)
export const MATCH_ACCESS: Record<MatchType, { requiresAuth: boolean; description: string }> = {
  'human-vs-ai': { requiresAuth: false, description: 'Play against the AI' },
  'solo': { requiresAuth: false, description: 'Solo challenge mode' },
  'human-vs-human': { requiresAuth: true, description: 'Play with a friend (requires sign-in)' },
};

export function canAccessMatchType(matchType: MatchType, isGuest: boolean): boolean {
  if (matchType === 'human-vs-human' && isGuest) return false;
  return true;
}
