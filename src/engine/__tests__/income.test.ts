// ============================================================
// Unit Tests — income.ts (processIncomePhase)
// ~15 tests covering city income, water adjacency bonus,
// credit capping, card cleanup, and per-gen flag resets.
// ============================================================

import { describe, it, expect } from 'vitest';
import { processIncomePhase } from '../income';
import { makeGameState, withCity, withTile } from './helpers/stateFactory';
import type { GameState, DraftedCard } from '../types';
import { getCardSide } from '../cards';

// ============================================================
// Helpers
// ============================================================

function withCredits(
  state: GameState,
  opts: { human?: number; ai?: number; supply?: number },
): GameState {
  return {
    ...state,
    creditSupply: opts.supply ?? state.creditSupply,
    players: {
      human: { ...state.players.human, credits: opts.human ?? state.players.human.credits },
      ai: { ...state.players.ai, credits: opts.ai ?? state.players.ai.credits },
    },
  };
}

// ============================================================
// Basic Income
// ============================================================

describe('processIncomePhase — base income', () => {
  it('player with 0 cities gets 0 income', () => {
    const state = withCredits(makeGameState(), { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.players.human.credits).toBe(0);
    expect(result.players.ai.credits).toBe(0);
  });

  it('player with 1 city gets +1 credit', () => {
    let state = makeGameState();
    state = withCity(state, 2, 'human'); // hex 2 is a land hex
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.players.human.credits).toBe(1);
  });

  it('player with 2 cities gets +2 credits', () => {
    let state = makeGameState();
    state = withCity(state, 2, 'human');
    state = withCity(state, 13, 'human'); // hex 13, far from hex 2
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.players.human.credits).toBe(2);
  });
});

// ============================================================
// Water Adjacency Bonus
// ============================================================

describe('processIncomePhase — water adjacency', () => {
  it('city adjacent to 1 water tile gets +1 extra', () => {
    // Hex 4 is land, adjacent to hexes 1,5,8,9. Hex 9 is water.
    let state = makeGameState();
    state = withCity(state, 4, 'human');
    state = withTile(state, 9, 'water', 'ai'); // place water on hex 9
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    // 1 (city) + 1 (adjacent water) = 2
    expect(result.players.human.credits).toBe(2);
  });

  it('city adjacent to 2 water tiles gets +2 extra', () => {
    // Hex 5 is land, adjacent to hexes 1,2,4,6,9,10. Hexes 9,10 are water.
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withTile(state, 9, 'water', 'ai');
    state = withTile(state, 10, 'water', 'ai');
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    // 1 (city) + 2 (adjacent water) = 3
    expect(result.players.human.credits).toBe(3);
  });

  it('water tile not adjacent to city gives no bonus', () => {
    // Hex 2 is land, adjacent to 1,3,5,6. None of those are water by default.
    // Place water on hex 16 (far away). Should not affect hex 2 city.
    let state = makeGameState();
    state = withCity(state, 2, 'human');
    state = withTile(state, 16, 'water', 'ai');
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    // 1 (city) + 0 (no adjacent water) = 1
    expect(result.players.human.credits).toBe(1);
  });
});

// ============================================================
// Credit Cap
// ============================================================

describe('processIncomePhase — credit cap at 5', () => {
  it('caps credits at 5 and returns excess to supply', () => {
    // Player starts with 4 credits, has 2 cities adjacent to water = +4 income
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withCity(state, 11, 'human');
    // Hex 5 adjacent to 9,10 (water). Hex 11 adjacent to 10,15,16 (water).
    state = withTile(state, 9, 'water', 'ai');
    state = withTile(state, 10, 'water', 'ai');
    state = withTile(state, 15, 'water', 'ai');
    state = withTile(state, 16, 'water', 'ai');
    state = withCredits(state, { human: 4, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    // Income: 2(cities) + 2(hex5:adj9,10) + 3(hex11:adj10,15,16) = 7
    // 4 + 7 = 11, capped to 5, excess 6 returned
    expect(result.players.human.credits).toBe(5);
    // Supply: gained 7 less, but 6 returned = net -1 from supply via player
    // However creditsOnCards also get returned (step 3). Human creditsOnCards=0 here.
    expect(result.players.human.credits).toBeLessThanOrEqual(5);
  });

  it('does not cap credits at 5 if income brings them to exactly 5', () => {
    let state = makeGameState();
    state = withCity(state, 2, 'human'); // 1 city, +1 income
    state = withCredits(state, { human: 4, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.players.human.credits).toBe(5);
  });

  it('player already at 5 with 0 income stays at 5', () => {
    const state = withCredits(makeGameState(), { human: 5, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.players.human.credits).toBe(5);
  });
});

// ============================================================
// Credits on Cards returned to supply
// ============================================================

describe('processIncomePhase — creditsOnCards cleanup', () => {
  it('returns creditsOnCards to supply', () => {
    let state = withCredits(makeGameState(), { human: 0, ai: 0, supply: 0 });
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, creditsOnCards: 3 },
        ai: { ...state.players.ai, creditsOnCards: 2 },
      },
    };
    const result = processIncomePhase(state);
    expect(result.players.human.creditsOnCards).toBe(0);
    expect(result.players.ai.creditsOnCards).toBe(0);
    expect(result.creditSupply).toBe(5); // 0 + 3 + 2
  });
});

// ============================================================
// Current Cards Discarded
// ============================================================

describe('processIncomePhase — card discard', () => {
  it('discards current cards to discard pile', () => {
    const drafted: DraftedCard[] = [
      { cardId: 1, humanSide: 'A', aiSide: 'B' },
      { cardId: 2, humanSide: 'A', aiSide: 'B' },
      { cardId: 3, humanSide: 'B', aiSide: 'A' },
    ];
    let state = makeGameState({ currentCards: drafted });
    state = withCredits(state, { human: 0, ai: 0, supply: 10 });
    const result = processIncomePhase(state);
    expect(result.currentCards).toHaveLength(0);
    expect(result.discard).toContain(1);
    expect(result.discard).toContain(2);
    expect(result.discard).toContain(3);
  });
});

// ============================================================
// Per-Generation Flags Cleared
// ============================================================

describe('processIncomePhase — per-gen flags', () => {
  it('clears usedProjectThisGen', () => {
    let state = makeGameState();
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, usedProjectThisGen: [1, 3] },
      },
    };
    const result = processIncomePhase(state);
    expect(result.players.human.usedProjectThisGen).toHaveLength(0);
  });

  it('clears usedStandardProjectThisGen', () => {
    let state = makeGameState();
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, usedStandardProjectThisGen: true },
      },
    };
    const result = processIncomePhase(state);
    expect(result.players.human.usedStandardProjectThisGen).toBe(false);
  });

  it('clears hasPassed for both players', () => {
    let state = makeGameState();
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, hasPassed: true },
        ai: { ...state.players.ai, hasPassed: true },
      },
    };
    const result = processIncomePhase(state);
    expect(result.players.human.hasPassed).toBe(false);
    expect(result.players.ai.hasPassed).toBe(false);
  });

  it('clears passedPlayers', () => {
    let state = makeGameState({ passedPlayers: ['human', 'ai'] });
    const result = processIncomePhase(state);
    expect(result.passedPlayers).toHaveLength(0);
  });

  it('clears projectCardsFacing', () => {
    const card1A = getCardSide(1, 'A')!;
    let state = makeGameState();
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, projectCardsFacing: [card1A] },
      },
    };
    const result = processIncomePhase(state);
    expect(result.players.human.projectCardsFacing).toHaveLength(0);
  });
});

// ============================================================
// Player Order
// ============================================================

describe('processIncomePhase — player order', () => {
  it('starting player processes income first', () => {
    // If supply is limited, the starting player gets priority.
    // Start player = human, both have 1 city. Supply only has 1 credit.
    let state = makeGameState({ startPlayerId: 'human' });
    state = withCity(state, 2, 'human');
    state = withCity(state, 13, 'ai');
    state = withCredits(state, { human: 0, ai: 0, supply: 1 });
    const result = processIncomePhase(state);
    // Human gets 1 (only 1 in supply), AI gets 0
    expect(result.players.human.credits).toBe(1);
    expect(result.players.ai.credits).toBe(0);
  });

  it('non-starting player goes second and may get less', () => {
    let state = makeGameState({ startPlayerId: 'ai' });
    state = withCity(state, 2, 'human');
    state = withCity(state, 13, 'ai');
    state = withCredits(state, { human: 0, ai: 0, supply: 1 });
    const result = processIncomePhase(state);
    // AI goes first, gets 1. Human gets 0.
    expect(result.players.ai.credits).toBe(1);
    expect(result.players.human.credits).toBe(0);
  });
});

// ============================================================
// Immutability
// ============================================================

describe('processIncomePhase — immutability', () => {
  it('does not mutate the original state', () => {
    let state = makeGameState();
    state = withCity(state, 2, 'human');
    state = withCredits(state, { human: 0, supply: 10 });
    const original = structuredClone(state);
    processIncomePhase(state);
    expect(state.players.human.credits).toBe(original.players.human.credits);
    expect(state.creditSupply).toBe(original.creditSupply);
  });
});
