// End-game scoring with tiebreaker logic
// Phase 1A tasks 1A.12, 1A.13

import type { GameState, EndCondition, ScoreBreakdown, GameResult, HexId, ParameterTileType } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the hex is adjacent to at least one of the player's cities */
function isAdjacentToPlayerCity(state: GameState, hexId: HexId, playerId: string): boolean {
  const pid = playerId as 'human' | 'ai';
  const player = state.players[pid];
  const hex = state.board.find((h) => h.id === hexId);
  if (!hex) return false;
  return player.cities.some((cityHexId) => hex.adjacentHexIds.includes(cityHexId));
}

// ---------------------------------------------------------------------------
// End-Game Detection (1A.12)
// ---------------------------------------------------------------------------

/** Check if the game should end. Returns the condition or null. */
export function checkEndCondition(state: GameState): EndCondition | null {
  // 1. Count exhausted parameter types (supply === 0)
  const parameterTypes: ParameterTileType[] = ['heat', 'greenery', 'water'];
  const exhaustedCount = parameterTypes.filter(
    (t) => state.parameterSupply[t] === 0,
  ).length;
  if (exhaustedCount >= 2) return 'parameters';

  // 2. All hexes occupied (every hex has tile or city)
  const allOccupied = state.board.every((hex) => hex.tile !== null || hex.city !== null);
  if (allOccupied) return 'hexes_full';

  // 3. Generation cap
  if (state.generation >= 12) return 'generation_12';

  return null;
}

// ---------------------------------------------------------------------------
// Scoring (1A.13)
// ---------------------------------------------------------------------------

/** Calculate score breakdown for a single player */
export function calculatePlayerScore(
  state: GameState,
  playerId: string,
): ScoreBreakdown {
  const pid = playerId as 'human' | 'ai';
  const player = state.players[pid];
  const opponentId: 'human' | 'ai' = pid === 'human' ? 'ai' : 'human';

  // 1. cityPoints: per city, +1 per adjacent greenery, -1 per adjacent heat ON MAP
  let cityPoints = 0;
  for (const cityHexId of player.cities) {
    const cityHex = state.board.find((h) => h.id === cityHexId);
    if (!cityHex) continue;
    for (const adjId of cityHex.adjacentHexIds) {
      const adjHex = state.board.find((h) => h.id === adjId);
      if (!adjHex) continue;
      if (adjHex.tile === 'greenery') cityPoints += 1;
      if (adjHex.tile === 'heat') cityPoints -= 1;
    }
  }

  // 2. greeneryPoints: greenery tiles adjacent to ONLY this player's cities
  let greeneryPoints = 0;
  for (const hex of state.board) {
    if (hex.tile !== 'greenery') continue;
    const adjToMe = isAdjacentToPlayerCity(state, hex.id, pid);
    const adjToOpp = isAdjacentToPlayerCity(state, hex.id, opponentId);
    if (adjToMe && !adjToOpp) greeneryPoints += 1;
  }

  // 3. waterPoints: water tiles adjacent to ONLY this player's cities
  let waterPoints = 0;
  for (const hex of state.board) {
    if (hex.tile !== 'water') continue;
    const adjToMe = isAdjacentToPlayerCity(state, hex.id, pid);
    const adjToOpp = isAdjacentToPlayerCity(state, hex.id, opponentId);
    if (adjToMe && !adjToOpp) waterPoints += 1;
  }

  // 4. heatPoints: heat tiles in personal supply (NOT on map)
  const heatPoints = player.heatTilesPersonal;

  // 5. total
  const total = cityPoints + greeneryPoints + waterPoints + heatPoints;

  return { cityPoints, greeneryPoints, waterPoints, heatPoints, total };
}

/** Calculate final game result with tiebreaker */
export function calculateGameResult(state: GameState): GameResult {
  const human = calculatePlayerScore(state, 'human');
  const ai = calculatePlayerScore(state, 'ai');

  // Different totals → higher wins
  if (human.total !== ai.total) {
    return {
      human,
      ai,
      winner: human.total > ai.total ? 'human' : 'ai',
    };
  }

  // Tiebreaker sequence
  const tiebreakers: { key: keyof Omit<ScoreBreakdown, 'total'>; label: string }[] = [
    { key: 'cityPoints', label: 'cityPoints' },
    { key: 'greeneryPoints', label: 'greeneryPoints' },
    { key: 'waterPoints', label: 'waterPoints' },
    { key: 'heatPoints', label: 'heatPoints' },
  ];

  for (const { key, label } of tiebreakers) {
    if (human[key] !== ai[key]) {
      return {
        human,
        ai,
        winner: human[key] > ai[key] ? 'human' : 'ai',
        tiebreaker: label,
      };
    }
  }

  // Complete tie
  return { human, ai, winner: null };
}
