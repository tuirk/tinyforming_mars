// ============================================================
// Unit tests — heuristic evaluation (Task 1C.1 / 1C.2)
// ============================================================

import { describe, it, expect } from 'vitest';
import { evaluate, getEndGameProximity, WEIGHTS } from '../heuristic';
import {
  makeGameState,
  withCity,
  withTile,
} from '../../engine/__tests__/helpers/stateFactory';

// ============================================================
// Tharsis map adjacency reference (for test clarity):
//   Hex 1  (land, bonus=production) adj [2, 4, 5]
//   Hex 2  (land)                   adj [1, 3, 5, 6]
//   Hex 4  (land)                   adj [1, 5, 8, 9]
//   Hex 5  (land)                   adj [1, 2, 4, 6, 9, 10]
//   Hex 8  (land, bonus=nature)     adj [4, 9, 13]
//   Hex 9  (water)                  adj [4, 5, 8, 10, 13, 14]
//   Hex 11 (land)                   adj [6, 7, 10, 12, 15, 16]
//   Hex 13 (land)                   adj [8, 9, 14, 17]
//   Hex 17 (land, bonus=production) adj [13, 14, 18]
// ============================================================

describe('evaluate', () => {
  it('returns score based on credits and tokens on empty board', () => {
    // No cities, no tiles — only credits (5 default) contribute
    const state = makeGameState();
    const proximity = getEndGameProximity(state);
    const positionalMul = 1 - proximity * 0.5;

    const score = evaluate(state, 'human');

    // credits (5 * 0.3 * positionalMul) + legal moves (pass=1 * 0.1 * positionalMul)
    const expected = 5 * WEIGHTS.credits * positionalMul
      + 1 * WEIGHTS.legalMoves * positionalMul; // only pass action
    expect(score).toBeCloseTo(expected, 5);
  });

  it('increases score for heat in personal supply', () => {
    const base = makeGameState();
    const withHeat = makeGameState({
      players: { human: { heatTilesPersonal: 3 } } as any,
    });

    const scoreBase = evaluate(base, 'human');
    const scoreHeat = evaluate(withHeat, 'human');

    expect(scoreHeat).toBeGreaterThan(scoreBase);
  });

  it('scores +2.0 (adjusted) for greenery adjacent to own city only', () => {
    // City on hex 5 (human), greenery on hex 1 (adjacent to 5)
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withTile(state, 1, 'greenery', 'human');

    const proximity = getEndGameProximity(state);
    const vpMul = 1 + proximity * 0.5;
    const positionalMul = 1 - proximity * 0.5;

    const score = evaluate(state, 'human');

    // greeneryExclusive (2.0 * vpMul) + credits (5 * 0.3 * posMul)
    // + cityOnBonusHex: hex 5 has no bonusTag = 0
    // + legalMoves
    // Verify the greenery contribution is positive and close to 2.0 * vpMul
    const stateNoGreenery = withCity(makeGameState(), 5, 'human');
    const scoreNoGreenery = evaluate(stateNoGreenery, 'human');
    const greeneryContribution = score - scoreNoGreenery;

    // The greenery uses 1 supply tile, changing proximity slightly, so use approximate
    expect(greeneryContribution).toBeCloseTo(
      WEIGHTS.greeneryExclusive * vpMul,
      0,
    );
  });

  it('scores +1.0 (adjusted) for greenery adjacent to both cities', () => {
    // Human city on hex 5, AI city on hex 4, greenery on hex 1 (adj to both)
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withCity(state, 4, 'ai');
    state = withTile(state, 1, 'greenery', 'human');

    const proximity = getEndGameProximity(state);
    const vpMul = 1 + proximity * 0.5;

    // Compare with same state but no greenery
    let stateNoGreen = makeGameState();
    stateNoGreen = withCity(stateNoGreen, 5, 'human');
    stateNoGreen = withCity(stateNoGreen, 4, 'ai');

    const diff = evaluate(state, 'human') - evaluate(stateNoGreen, 'human');
    expect(diff).toBeCloseTo(WEIGHTS.greeneryShared * vpMul, 0);
  });

  it('scores -1.0 (adjusted) for greenery adjacent to opponent city only', () => {
    // AI city on hex 4, greenery on hex 8 (adj to 4), human has no city
    let state = makeGameState();
    state = withCity(state, 4, 'ai');
    state = withTile(state, 8, 'greenery', 'ai');

    const proximity = getEndGameProximity(state);
    const vpMul = 1 + proximity * 0.5;

    // Compare with same state but no greenery
    let stateNoGreen = makeGameState();
    stateNoGreen = withCity(stateNoGreen, 4, 'ai');

    const diff = evaluate(state, 'human') - evaluate(stateNoGreen, 'human');
    expect(diff).toBeCloseTo(WEIGHTS.greeneryOpponentOnly * vpMul, 0);
  });

  it('scores -1.0 (adjusted) for heat on map adjacent to own city', () => {
    // Human city on hex 5, heat tile on hex 2 (adjacent to 5)
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withTile(state, 2, 'heat', 'human');

    const proximity = getEndGameProximity(state);
    const vpMul = 1 + proximity * 0.5;

    let stateNoHeat = makeGameState();
    stateNoHeat = withCity(stateNoHeat, 5, 'human');

    const diff = evaluate(state, 'human') - evaluate(stateNoHeat, 'human');
    expect(diff).toBeCloseTo(WEIGHTS.heatMapMyCity * vpMul, 0);
  });

  it('scores +1.5 (adjusted) for water adjacent to own city only', () => {
    // Human city on hex 5, water tile on hex 9 (water hex, adj to 5)
    let state = makeGameState();
    state = withCity(state, 5, 'human');
    state = withTile(state, 9, 'water', 'human');

    const proximity = getEndGameProximity(state);
    const vpMul = 1 + proximity * 0.5;

    let stateNoWater = makeGameState();
    stateNoWater = withCity(stateNoWater, 5, 'human');

    const diff = evaluate(state, 'human') - evaluate(stateNoWater, 'human');
    expect(diff).toBeCloseTo(WEIGHTS.waterExclusive * vpMul, 0);
  });

  it('adds bonus for city on a bonus hex', () => {
    // Hex 1 has bonusTag = 'production'
    let state = makeGameState();
    state = withCity(state, 1, 'human');

    let stateNonBonus = makeGameState();
    // Hex 2 has no bonusTag
    stateNonBonus = withCity(stateNonBonus, 2, 'human');

    const scoreBonus = evaluate(state, 'human');
    const scoreNonBonus = evaluate(stateNonBonus, 'human');

    expect(scoreBonus).toBeGreaterThan(scoreNonBonus);
  });

  it('adds score for resource tokens', () => {
    const base = makeGameState();
    const withTokens = makeGameState({
      players: {
        human: { resourceTokens: ['nature', 'science'] },
      } as any,
    });

    expect(evaluate(withTokens, 'human')).toBeGreaterThan(
      evaluate(base, 'human'),
    );
  });
});

// ============================================================
// getEndGameProximity
// ============================================================

describe('getEndGameProximity', () => {
  it('returns low proximity at generation 1 with full supplies', () => {
    const state = makeGameState({ generation: 1 });
    const prox = getEndGameProximity(state);

    // exhaustedParams = 0/3, occupiedHexes = 0/19, genProgress = 1/12
    // (0 + 0 + 1/12) / 3 = ~0.0278
    expect(prox).toBeCloseTo(1 / 36, 3);
    expect(prox).toBeLessThan(0.1);
  });

  it('returns higher proximity when parameter supplies are exhausted', () => {
    const stateEarly = makeGameState({ generation: 1 });
    const stateLate = makeGameState({
      generation: 6,
      parameterSupply: { heat: 0, greenery: 0, water: 4 },
    });

    const proxEarly = getEndGameProximity(stateEarly);
    const proxLate = getEndGameProximity(stateLate);

    expect(proxLate).toBeGreaterThan(proxEarly);
    // 2 exhausted params: (2/3 + 0/19 + 6/12) / 3 = (0.667 + 0 + 0.5) / 3 ~ 0.389
    expect(proxLate).toBeCloseTo((2 / 3 + 0 + 6 / 12) / 3, 3);
  });

  it('returns close to 1.0 when all end conditions are near', () => {
    // All supplies exhausted, most hexes occupied, generation 12
    let state = makeGameState({
      generation: 12,
      parameterSupply: { heat: 0, greenery: 0, water: 0 },
    });

    // Fill most hexes with cities or tiles to push occupiedHexes close to 1
    // Place cities on hexes 1, 5 (not adjacent)
    state = withCity(state, 1, 'human');
    state = withCity(state, 11, 'ai');
    // Place tiles on many land hexes
    for (const hexId of [2, 4, 6, 7, 8, 12, 13, 14, 17, 18]) {
      state = withTile(state, hexId, 'heat', 'human');
    }
    // Place water tiles on water hexes
    for (const hexId of [3, 9, 10, 15, 16]) {
      state = withTile(state, hexId, 'water', 'human');
    }

    const prox = getEndGameProximity(state);
    // 3/3 exhausted + 17/19 occupied + 12/12 generation = (1 + 0.895 + 1)/3 ~ 0.965
    expect(prox).toBeGreaterThan(0.9);
  });
});
