import { describe, it, expect } from 'vitest';
import { makeGameState, withCity } from '../../engine/__tests__/helpers/stateFactory';
import { pickBestDraftSide, pickBestCityHex } from '../aiController';

describe('pickBestDraftSide', () => {
  it('gives the AI the cheaper side when both players have 3 credits (card 1)', () => {
    const state = makeGameState({
      phase: 'research',
      creditSupply: 4,
      players: {
        human: { credits: 3 } as any,
        ai: { credits: 3 } as any,
      },
    });
    const result = pickBestDraftSide(state, 1);
    expect(result.side).toBe('B');
  });

  it('prefers a new tag over a second production copy (card 1, AI on hex 1)', () => {
    let state = makeGameState({ phase: 'research', creditSupply: 0 });
    state = withCity(state, 1, 'ai');
    const result = pickBestDraftSide(state, 1);
    expect(result.side).toBe('A');
  });
});

describe('pickBestCityHex', () => {
  it('does not stack a second production bonus when a nature bonus is free', () => {
    let state = makeGameState();
    state = withCity(state, 1, 'human');
    const hex = pickBestCityHex(state);
    expect(hex).not.toBeNull();
    const placed = state.board.find((h) => h.id === hex);
    expect(placed?.bonusTag).not.toBe('production');
    expect(placed?.bonusTag).not.toBeNull();
  });
});
