// Income phase calculation
// Phase 1A task 1A.11

import type { GameState, PlayerState, HexId } from './types';

/** Process the income phase for both players and return updated state */
export function processIncomePhase(state: GameState): GameState {
  const s = structuredClone(state);

  // Step 0 (rulebook): when both players have passed, credits on projects
  // return to the supply BEFORE income is collected.
  s.creditSupply += s.players.human.creditsOnCards + s.players.ai.creditsOnCards;
  s.players.human.creditsOnCards = 0;
  s.players.ai.creditsOnCards = 0;

  // Step 1: Determine player order — start player first
  const startId = s.startPlayerId as 'human' | 'ai';
  const otherId: 'human' | 'ai' = startId === 'human' ? 'ai' : 'human';
  const playerOrder: ('human' | 'ai')[] = [startId, otherId];

  // Step 2: Process income for each player
  for (const pid of playerOrder) {
    const player: PlayerState = s.players[pid];

    // 2a: Base income = number of cities
    let totalIncome = player.cities.length;

    // 2b: For each city, +1 per adjacent water tile on the map
    for (const cityHexId of player.cities) {
      const cityHex = s.board.find((h) => h.id === cityHexId);
      if (!cityHex) continue;
      for (const adjId of cityHex.adjacentHexIds) {
        const adjHex = s.board.find((h) => h.id === adjId);
        if (adjHex && adjHex.tile === 'water') {
          totalIncome += 1;
        }
      }
    }

    // 2c: Can't gain more than supply has
    const gained = Math.min(totalIncome, s.creditSupply);

    // 2d: Add credits, deduct from supply
    player.credits += gained;
    s.creditSupply -= gained;

    // 2e: Cap at 5 credits — return excess to supply
    if (player.credits > 5) {
      const excess = player.credits - 5;
      player.credits = 5;
      s.creditSupply += excess;
    }
  }

  // Step 3: Discard current cards
  for (const drafted of s.currentCards) {
    s.discard.push(drafted.cardId);
  }
  s.currentCards = [];

  // Step 4: Clear per-generation flags for both players
  for (const pid of playerOrder) {
    const player: PlayerState = s.players[pid];
    player.projectCardsFacing = [];
    player.usedProjectThisGen = [];
    player.usedStandardProjectThisGen = false;
    player.hasPassed = false;
  }

  // Step 5: Clear passed players
  s.passedPlayers = [];

  return s;
}
