// ============================================================
// Unit tests — rules.ts (tag counting, cost, requirements, legal actions)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  countPlayerTags,
  countPermanentTags,
  computeSpentTokensForRequirements,
  calculateEffectiveCost,
  checkRequirements,
  getLegalActions,
  calculateParameterLevel,
  countMapTiles,
  getValidHexesForPlacement,
} from '../rules';
import { getCardSide } from '../cards';
import type { CardSide, PlayerState, GameState, DraftedCard } from '../types';
import {
  makeGameState,
  makePlayerState,
  makeBoardFromTharsis,
  withCity,
  withTile,
  withPlayerCards,
} from './helpers/stateFactory';

// ============================================================
// countPlayerTags
// ============================================================

describe('countPlayerTags', () => {
  it('counts tags from project card sides', () => {
    // Card 1 side A has tags: ['production', 'nature']
    const card1A = getCardSide(1, 'A')!;
    const state = makeGameState();
    const player = makePlayerState({ projectCardsFacing: [card1A] });
    const tags = countPlayerTags(player, state);

    expect(tags.production).toBe(1);
    expect(tags.nature).toBe(1);
    expect(tags.energy).toBe(0);
    expect(tags.science).toBe(0);
    expect(tags.space).toBe(0);
  });

  it('counts tags from multiple card sides', () => {
    // Card 1A: ['production', 'nature'], Card 2A: ['nature', 'nature']
    const card1A = getCardSide(1, 'A')!;
    const card2A = getCardSide(2, 'A')!;
    const state = makeGameState();
    const player = makePlayerState({ projectCardsFacing: [card1A, card2A] });
    const tags = countPlayerTags(player, state);

    expect(tags.production).toBe(1);
    expect(tags.nature).toBe(3); // 1 from card1A + 2 from card2A
  });

  it('counts bonus hex tags from cities', () => {
    // Hex 1 on Tharsis has bonusTag = 'production'
    let state = makeGameState();
    state = withCity(state, 1, 'human');
    const player = state.players.human;
    const tags = countPlayerTags(player, state);

    expect(tags.production).toBe(1); // bonus from hex 1
  });

  it('counts bonus hex tags from cities on nature bonus hexes', () => {
    // Hex 8 on Tharsis has bonusTag = 'nature'
    let state = makeGameState();
    state = withCity(state, 8, 'human');
    const player = state.players.human;
    const tags = countPlayerTags(player, state);

    expect(tags.nature).toBe(1);
  });

  it('counts resource tokens as matching tags', () => {
    const state = makeGameState();
    const player = makePlayerState({
      resourceTokens: ['nature', 'science'],
    });
    const tags = countPlayerTags(player, state);

    expect(tags.nature).toBe(1);
    expect(tags.science).toBe(1);
  });

  it('combines all sources: card tags + city bonus + resource tokens', () => {
    // Card 1A: ['production', 'nature']
    const card1A = getCardSide(1, 'A')!;
    let state = makeGameState();
    state = withCity(state, 1, 'human'); // hex 1 bonusTag = 'production'

    // Build player with card + resource token
    const player: PlayerState = {
      ...state.players.human,
      projectCardsFacing: [card1A],
      resourceTokens: ['production'],
    };

    const tags = countPlayerTags(player, state);
    expect(tags.production).toBe(3); // card + city + token
    expect(tags.nature).toBe(1);
  });
});

describe('computeSpentTokensForRequirements', () => {
  it('spends nothing when permanent tags cover requirements', () => {
    const card1A = getCardSide(1, 'A')!; // production, nature
    const state = makeGameState();
    const player = makePlayerState({
      projectCardsFacing: [card1A],
      resourceTokens: ['science'],
    });
    const spent = computeSpentTokensForRequirements(player, state, [
      { tag: 'production', count: 1 },
      { tag: 'nature', count: 1 },
    ]);
    expect(spent).toEqual([]);
  });

  it('spends only the shortfall beyond permanent tags', () => {
    // Card 2B tags: energy, nature — needs production + science for Solar Power
    const card2B = getCardSide(2, 'B')!;
    const state = makeGameState();
    const player = makePlayerState({
      projectCardsFacing: [card2B],
      resourceTokens: ['production', 'science', 'nature'],
    });
    const spent = computeSpentTokensForRequirements(player, state, [
      { tag: 'production', count: 1 },
      { tag: 'science', count: 1 },
    ]);
    expect(spent.sort()).toEqual(['production', 'science']);
  });

  it('does not invent energy/space tokens', () => {
    const state = makeGameState();
    const player = makePlayerState({ resourceTokens: ['nature'] });
    const spent = computeSpentTokensForRequirements(player, state, [
      { tag: 'energy', count: 1 },
    ]);
    expect(spent).toEqual([]);
  });

  it('countPermanentTags excludes held resource tokens', () => {
    const card1A = getCardSide(1, 'A')!;
    const state = makeGameState();
    const player = makePlayerState({
      projectCardsFacing: [card1A],
      resourceTokens: ['science', 'production'],
    });
    const permanent = countPermanentTags(player, state);
    expect(permanent.production).toBe(1);
    expect(permanent.science).toBe(0);
    expect(countPlayerTags(player, state).science).toBe(1);
  });
});

// ============================================================
// calculateEffectiveCost
// ============================================================

describe('calculateEffectiveCost', () => {
  it('returns base cost when no cost reduction', () => {
    // Card 1A: cost 3, no costReduction
    const card = getCardSide(1, 'A')!;
    const state = makeGameState();
    const player = makePlayerState();
    expect(calculateEffectiveCost(card, player, state)).toBe(3);
  });

  it('applies per_tag cost reduction', () => {
    // Card 3A (WATER FROM EUROPA): cost 3, per_tag space beyond 1 amount 1
    const card = getCardSide(3, 'A')!;
    const state = makeGameState();
    // Give player 3 space tags via card sides
    // Card 9A has tags: ['space', 'space'], so 2 space tags
    const card9A = getCardSide(9, 'A')!;
    const player = makePlayerState({ projectCardsFacing: [card9A] });
    // 2 space tags, beyond 1 = 1 excess, reduction = 1*1 = 1
    // effective cost = 3 - 1 = 2
    expect(calculateEffectiveCost(card, player, state)).toBe(2);
  });

  it('does not apply per_tag reduction from unspent resource tokens', () => {
    // GHG Factories 5B: cost 3, −1 per production tag beyond 2
    const ghg = getCardSide(5, 'B')!;
    const state = makeGameState();
    const card13B = getCardSide(13, 'B')!; // production, production
    const player = makePlayerState({
      projectCardsFacing: [card13B],
      resourceTokens: ['production'],
    });
    expect(calculateEffectiveCost(ghg, player, state)).toBe(3);
  });

  it('applies per_tile cost reduction', () => {
    // Card 8B (GREAT DAM): cost 3, per_tile water beyond 2 amount 1
    const card = getCardSide(8, 'B')!;
    let state = makeGameState();
    // Place 3 water tiles — hexes 3,9,10 are water hexes on Tharsis
    state = withTile(state, 3, 'water', 'human');
    state = withTile(state, 9, 'water', 'human');
    state = withTile(state, 10, 'water', 'human');
    const player = makePlayerState();
    // 3 water tiles, beyond 2 = 1 excess, reduction = 1*1 = 1
    // effective cost = 3 - 1 = 2
    expect(calculateEffectiveCost(card, player, state)).toBe(2);
  });

  it('applies per_city_on_row cost reduction', () => {
    // Card 2B (SOLAR POWER): cost 3, per_city_on_row center amount 1
    const card = getCardSide(2, 'B')!;
    let state = makeGameState();
    // Place a city on hex 5 (row 1 = center) — hex 5 is land
    state = withCity(state, 5, 'human');
    const player = makePlayerState();
    // 1 city on center row, reduction = 1*1 = 1
    // effective cost = 3 - 1 = 2
    expect(calculateEffectiveCost(card, player, state)).toBe(2);
  });

  it('applies per_adjacent_unoccupied cost reduction', () => {
    // Card 7A (WINDMILLS): cost 4, per_adjacent_unoccupied amount 1
    const card = getCardSide(7, 'A')!;
    let state = makeGameState();
    // Place a city on hex 8, which is adjacent to [4, 9, 13]
    state = withCity(state, 8, 'human');
    const player = state.players.human;
    // 3 adjacent hexes, all unoccupied => discount = 3
    // effective cost = 4 - 3 = 1
    expect(calculateEffectiveCost(card, player, state)).toBe(1);
  });

  it('applies per_heat_cubes cost reduction', () => {
    // Card 6B (GEOTHERMAL POWER): cost 3, per_heat_cubes divisor 2 amount 1
    const card = getCardSide(6, 'B')!;
    const state = makeGameState();
    const player = makePlayerState({ heatTilesPersonal: 4 });
    // floor(4/2) * 1 = 2, cost = 3 - 2 = 1
    expect(calculateEffectiveCost(card, player, state)).toBe(1);
  });

  it('applies per_greenery_adjacent_to_own_cities cost reduction', () => {
    // Card 12A (BUSHES): cost 5, per_greenery_adjacent_to_own_cities amount 1
    const card = getCardSide(12, 'A')!;
    let state = makeGameState();
    // Place city on hex 5 (land, center). Adjacent to hex 5: [1,2,4,6,9,10]
    state = withCity(state, 5, 'human');
    // Place greenery on hex 4 (land, adjacent to 5) and hex 2 (land, adjacent to 5)
    state = withTile(state, 4, 'greenery', 'human');
    state = withTile(state, 2, 'greenery', 'human');
    const player = state.players.human;
    // 2 greenery tiles adjacent to own cities => discount = 2
    // effective cost = 5 - 2 = 3
    expect(calculateEffectiveCost(card, player, state)).toBe(3);
  });

  it('enforces minimum cost of 1 when costReduction is present', () => {
    // Card 7A (WINDMILLS): cost 4, per_adjacent_unoccupied amount 1
    const card = getCardSide(7, 'A')!;
    let state = makeGameState();
    // Place city on hex 5 which has 6 adjacent hexes: [1,2,4,6,9,10]
    // All unoccupied => discount = 6, cost = 4 - 6 = -2 => clamped to 1
    state = withCity(state, 5, 'human');
    const player = state.players.human;
    expect(calculateEffectiveCost(card, player, state)).toBe(1);
  });
});

// ============================================================
// checkRequirements
// ============================================================

describe('checkRequirements', () => {
  it('returns canActivate true when all requirements met', () => {
    // Card 5A (ASTEROID MINING): cost 1, requires energy:1, no param reqs
    // Tags: ['energy', 'nature'] — effect is gain_credits (always has supply)
    const card = getCardSide(5, 'A')!;
    let state = makeGameState();
    // Give player the card so they have tags
    state = withPlayerCards(state, 'human', [card]);
    const player: PlayerState = {
      ...state.players.human,
      credits: 5,
    };
    const result = checkRequirements(player, state, card);
    expect(result.canActivate).toBe(true);
    expect(result.missingTags).toHaveLength(0);
    expect(result.insufficientCredits).toBe(false);
  });

  it('returns canActivate false when missing tags', () => {
    // Card 1A: requires energy:2, production:1
    const card = getCardSide(1, 'A')!;
    const state = makeGameState();
    // Player has NO tags at all
    const player = makePlayerState({ credits: 10 });
    const result = checkRequirements(player, state, card);
    expect(result.canActivate).toBe(false);
    expect(result.missingTags.length).toBeGreaterThan(0);
  });

  it('returns canActivate false when insufficient credits', () => {
    // Card 5A: cost 1, requires energy:1
    const card = getCardSide(5, 'A')!;
    let state = makeGameState();
    state = withPlayerCards(state, 'human', [card]);
    const player: PlayerState = {
      ...state.players.human,
      credits: 0, // not enough
    };
    const result = checkRequirements(player, state, card);
    expect(result.canActivate).toBe(false);
    expect(result.insufficientCredits).toBe(true);
  });

  it('checks parameter requirements (heat = personal + map)', () => {
    // Card 1A: parameterRequirements: [{ type: 'heat', count: 5 }]
    const card = getCardSide(1, 'A')!;
    let state = makeGameState();

    // Give player the required tags: energy:2, production:1
    // Card 4A tags: ['energy', 'production'], Card 5A tags: ['energy', 'nature']
    const card4A = getCardSide(4, 'A')!;
    const card5A = getCardSide(5, 'A')!;
    state = withPlayerCards(state, 'human', [card4A, card5A]);

    // Set heat: 2 personal + 2 on map = 4, need 5
    const player: PlayerState = {
      ...state.players.human,
      credits: 10,
      heatTilesPersonal: 2,
    };
    // Place 2 heat tiles on land hexes
    state = withTile(state, 4, 'heat', 'human');
    state = withTile(state, 5, 'heat', 'human');
    // Total heat level = 2 (personal human) + 0 (personal ai) + 2 (map) = 4 < 5
    const result = checkRequirements(player, state, card);
    expect(result.canActivate).toBe(false);
    expect(result.missingParams.length).toBeGreaterThan(0);
  });

  it('meets parameter requirement when heat is sufficient', () => {
    // Card 1A: parameterRequirements: [{ type: 'heat', count: 5 }]
    const card = getCardSide(1, 'A')!;
    let state = makeGameState();

    // Tags: energy:2, production:1
    const card4A = getCardSide(4, 'A')!;
    const card5A = getCardSide(5, 'A')!;
    state = withPlayerCards(state, 'human', [card4A, card5A]);

    // Set heat: 3 personal (must update IN state) + 3 on map = 6 >= 5
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 10, heatTilesPersonal: 3 },
      },
    };
    state = withTile(state, 4, 'heat', 'human');
    state = withTile(state, 5, 'heat', 'human');
    state = withTile(state, 6, 'heat', 'human');
    // Heat = 3(personal human) + 0(personal ai) + 3(map) = 6 >= 5
    const player = state.players.human;
    const result = checkRequirements(player, state, card);
    expect(result.missingParams).toHaveLength(0);
    expect(result.missingTags).toHaveLength(0);
    expect(result.insufficientCredits).toBe(false);
  });

  it('applies ParameterReduction for Insects card', () => {
    // Card 14A (INSECTS): paramReq heat:6, parameterReduction: heat per science beyond 1, -2 per tag, minimum 0
    const card = getCardSide(14, 'A')!;
    let state = makeGameState();

    // Need tags: nature:1, science:2
    // Card 10A: ['science', 'science'] — gives 2 science
    // Card 1A: ['production', 'nature'] — gives 1 nature
    const card10A = getCardSide(10, 'A')!;
    const card1A = getCardSide(1, 'A')!;
    state = withPlayerCards(state, 'human', [card10A, card1A]);
    // science=2, beyond 1 => 1 excess, reduction = 1*2 = 2
    // effective heat req = 6 - 2 = 4

    // Update player heat IN the state (calculateParameterLevel reads from state.players)
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 10, heatTilesPersonal: 2 },
      },
    };

    // Place 2 heat tiles on map for total heat = 2(personal) + 2(map) = 4 >= 4
    state = withTile(state, 4, 'heat', 'human');
    state = withTile(state, 5, 'heat', 'human');

    const player = state.players.human;
    const result = checkRequirements(player, state, card);
    expect(result.missingParams).toHaveLength(0);
  });

  it('Insects card fails when heat insufficient even after reduction', () => {
    const card = getCardSide(14, 'A')!;
    let state = makeGameState();

    // science:2 => reduction 2, effective req = 4
    const card10A = getCardSide(10, 'A')!;
    const card1A = getCardSide(1, 'A')!;
    state = withPlayerCards(state, 'human', [card10A, card1A]);

    const player: PlayerState = {
      ...state.players.human,
      credits: 10,
      heatTilesPersonal: 1,
    };
    // Only 1 heat on map => total heat = 1+1 = 2 < 4
    state = withTile(state, 4, 'heat', 'human');

    const result = checkRequirements(player, state, card);
    expect(result.missingParams.length).toBeGreaterThan(0);
  });
});

// ============================================================
// calculateParameterLevel & countMapTiles
// ============================================================

describe('calculateParameterLevel', () => {
  it('heat level = personal heat (both players) + heat tiles on map', () => {
    let state = makeGameState({
      players: {
        human: makePlayerState({ heatTilesPersonal: 2 }),
        ai: makePlayerState({ id: 'ai', color: 'black', heatTilesPersonal: 1 }),
      },
    });
    state = withTile(state, 4, 'heat', 'human');
    // Heat = 2 + 1 + 1 = 4
    expect(calculateParameterLevel(state, 'heat')).toBe(4);
  });

  it('greenery level = greenery tiles on map', () => {
    let state = makeGameState();
    state = withTile(state, 4, 'greenery', 'human');
    state = withTile(state, 5, 'greenery', 'ai');
    expect(calculateParameterLevel(state, 'greenery')).toBe(2);
  });

  it('water level = water tiles on map', () => {
    let state = makeGameState();
    // Hex 3 is a water hex on Tharsis
    state = withTile(state, 3, 'water', 'human');
    expect(calculateParameterLevel(state, 'water')).toBe(1);
  });
});

describe('countMapTiles', () => {
  it('returns 0 when no tiles placed', () => {
    const state = makeGameState();
    expect(countMapTiles(state, 'heat')).toBe(0);
    expect(countMapTiles(state, 'greenery')).toBe(0);
    expect(countMapTiles(state, 'water')).toBe(0);
  });

  it('counts only tiles of the specified type', () => {
    let state = makeGameState();
    state = withTile(state, 4, 'heat', 'human');
    state = withTile(state, 5, 'greenery', 'human');
    state = withTile(state, 3, 'water', 'human');
    expect(countMapTiles(state, 'heat')).toBe(1);
    expect(countMapTiles(state, 'greenery')).toBe(1);
    expect(countMapTiles(state, 'water')).toBe(1);
  });
});

// ============================================================
// getLegalActions
// ============================================================

describe('getLegalActions', () => {
  it('always includes pass when player has not passed', () => {
    const state = makeGameState({ phase: 'action' });
    const actions = getLegalActions(state, 'human');
    const passActions = actions.filter((a) => a.type === 'pass');
    expect(passActions).toHaveLength(1);
  });

  it('returns no actions when player has passed', () => {
    const state = makeGameState({
      phase: 'action',
      players: {
        human: makePlayerState({ hasPassed: true }),
        ai: makePlayerState({ id: 'ai', color: 'black' }),
      },
    });
    const actions = getLegalActions(state, 'human');
    expect(actions).toHaveLength(0);
  });

  it('includes affordable project card actions', () => {
    // Card 5A: cost 1, requires energy:1, effect = gain_credits
    const card5A = getCardSide(5, 'A')!;
    const card5B = getCardSide(5, 'B')!;
    let state = makeGameState({
      phase: 'action',
      currentCards: [{ cardId: 5, humanSide: 'A', aiSide: 'B' }],
    });
    // Give human the card and required tags
    // Card 5A tags: ['energy', 'nature'] — requires energy:1
    // The card's own tags count, so having it as projectCardsFacing gives energy:1
    state = withPlayerCards(state, 'human', [card5A]);
    // Also set the AI's card side
    state = withPlayerCards(state, 'ai', [card5B]);
    // Ensure player has credits
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
    };

    const actions = getLegalActions(state, 'human');
    const projectActions = actions.filter((a) => a.type === 'activate_project');
    expect(projectActions.length).toBeGreaterThan(0);
    expect(projectActions[0].type === 'activate_project' && projectActions[0].cardId).toBe(5);
  });

  it('excludes already used project card', () => {
    const card5A = getCardSide(5, 'A')!;
    let state = makeGameState({
      phase: 'action',
      currentCards: [{ cardId: 5, humanSide: 'A', aiSide: 'B' }],
    });
    state = withPlayerCards(state, 'human', [card5A]);
    state = {
      ...state,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          usedProjectThisGen: [5], // already used card 5
        },
      },
    };

    const actions = getLegalActions(state, 'human');
    const projectActions = actions.filter(
      (a) => a.type === 'activate_project' && a.cardId === 5,
    );
    expect(projectActions).toHaveLength(0);
  });

  it('excludes unaffordable project card', () => {
    const card5A = getCardSide(5, 'A')!;
    let state = makeGameState({
      phase: 'action',
      currentCards: [{ cardId: 5, humanSide: 'A', aiSide: 'B' }],
    });
    state = withPlayerCards(state, 'human', [card5A]);
    state = {
      ...state,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 0, // cannot afford
        },
      },
    };

    const actions = getLegalActions(state, 'human');
    const projectActions = actions.filter(
      (a) => a.type === 'activate_project' && a.cardId === 5,
    );
    expect(projectActions).toHaveLength(0);
  });

  it('includes standard project when requirements met and not already used', () => {
    // sell_patent: cost 1, no tag requirements, need creditSupply > 0
    // (cost is 0; supply check is the real gate)
    let state = makeGameState({
      phase: 'action',
      creditSupply: 5,
    });
    state = {
      ...state,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          usedStandardProjectThisGen: false,
        },
      },
    };

    const actions = getLegalActions(state, 'human');
    const sellPatent = actions.filter(
      (a) => a.type === 'standard_project' && a.projectId === 'sell_patent',
    );
    expect(sellPatent.length).toBeGreaterThan(0);

    const aiActions = getLegalActions(state, 'ai');
    expect(
      aiActions.some((a) => a.type === 'standard_project' && a.projectId === 'sell_patent'),
    ).toBe(true);
  });

  it('excludes standard projects when already used one this generation', () => {
    let state = makeGameState({
      phase: 'action',
      creditSupply: 5,
    });
    state = {
      ...state,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 5,
          usedStandardProjectThisGen: true,
        },
      },
    };

    const actions = getLegalActions(state, 'human');
    const standardActions = actions.filter((a) => a.type === 'standard_project');
    expect(standardActions).toHaveLength(0);
  });

  it('generates one action per valid hex for placement effects', () => {
    // Card 3B (LAVA FLOWS): cost 2, requires energy:2 + nature:1
    // effect: place_heat_on_map constraint hex_type=land
    const card3B = getCardSide(3, 'B')!;
    // Card 4A: ['energy', 'production'], Card 5A: ['energy', 'nature']
    const card4A = getCardSide(4, 'A')!;
    const card5A = getCardSide(5, 'A')!;

    let state = makeGameState({
      phase: 'action',
      currentCards: [{ cardId: 3, humanSide: 'B', aiSide: 'A' }],
    });
    state = withPlayerCards(state, 'human', [card3B, card4A, card5A]);
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 10 },
      },
    };

    const actions = getLegalActions(state, 'human');
    const projectActions = actions.filter(
      (a) => a.type === 'activate_project' && a.cardId === 3,
    );
    // Should have one action per unoccupied land hex
    // Tharsis has 14 land hexes (19 - 5 water)
    expect(projectActions.length).toBe(14);
    // Each should have a different targetHexId
    const hexIds = projectActions.map((a) =>
      a.type === 'activate_project' ? a.targetHexId : undefined,
    );
    const uniqueHexIds = new Set(hexIds);
    expect(uniqueHexIds.size).toBe(14);
  });
});

// ============================================================
// Ice Cap Melting — southern any hex (allow_any_hex)
// ============================================================

describe('getValidHexesForPlacement — Ice Cap Melting allow_any_hex', () => {
  const iceCapConstraint = { row: 'south' as const, allow_any_hex: true };

  it('allows southern land hexes for water placement', () => {
    const state = makeGameState();
    const valid = getValidHexesForPlacement(state, 'water', 'human', iceCapConstraint);
    // South land: 13, 14, 17, 18, 19; south water: 15, 16
    expect(valid).toEqual(expect.arrayContaining([13, 14, 15, 16, 17, 18, 19]));
    expect(valid).toHaveLength(7);
  });

  it('rejects non-southern hexes even with allow_any_hex', () => {
    const state = makeGameState();
    const valid = getValidHexesForPlacement(state, 'water', 'human', iceCapConstraint);
    expect(valid).not.toContain(1); // north/center land
    expect(valid).not.toContain(3); // water but not south
  });

  it('without allow_any_hex, only southern water hexes are valid', () => {
    const state = makeGameState();
    const valid = getValidHexesForPlacement(state, 'water', 'human', { row: 'south' });
    expect(valid.sort()).toEqual([15, 16]);
  });
});

// ============================================================
// Comet (10B) — optional water legal moves
// ============================================================

describe('getLegalActions — Comet optional water', () => {
  function setupComet(heat: number): GameState {
    const comet = getCardSide(10, 'B')!;
    // Comet requires energy:1 + space:1; card tags are nature/nature only
    const energySpace = getCardSide(7, 'B')!; // energy, space
    return {
      ...makeGameState(),
      currentCards: [{ cardId: 10, humanSide: 'B', aiSide: 'A' }],
      players: {
        human: makePlayerState({
          credits: 10,
          heatTilesPersonal: heat,
          projectCardsFacing: [comet, energySpace],
        }),
        ai: makePlayerState({ id: 'ai', color: 'black' }),
      },
    };
  }

  it('emits heat-only action when post-gain heat < 5', () => {
    const state = setupComet(3);
    const actions = getLegalActions(state, 'human').filter(
      (a) => a.type === 'activate_project' && a.cardId === 10,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ type: 'activate_project', cardId: 10, side: 'B' });
    expect(actions[0].type === 'activate_project' && actions[0].targetHexId).toBeUndefined();
  });

  it('emits heat-only plus water hex variants when post-gain heat >= 5', () => {
    const state = setupComet(4);
    const actions = getLegalActions(state, 'human').filter(
      (a) => a.type === 'activate_project' && a.cardId === 10,
    );
    const heatOnly = actions.filter(
      (a) => a.type === 'activate_project' && a.targetHexId === undefined,
    );
    const withWater = actions.filter(
      (a) => a.type === 'activate_project' && a.targetHexId !== undefined,
    );
    expect(heatOnly).toHaveLength(1);
    expect(withWater.length).toBeGreaterThan(0);
  });

  it('does not emit water variants when water supply is empty', () => {
    const state = {
      ...setupComet(4),
      parameterSupply: { heat: 11, greenery: 7, water: 0 },
    };
    const actions = getLegalActions(state, 'human').filter(
      (a) => a.type === 'activate_project' && a.cardId === 10,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].type === 'activate_project' && actions[0].targetHexId).toBeUndefined();
  });
});

// ============================================================
// City relocate — fromHexId legal moves
// ============================================================

describe('getLegalActions — city relocate fromHexId', () => {
  it('Build City emits fromHexId × targetHexId when player has 2 cities', () => {
    let state = makeGameState();
    state = withCity(state, 1, 'human');
    state = withCity(state, 17, 'human');
    // Build City requires production:1 + space:1
    // Card 8A: production, production; Card 7B: energy, space
    state = withPlayerCards(state, 'human', [getCardSide(8, 'A')!, getCardSide(7, 'B')!]);
    state = {
      ...state,
      players: {
        ...state.players,
        human: { ...state.players.human, credits: 5 },
      },
      creditSupply: 5,
    };

    const actions = getLegalActions(state, 'human').filter(
      (a) => a.type === 'standard_project' && a.projectId === 'build_city',
    );
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      expect(a.type).toBe('standard_project');
      if (a.type === 'standard_project') {
        expect([1, 17]).toContain(a.fromHexId);
        expect(a.targetHexId).toBeDefined();
      }
    }
    const fromIds = new Set(
      actions.map((a) => (a.type === 'standard_project' ? a.fromHexId : undefined)),
    );
    expect(fromIds.has(1)).toBe(true);
    expect(fromIds.has(17)).toBe(true);
  });

  it('excludes gain_heat project cards when heat supply is empty', () => {
    const card2B = getCardSide(2, 'B')!;
    let state = makeGameState({
      phase: 'action',
      currentCards: [{ cardId: 2, humanSide: 'B', aiSide: 'A' }],
      parameterSupply: { heat: 0, greenery: 7, water: 4 },
    });
    state = withPlayerCards(state, 'human', [card2B]);
    state = {
      ...state,
      players: {
        ...state.players,
        human: {
          ...state.players.human,
          credits: 10,
          resourceTokens: ['production', 'science'],
        },
      },
    };
    const actions = getLegalActions(state, 'human');
    expect(
      actions.some((a) => a.type === 'activate_project' && a.cardId === 2),
    ).toBe(false);
  });
});
