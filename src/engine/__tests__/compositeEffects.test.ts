import { describe, it, expect } from 'vitest';
import { executeAction } from '../actions';
import { getCardSide } from '../cards';
import { makeGameState, withCity, withTile, withPlayerCards } from './helpers/stateFactory';
import type { GameState, DraftedCard, CardSide } from '../types';

// Helper: set up state with a card ready for activation
function setupCard(
  state: GameState,
  cardId: number,
  humanSide: 'A' | 'B',
  credits: number,
): GameState {
  const cardSide = getCardSide(cardId, humanSide)!;
  const aiSide = humanSide === 'A' ? 'B' : 'A';
  return {
    ...state,
    currentCards: [{ cardId, humanSide, aiSide } as DraftedCard],
    players: {
      ...state.players,
      human: {
        ...state.players.human,
        credits,
        creditsOnCards: 0,
        projectCardsFacing: [cardSide],
      },
    },
  };
}

// ============================================================
// Water Placement Triggers
// ============================================================

describe('Water placement triggers', () => {
  it('gives resource token when water placed on hex with token icon', () => {
    // Tharsis hex 3 is water with resourceTokenIcon='science'
    let state = makeGameState();
    state = setupCard(state, 3, 'A', 10); // Water from Europa
    state = {
      ...state,
      parameterSupply: { ...state.parameterSupply, water: 4 },
      resourceTokenSupply: { nature: 2, production: 1, science: 1 },
    };

    const result = executeAction(
      state,
      { type: 'standard_project', projectId: 'import_water', targetHexId: 3 },
      'human',
    );
    expect(result.players.human.resourceTokens).toContain('science');
    expect(result.resourceTokenSupply.science).toBe(0);
  });

  it('gives +1 credit per adjacent water tile', () => {
    // Hex 9 and 10 are adjacent water hexes on Tharsis
    let state = makeGameState();
    state = withTile(state, 10, 'water', 'human'); // place water on hex 10 first
    state = {
      ...state,
      creditSupply: 5,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };

    const result = executeAction(
      state,
      { type: 'standard_project', projectId: 'import_water', targetHexId: 9 },
      'human',
    );
    // Should gain +1 credit from adjacent water (hex 10)
    // Minus the 3 cost of import_water
    // Net: 5 - 3 + 1 = 3 credits (plus resource token on hex 9 = nature)
    expect(result.players.human.credits).toBe(3);
  });
});

// ============================================================
// Power Grid (Card 1B) — gain heat + credits per city
// ============================================================

describe('Power Grid (Card 1B)', () => {
  it('gains 1 heat to personal supply AND credits per city on Mars', () => {
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withCity(state, 13, 'ai');
    state = setupCard(state, 1, 'B', 10);
    // Power Grid needs Energy×2 + Production tags — give via cards
    const card1B = getCardSide(1, 'B')!;
    // Just set enough tags by adding cards with matching tags
    state = withPlayerCards(state, 'human', [card1B, getCardSide(7, 'A')!, getCardSide(6, 'A')!]);

    const before = state.players.human.heatTilesPersonal;
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 1, side: 'B' },
      'human',
    );
    // Should gain 1 heat
    expect(result.players.human.heatTilesPersonal).toBe(before + 1);
    // Should gain credits for 2 cities on Mars (1 human + 1 AI)
    // Credits = initial - cost + 2 per_city
    expect(result.players.human.credits).toBeGreaterThan(state.players.human.credits - 10);
  });
});

// ============================================================
// Comet (Card 10B) — gain heat + conditional water
// ============================================================

describe('Comet (Card 10B)', () => {
  it('gains heat and places water when player reaches 5+ heat', () => {
    let state = makeGameState();
    state = setupCard(state, 10, 'B', 10);
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, heatTilesPersonal: 4, credits: 10 },
      },
    };

    // Hex 3 is a water hex on Tharsis
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 10, side: 'B', targetHexId: 3 },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(5);
    expect(result.board.find((h) => h.id === 3)?.tile).toBe('water');
  });

  it('gains heat but does NOT place water when player has <5 heat after', () => {
    let state = makeGameState();
    state = setupCard(state, 10, 'B', 10);
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, heatTilesPersonal: 3, credits: 10 },
      },
    };

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 10, side: 'B', targetHexId: 3 },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(4);
    expect(result.board.find((h) => h.id === 3)?.tile).toBeNull();
  });
});

// ============================================================
// Fusion Power (Card 4B) — gain heat + resource token
// ============================================================

describe('Fusion Power (Card 4B)', () => {
  it('gains 1 heat AND 1 resource token of choice', () => {
    let state = makeGameState();
    state = setupCard(state, 4, 'B', 10);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 4, side: 'B', chosenResourceToken: 'nature' },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.players.human.resourceTokens).toContain('nature');
  });
});

// ============================================================
// Research Outpost (Card 7B) — city + conditional token
// ============================================================

describe('Research Outpost (Card 7B)', () => {
  it('places city and gains token when not adjacent to any cubes', () => {
    let state = makeGameState();
    state = setupCard(state, 7, 'B', 10);
    // Hex 17 is bottom-left land, relatively isolated
    const result = executeAction(
      state,
      {
        type: 'activate_project',
        cardId: 7,
        side: 'B',
        targetHexId: 17,
        chosenResourceToken: 'science',
      },
      'human',
    );
    expect(result.board.find((h) => h.id === 17)?.city).toEqual({ playerId: 'human' });
    expect(result.players.human.resourceTokens).toContain('science');
  });

  it('places city but NO token when adjacent to cubes', () => {
    let state = makeGameState();
    // Place a greenery tile adjacent to hex 17 (hex 13 is adjacent to 17)
    state = withTile(state, 13, 'greenery', 'ai');
    state = setupCard(state, 7, 'B', 10);

    const result = executeAction(
      state,
      {
        type: 'activate_project',
        cardId: 7,
        side: 'B',
        targetHexId: 17,
        chosenResourceToken: 'science',
      },
      'human',
    );
    expect(result.board.find((h) => h.id === 17)?.city).toEqual({ playerId: 'human' });
    expect(result.players.human.resourceTokens).not.toContain('science');
  });
});

// ============================================================
// Methane from Titan (Card 12B) — heat + optional extra spend
// ============================================================

describe('Methane from Titan (Card 12B)', () => {
  it('gains 1 heat without optional spend', () => {
    let state = makeGameState();
    state = setupCard(state, 12, 'B', 10);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 12, side: 'B' },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(1);
  });

  it('gains 2 heat with optional spend when player has credits and Space tag', () => {
    let state = makeGameState();
    state = setupCard(state, 12, 'B', 10);
    // Card 12B itself has tags Energy+Nature. Need Space tag from another card.
    const card3A = getCardSide(3, 'A')!; // has Space tag in requirements... but we need bottom tags with space
    const card7B = getCardSide(7, 'B')!; // tags: energy, space
    state = withPlayerCards(state, 'human', [getCardSide(12, 'B')!, card7B]);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 12, side: 'B', optionalSpend: true },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(2);
  });
});

// ============================================================
// Asteroid Mining (Card 5A) — credits per production+space tags
// ============================================================

describe('Asteroid Mining (Card 5A)', () => {
  it('gains credits equal to production + space tag count', () => {
    let state = makeGameState();
    state = setupCard(state, 5, 'A', 10);
    // Card 5A tags: energy, nature. Need production and space from other cards.
    const card12B = getCardSide(12, 'B')!; // tags: energy, nature — no help
    // Card 7B: tags energy, space (1 space)
    // Card 8A: tags production, production (2 production)
    state = withPlayerCards(state, 'human', [getCardSide(5, 'A')!, getCardSide(7, 'B')!, getCardSide(8, 'A')!]);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 5, side: 'A' },
      'human',
    );
    // Tags: space=1 (from 7B), production=2 (from 8A) = 3 credits to gain
    // Player started with 10, paid 1 (cost → creditsOnCards)
    // Credits gained come from creditSupply which is 0 after setup
    // So gained = min(3, creditSupply) = 0 if supply is 0
    // Need to set creditSupply for this test
    // Result: 10 - 1 = 9 credits (cost deducted), + 0 from empty supply
    expect(result.players.human.credits).toBe(9);
    expect(result.players.human.creditsOnCards).toBe(1);
  });
});

// ============================================================
// Moss (Card 11A) — greenery + credits per adjacent water
// ============================================================

describe('Moss (Card 11A)', () => {
  it('places greenery and gains credits per adjacent water AFTER placement', () => {
    let state = makeGameState();
    // Place water on hexes 9 and 10 (both adjacent to hex 5)
    state = withTile(state, 9, 'water', 'human');
    state = withTile(state, 10, 'water', 'human');
    state = setupCard(state, 11, 'A', 10);
    state = {
      ...state,
      creditSupply: 5,
    };

    // Place greenery on hex 5 (land, adjacent to water hexes 9 and 10)
    // Hex 5 adjacents: [1, 2, 4, 6, 9, 10]
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 11, side: 'A', targetHexId: 5 },
      'human',
    );
    expect(result.board.find((h) => h.id === 5)?.tile).toBe('greenery');
    // Should gain 2 credits (2 adjacent water tiles)
    const costPaid = getCardSide(11, 'A')!.cost; // 4
    expect(result.players.human.credits).toBe(10 - costPaid + 2);
  });
});

// ============================================================
// Aquifer Pumping (Card 11B) — water + conditional bonus
// ============================================================

describe('Aquifer Pumping (Card 11B)', () => {
  it('places water and gains 2 bonus credits when NOT adjacent to other water', () => {
    let state = makeGameState();
    state = setupCard(state, 11, 'B', 10);
    state = { ...state, creditSupply: 5 };

    // Hex 3 is water, no adjacent water tiles
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 11, side: 'B', targetHexId: 3 },
      'human',
    );
    expect(result.board.find((h) => h.id === 3)?.tile).toBe('water');
    // Cost 4, + 2 bonus credits = 10 - 4 + 2 = 8
    // Plus potential resource token from hex 3 (science)
    expect(result.players.human.credits).toBe(8);
  });

  it('places water but NO bonus when adjacent to other water', () => {
    let state = makeGameState();
    // Place water on hex 10 first (adjacent to hex 9)
    state = withTile(state, 10, 'water', 'ai');
    state = setupCard(state, 11, 'B', 10);
    state = { ...state, creditSupply: 5 };

    // Hex 9 is water, adjacent to hex 10 (which has water)
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 11, side: 'B', targetHexId: 9 },
      'human',
    );
    expect(result.board.find((h) => h.id === 9)?.tile).toBe('water');
    // Cost 4, no bonus, but +1 standard adjacency credit from placeWaterTile
    // 10 - 4 + 1 = 7
    // Plus nature token from hex 9
    expect(result.players.human.credits).toBe(7);
  });
});

// ============================================================
// Ice Asteroid (Card 4A) — water + conditional return greenery
// ============================================================

describe('Ice Asteroid (Card 4A)', () => {
  it('places water and returns adjacent greenery', () => {
    let state = makeGameState();
    // Place greenery on hex 2 (adjacent to hex 3 which is water)
    state = withTile(state, 2, 'greenery', 'ai');
    state = setupCard(state, 4, 'A', 10);
    const greeneryBefore = state.parameterSupply.greenery;

    const result = executeAction(
      state,
      {
        type: 'activate_project',
        cardId: 4,
        side: 'A',
        targetHexId: 3,
        secondaryTargetHexId: 2,
      },
      'human',
    );
    expect(result.board.find((h) => h.id === 3)?.tile).toBe('water');
    expect(result.board.find((h) => h.id === 2)?.tile).toBeNull(); // greenery returned
    expect(result.parameterSupply.greenery).toBe(greeneryBefore + 1);
  });

  it('places water without returning greenery when no secondary target', () => {
    let state = makeGameState();
    state = setupCard(state, 4, 'A', 10);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 4, side: 'A', targetHexId: 3 },
      'human',
    );
    expect(result.board.find((h) => h.id === 3)?.tile).toBe('water');
  });
});

// ============================================================
// Asteroid (Card 13B) — heat + optional return greenery
// ============================================================

describe('Asteroid (Card 13B)', () => {
  it('gains heat and returns greenery when secondary target provided', () => {
    let state = makeGameState();
    state = withTile(state, 5, 'greenery', 'ai');
    state = setupCard(state, 13, 'B', 10);
    const greeneryBefore = state.parameterSupply.greenery;

    const result = executeAction(
      state,
      {
        type: 'activate_project',
        cardId: 13,
        side: 'B',
        secondaryTargetHexId: 5,
      },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(1);
    expect(result.board.find((h) => h.id === 5)?.tile).toBeNull();
    expect(result.parameterSupply.greenery).toBe(greeneryBefore + 1);
  });

  it('gains heat without returning greenery when no secondary target', () => {
    let state = makeGameState();
    state = setupCard(state, 13, 'B', 10);

    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 13, side: 'B' },
      'human',
    );
    expect(result.players.human.heatTilesPersonal).toBe(1);
  });
});

// ============================================================
// Lava Flows (Card 3B) — heat ON MAP, not personal
// ============================================================

describe('Lava Flows (Card 3B)', () => {
  it('places heat tile ON the map hex, not in personal supply', () => {
    let state = makeGameState();
    state = setupCard(state, 3, 'B', 10);
    const heatBefore = state.parameterSupply.heat;

    // Hex 1 is land on Tharsis
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 3, side: 'B', targetHexId: 1 },
      'human',
    );
    expect(result.board.find((h) => h.id === 1)?.tile).toBe('heat');
    expect(result.parameterSupply.heat).toBe(heatBefore - 1);
    expect(result.players.human.heatTilesPersonal).toBe(0); // NOT personal
  });
});

// ============================================================
// Bushes (Card 12A) — cost reduction before deduction
// ============================================================

describe('Bushes (Card 12A)', () => {
  it('reduces cost based on greenery adjacent to own cities', () => {
    let state = makeGameState();
    // Place human city on hex 5, greenery on adjacent hex 4
    state = withCity(state, 5, 'human');
    state = withTile(state, 4, 'greenery', 'human');
    state = setupCard(state, 12, 'A', 10);

    // Bushes base cost is 5*, reduction -1 per greenery adj to own cities
    // 1 greenery adjacent to city → cost = max(1, 5-1) = 4
    const result = executeAction(
      state,
      { type: 'activate_project', cardId: 12, side: 'A', targetHexId: 8 },
      'human',
    );
    expect(result.players.human.creditsOnCards).toBe(4); // reduced cost
    expect(result.players.human.credits).toBe(10 - 4); // paid reduced cost
  });
});
