// ============================================================
// TINYforming Mars — Heuristic Evaluation (Task 1C.1 / 1C.2)
// Scores a GameState from a player's perspective.
// ============================================================

import type { GameState, HexId } from '../engine/types';
import { getPlayerById, getOpponentId, getLegalActions } from '../engine/rules';

// ============================================================
// Tunable weights (exported for external tuning / tests)
// ============================================================

export const WEIGHTS = {
  heatPersonal: 1.0,
  greeneryExclusive: 2.0,
  greeneryShared: 1.0,
  greeneryOpponentOnly: -1.0,
  heatMapMyCity: -1.0,
  heatMapOpponentCity: 0.5,
  waterExclusive: 1.5,
  waterShared: 0.5,
  credits: 0.3,
  cityOnBonusHex: 0.8,
  resourceToken: 0.8,
  legalMoves: 0.1,
};

// ============================================================
// Helper: adjacency check
// ============================================================

function isAdjacentToPlayerCity(
  state: GameState,
  hexId: HexId,
  playerId: string,
): boolean {
  const player = getPlayerById(state, playerId);
  const hex = state.board.find((h) => h.id === hexId)!;
  return player.cities.some((cityId) => hex.adjacentHexIds.includes(cityId));
}

// ============================================================
// End-game proximity (1C.2)
// ============================================================

/**
 * Returns a value from 0.0 (early game) to 1.0 (game about to end),
 * based on exhausted parameter supplies, board occupancy, and
 * generation progress.
 */
export function getEndGameProximity(state: GameState): number {
  // Count how many of the 3 parameter supply types are at 0
  const exhaustedCount =
    (state.parameterSupply.heat === 0 ? 1 : 0) +
    (state.parameterSupply.greenery === 0 ? 1 : 0) +
    (state.parameterSupply.water === 0 ? 1 : 0);
  const exhaustedParams = exhaustedCount / 3;

  // Fraction of board hexes that are occupied (tile or city)
  const occupiedCount = state.board.filter(
    (h) => h.tile !== null || h.city !== null,
  ).length;
  const occupiedHexes = occupiedCount / 19;

  // Generation progress (max 12 generations)
  const generationProgress = state.generation / 12;

  return (exhaustedParams + occupiedHexes + generationProgress) / 3;
}

// ============================================================
// Main evaluation function
// ============================================================

/**
 * Evaluate a game state from a player's perspective.
 * Returns a numeric score — higher is better for the given player.
 * Used by both standalone heuristic decisions and minimax search.
 */
export function evaluate(state: GameState, playerId: string): number {
  const player = getPlayerById(state, playerId);
  const opponentId = getOpponentId(playerId);

  // End-game proximity modifiers
  const proximity = getEndGameProximity(state);
  const vpMultiplier = 1 + proximity * 0.5;          // up to 1.5x
  const positionalMultiplier = 1 - proximity * 0.5;  // down to 0.5x

  let score = 0;

  // --- 1. Heat in personal supply (direct VP) ---
  score += player.heatTilesPersonal * WEIGHTS.heatPersonal * vpMultiplier;

  // --- 2. Board tile scoring ---
  for (const hex of state.board) {
    if (hex.tile === null) continue;

    const adjToMe = isAdjacentToPlayerCity(state, hex.id, playerId);
    const adjToOpp = isAdjacentToPlayerCity(state, hex.id, opponentId);

    if (hex.tile === 'greenery') {
      if (adjToMe && !adjToOpp) {
        score += WEIGHTS.greeneryExclusive * vpMultiplier;
      } else if (adjToMe && adjToOpp) {
        score += WEIGHTS.greeneryShared * vpMultiplier;
      } else if (!adjToMe && adjToOpp) {
        score += WEIGHTS.greeneryOpponentOnly * vpMultiplier;
      }
      // greenery adjacent to neither city: 0
    }

    if (hex.tile === 'heat') {
      if (adjToMe) {
        score += WEIGHTS.heatMapMyCity * vpMultiplier;
      }
      if (adjToOpp) {
        score += WEIGHTS.heatMapOpponentCity * vpMultiplier;
      }
    }

    if (hex.tile === 'water') {
      if (adjToMe && !adjToOpp) {
        score += WEIGHTS.waterExclusive * vpMultiplier;
      } else if (adjToMe && adjToOpp) {
        score += WEIGHTS.waterShared * vpMultiplier;
      }
      // water adjacent to opponent only or neither: 0
    }
  }

  // --- 3. Credits (positional) ---
  score += player.credits * WEIGHTS.credits * positionalMultiplier;

  // --- 4. City on bonus hex (direct VP-ish) ---
  for (const cityHexId of player.cities) {
    const hex = state.board.find((h) => h.id === cityHexId)!;
    if (hex.bonusTag !== null) {
      score += WEIGHTS.cityOnBonusHex * vpMultiplier;
    }
  }

  // --- 5. Resource tokens (positional) ---
  score += player.resourceTokens.length * WEIGHTS.resourceToken * positionalMultiplier;

  // --- 6. Legal moves (positional) ---
  score += getLegalActions(state, playerId).length * WEIGHTS.legalMoves * positionalMultiplier;

  return score;
}
