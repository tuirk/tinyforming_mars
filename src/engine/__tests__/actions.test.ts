// ============================================================
// Unit Tests — actions.ts (executeAction)
// ~30 tests covering pass, standard projects, project cards,
// tile placement side effects, and credit formulas.
// ============================================================

import { describe, it, expect } from 'vitest';
import { executeAction } from '../actions';
import { makeGameState, withCity, withTile } from './helpers/stateFactory';
import { getCardSide } from '../cards';
import type { GameAction, GameState, DraftedCard, CardSide } from '../types';

// ============================================================
// Helpers
// ============================================================

/** Shortcut to give both players specific credits and a creditSupply */
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

/** Add a drafted card and its facing sides to the state */
function withDraftedCard(
  state: GameState,
  cardId: number,
  humanSide: 'A' | 'B',
): GameState {
  const aiSide = humanSide === 'A' ? 'B' : 'A';
  const drafted: DraftedCard = { cardId, humanSide, aiSide };
  const humanCardSide = getCardSide(cardId, humanSide)!;
  const aiCardSide = getCardSide(cardId, aiSide)!;
  return {
    ...state,
    currentCards: [...state.currentCards, drafted],
    players: {
      human: {
        ...state.players.human,
        projectCardsFacing: [...state.players.human.projectCardsFacing, humanCardSide],
      },
      ai: {
        ...state.players.ai,
        projectCardsFacing: [...state.players.ai.projectCardsFacing, aiCardSide],
      },
    },
  };
}

// ============================================================
// Pass Action
// ============================================================

describe('executeAction — pass', () => {
  it('marks the acting player as passed', () => {
    const state = makeGameState();
    const result = executeAction(state, { type: 'pass' }, 'human');
    expect(result.players.human.hasPassed).toBe(true);
  });

  it('adds the player to passedPlayers', () => {
    const state = makeGameState();
    const result = executeAction(state, { type: 'pass' }, 'human');
    expect(result.passedPlayers).toContain('human');
  });

  it('does not double-add if called twice', () => {
    const state = makeGameState();
    let result = executeAction(state, { type: 'pass' }, 'human');
    result = executeAction(result, { type: 'pass' }, 'human');
    expect(result.passedPlayers.filter((id) => id === 'human')).toHaveLength(1);
  });

  it('does not affect the other player', () => {
    const state = makeGameState();
    const result = executeAction(state, { type: 'pass' }, 'human');
    expect(result.players.ai.hasPassed).toBe(false);
    expect(result.passedPlayers).not.toContain('ai');
  });
});

// ============================================================
// Standard Projects
// ============================================================

describe('executeAction — standard project: sell_patent', () => {
  it('gains 1 credit from supply with no cost', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = { type: 'standard_project', projectId: 'sell_patent' };
    const result = executeAction(state, action, 'human');
    // Rulebook: no cost — Gain 1 Credit from supply
    expect(result.players.human.credits).toBe(6);
    expect(result.creditSupply).toBe(4);
    expect(result.players.human.creditsOnCards).toBe(0);
  });

  it('marks usedStandardProjectThisGen', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = { type: 'standard_project', projectId: 'sell_patent' };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.usedStandardProjectThisGen).toBe(true);
  });
});

describe('executeAction — standard project: build_city', () => {
  it('places city on valid hex and updates player.cities', () => {
    // Hex 2 is a land hex on Tharsis
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'build_city',
      targetHexId: 2,
    };
    const result = executeAction(state, action, 'human');
    const hex2 = result.board.find((h) => h.id === 2)!;
    expect(hex2.city).toEqual({ playerId: 'human' });
    expect(result.players.human.cities).toContain(2);
  });

  it('deducts credits equal to cost (2) and returns them to supply', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'build_city',
      targetHexId: 2,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.credits).toBe(3); // 5 - 2
    expect(result.players.human.creditsOnCards).toBe(0);
    expect(result.creditSupply).toBe(7); // 5 + 2 paid
  });

  it('relocates the chosen city when fromHexId is provided', () => {
    let state = withCredits(makeGameState(), { human: 5, supply: 5 });
    state = withCity(state, 1, 'human');
    state = withCity(state, 17, 'human');
    // Move city on hex 17 (not cities[0]=1) to hex 8
    const result = executeAction(
      state,
      {
        type: 'standard_project',
        projectId: 'build_city',
        fromHexId: 17,
        targetHexId: 8,
      },
      'human',
    );
    expect(result.board.find((h) => h.id === 17)?.city).toBeNull();
    expect(result.board.find((h) => h.id === 1)?.city).toEqual({ playerId: 'human' });
    expect(result.board.find((h) => h.id === 8)?.city).toEqual({ playerId: 'human' });
    expect(result.players.human.cities.sort()).toEqual([1, 8]);
  });
});

describe('executeAction — standard project: import_water', () => {
  it('places water tile on water hex and decrements supply', () => {
    // Hex 3 is a water hex on Tharsis
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 3,
    };
    const result = executeAction(state, action, 'human');
    const hex3 = result.board.find((h) => h.id === 3)!;
    expect(hex3.tile).toBe('water');
    expect(hex3.tilePlacedBy).toBe('human');
    expect(result.parameterSupply.water).toBe(3); // was 4
  });

  it('grants resource token from hex with resourceTokenIcon', () => {
    // Hex 3 has resourceTokenIcon = 'science'
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 3,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).toContain('science');
    expect(result.resourceTokenSupply.science).toBe(0); // was 1
  });
});

describe('executeAction — standard project: greenhouses', () => {
  it('places greenery tile on land hex and decrements supply', () => {
    // Hex 1 is a land hex on Tharsis
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'greenhouses',
      targetHexId: 1,
    };
    const result = executeAction(state, action, 'human');
    const hex1 = result.board.find((h) => h.id === 1)!;
    expect(hex1.tile).toBe('greenery');
    expect(hex1.tilePlacedBy).toBe('human');
    expect(result.parameterSupply.greenery).toBe(6); // was 7
  });
});

describe('executeAction — standard project: energy_farms', () => {
  it('gains 1 heat tile from supply to personal', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'energy_farms',
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.parameterSupply.heat).toBe(10); // was 11
  });

  it('never places heat on the map, even with a rogue targetHexId', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'energy_farms',
      targetHexId: 1,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.board.every((h) => h.tile !== 'heat')).toBe(true);
  });

  it('uses the same personal-heat rule for AI (no player override)', () => {
    const state = withCredits(makeGameState(), { ai: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'energy_farms',
      targetHexId: 5,
    };
    const result = executeAction(state, action, 'ai');
    expect(result.players.ai.heatTilesPersonal).toBe(1);
    expect(result.board.every((h) => h.tile !== 'heat')).toBe(true);
  });

  it('does not gain heat if supply is empty', () => {
    const state = withCredits(
      makeGameState({ parameterSupply: { heat: 0, greenery: 7, water: 4 } }),
      { human: 5, supply: 5 },
    );
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'energy_farms',
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.heatTilesPersonal).toBe(0);
    expect(result.parameterSupply.heat).toBe(0);
  });
});

// ============================================================
// Standard project: spending resource tokens
// ============================================================

describe('executeAction — standard project with spent tokens', () => {
  it('removes spent tokens from player and returns to supply', () => {
    let state = makeGameState();
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          resourceTokens: ['nature', 'science'],
        },
      },
      resourceTokenSupply: { nature: 1, production: 1, science: 0 },
    };
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'sell_patent',
      spentTokens: ['nature'],
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).not.toContain('nature');
    expect(result.players.human.resourceTokens).toContain('science');
    expect(result.resourceTokenSupply.nature).toBe(2); // was 1, returned 1
  });
});

// ============================================================
// Project Card Execution
// ============================================================

describe('executeAction — project card basics', () => {
  it('deducts credits: 1 stays on card, remainder returns to supply', () => {
    // Card 2B (Solar Power): cost=3, effect=gain_heat(1)
    // Needs: production×1, science×1
    const card2B = getCardSide(2, 'B')!;
    let state = makeGameState();
    state = withDraftedCard(state, 2, 'B'); // human sees B side
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          // Give enough tags via resource tokens
          resourceTokens: ['production', 'science'],
        },
      },
      resourceTokenSupply: { nature: 2, production: 0, science: 0 },
    };

    const action: GameAction = {
      type: 'activate_project',
      cardId: 2,
      side: 'B',
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.credits).toBe(5 - card2B.cost); // 5-3=2
    expect(result.players.human.creditsOnCards).toBe(1); // use marker only
    expect(result.creditSupply).toBe(5 + (card2B.cost - 1)); // remainder to supply
    // Auto-spend tokens used to meet tag requirements
    expect(result.players.human.resourceTokens).toEqual([]);
    expect(result.resourceTokenSupply.production).toBe(1);
    expect(result.resourceTokenSupply.science).toBe(1);
  });

  it('auto-spends only shortfall tokens for tag requirements', () => {
    // Card 8A Lichen: needs nature×2. Card tags production×2 — spend 2 nature tokens.
    let state = makeGameState();
    state = withDraftedCard(state, 8, 'A');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          heatTilesPersonal: 2, // lichen needs 2 heat
          resourceTokens: ['nature', 'nature', 'science'],
        },
      },
      resourceTokenSupply: { nature: 0, production: 1, science: 0 },
    };
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 8, side: 'A', targetHexId: 1 },
      'human',
    );
    expect(result.players.human.resourceTokens).toEqual(['science']);
    expect(result.resourceTokenSupply.nature).toBe(2);
  });

  it('marks card as used this generation', () => {
    const card2B = getCardSide(2, 'B')!;
    let state = makeGameState();
    state = withDraftedCard(state, 2, 'B');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          resourceTokens: ['production', 'science'],
        },
      },
      resourceTokenSupply: { nature: 2, production: 0, science: 0 },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 2,
      side: 'B',
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.usedProjectThisGen).toContain(2);
  });

  it('spends resource tokens when provided', () => {
    let state = makeGameState();
    state = withDraftedCard(state, 2, 'B');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          resourceTokens: ['production', 'science'],
        },
      },
      resourceTokenSupply: { nature: 2, production: 0, science: 0 },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 2,
      side: 'B',
      spentTokens: ['production'],
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).not.toContain('production');
    expect(result.resourceTokenSupply.production).toBe(1); // returned
  });
});

describe('executeAction — project card: place_water effect', () => {
  it('places water on hex when effect is place_water', () => {
    // Card 3A (Water from Europa): cost=3, effect=place_water
    // Need space×2 tags, so use resource tokens + card tags
    let state = makeGameState();
    state = withDraftedCard(state, 3, 'A');
    const card3A = getCardSide(3, 'A')!;
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          // card3A tags are ['space', 'science'] — need space×2
          // so we add a 'science' resource token as extra tag source is not needed;
          // Actually let's just give credits and set up tags through projectCardsFacing
          // card3A already gives space+science from its tags
          // Requirements: space×2 — we have 1 from card, need 1 more
          resourceTokens: [],
        },
      },
      resourceTokenSupply: { nature: 2, production: 1, science: 1 },
    };

    // We need to add more space tags. Let's draft another card that gives space tags.
    // Simpler: just give a resource token... but resource tokens are nature/production/science.
    // Space tag can't come from resource tokens. Let's draft more cards.
    // Actually, for testing the effect itself, let's skip requirement checking
    // since executeAction doesn't re-check requirements — it trusts the caller validated.
    // So we can call it directly.

    const action: GameAction = {
      type: 'activate_project',
      cardId: 3,
      side: 'A',
      targetHexId: 9, // water hex on Tharsis
    };
    const result = executeAction(state, action, 'human');
    const hex9 = result.board.find((h) => h.id === 9)!;
    expect(hex9.tile).toBe('water');
    expect(hex9.tilePlacedBy).toBe('human');
    expect(result.parameterSupply.water).toBe(3); // was 4
  });
});

describe('executeAction — Protected Valley grants water-hex resource tokens', () => {
  it('grants the hex icon token when greenery is placed on a water hex', () => {
    // Hex 9 is water with resourceTokenIcon = nature
    let state = makeGameState();
    state = withDraftedCard(state, 13, 'A');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          heatTilesPersonal: 2,
          resourceTokens: ['nature', 'nature'],
        },
      },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 13,
      side: 'A',
      targetHexId: 9,
    };
    const result = executeAction(state, action, 'human');
    const hex9 = result.board.find((h) => h.id === 9)!;
    expect(hex9.tile).toBe('greenery');
    // Spent 2 nature for tags (returned to supply), then gained 1 from hex 9
    expect(result.players.human.resourceTokens).toEqual(['nature']);
    expect(result.resourceTokenSupply.nature).toBe(3);
  });
});

describe('executeAction — project card: gain_heat effect', () => {
  it('moves heat from supply to personal', () => {
    // Card 2B (Solar Power): effect = gain_heat(1)
    let state = makeGameState();
    state = withDraftedCard(state, 2, 'B');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 2,
      side: 'B',
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.parameterSupply.heat).toBe(10); // was 11
  });

  it('ignores targetHexId — gain_heat never paints the board', () => {
    let state = makeGameState();
    state = withDraftedCard(state, 2, 'B');
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 2,
      side: 'B',
      targetHexId: 1,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.board.find((h) => h.id === 1)?.tile).toBeNull();
  });
});

describe('executeAction — project card: gain_credits with per_city formula', () => {
  it('gives correct amount based on city count', () => {
    // Card 1B (Power Grid): composite effect = [gain_heat(1), gain_credits(per_city×1)]
    let state = makeGameState();
    state = withDraftedCard(state, 1, 'B');
    // Place 2 cities on the board
    state = withCity(state, 2, 'human');
    state = withCity(state, 13, 'ai');
    state = {
      ...state,
      creditSupply: 10,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 1,
      side: 'B',
    };
    const result = executeAction(state, action, 'human');
    // Card 1B cost=5, so credits = 5-5 = 0, then +2 from per_city (2 cities)
    expect(result.players.human.credits).toBe(2);
    // Heat: +1 from supply
    expect(result.players.human.heatTilesPersonal).toBe(1);
  });
});

describe('executeAction — project card: composite effect', () => {
  it('executes multiple effects in sequence (Power Grid = heat + credits)', () => {
    // Card 1B: composite [gain_heat(1), gain_credits(per_city×1)]
    let state = makeGameState();
    state = withDraftedCard(state, 1, 'B');
    state = withCity(state, 4, 'human');
    state = {
      ...state,
      creditSupply: 10,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };
    const action: GameAction = {
      type: 'activate_project',
      cardId: 1,
      side: 'B',
    };
    const result = executeAction(state, action, 'human');
    // Heat gained
    expect(result.players.human.heatTilesPersonal).toBe(1);
    // Credits: 5 - 5(cost) + 1(per_city, 1 city on board) = 1
    expect(result.players.human.credits).toBe(1);
  });
});

// ============================================================
// Water Placement Side Effects
// ============================================================

describe('water placement side effects', () => {
  it('grants resource token when water is placed on hex with resourceTokenIcon', () => {
    // Hex 9 has resourceTokenIcon = 'nature'
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 9,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).toContain('nature');
    expect(result.resourceTokenSupply.nature).toBe(1); // was 2
  });

  it('does not grant resource token when supply is empty', () => {
    let state = withCredits(makeGameState(), { human: 5, supply: 5 });
    state = { ...state, resourceTokenSupply: { nature: 0, production: 1, science: 1 } };
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 9, // nature token icon, but nature supply=0
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).not.toContain('nature');
  });

  it('gains +1 credit per adjacent water tile', () => {
    // Hex 10 is adjacent to hex 9. Place water on hex 9 first, then hex 10.
    let state = withCredits(makeGameState(), { human: 5, supply: 10 });
    state = withTile(state, 9, 'water', 'human'); // pre-place water on hex 9
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 10, // adjacent to hex 9
    };
    const result = executeAction(state, action, 'human');
    // Credits: 5 - 3(cost→supply) + 1(adjacent water bonus) = 3
    expect(result.players.human.credits).toBe(3);
    expect(result.players.human.creditsOnCards).toBe(0);
    expect(result.creditSupply).toBe(10 + 3 - 1); // paid 3 to supply, took 1 bonus
  });

  it('gains credits for multiple adjacent water tiles', () => {
    // Hex 15 is adjacent to hexes 10, 11, 14, 16, 18, 19
    // Place water on hex 10 and hex 16 (both water hexes)
    let state = withCredits(makeGameState(), { human: 5, supply: 10 });
    state = withTile(state, 10, 'water', 'human');
    state = withTile(state, 16, 'water', 'human');
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 15, // adjacent to 10 and 16 which have water
    };
    const result = executeAction(state, action, 'human');
    // Credits: 5 - 3(cost) + 2(two adjacent water) = 4
    expect(result.players.human.credits).toBe(4);
  });

  it('gives no credit bonus when no adjacent water tiles', () => {
    // Hex 3 is a water hex. Its adjacents are 2, 6, 7 — none are water hexes with tiles.
    const state = withCredits(makeGameState(), { human: 5, supply: 10 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 3,
    };
    const result = executeAction(state, action, 'human');
    // Credits: 5 - 3(cost) = 2, no bonus
    expect(result.players.human.credits).toBe(2);
  });

  it('does not grant resource token on hex without icon (hex 16)', () => {
    // Hex 16 is a water hex with no resourceTokenIcon
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const action: GameAction = {
      type: 'standard_project',
      projectId: 'import_water',
      targetHexId: 16,
    };
    const result = executeAction(state, action, 'human');
    expect(result.players.human.resourceTokens).toHaveLength(0);
  });
});

// ============================================================
// State immutability (structuredClone)
// ============================================================

describe('executeAction — immutability', () => {
  it('does not mutate the original state', () => {
    const state = withCredits(makeGameState(), { human: 5, supply: 5 });
    const original = structuredClone(state);
    executeAction(state, { type: 'pass' }, 'human');
    // Original should be unchanged
    expect(state.players.human.hasPassed).toBe(original.players.human.hasPassed);
    expect(state.passedPlayers).toEqual(original.passedPlayers);
  });
});
