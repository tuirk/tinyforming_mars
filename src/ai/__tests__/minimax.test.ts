import { describe, it, expect } from 'vitest';
import { minimaxSearch } from '../minimax';
import { makeGameState } from '../../engine/__tests__/helpers/stateFactory';
import { executeAction } from '../../engine/actions';

describe('minimaxSearch', () => {
  it('lets the unpassed player move twice after the AI has passed at depth 2', () => {
    let state = makeGameState({ phase: 'action', creditSupply: 10 });
    state = {
      ...state,
      players: {
        ...state.players,
        ai: { ...state.players.ai, hasPassed: true, credits: 0 },
        human: { ...state.players.human, hasPassed: false, credits: 5 },
      },
    };
    const passed = executeAction(state, { type: 'pass' }, 'ai');
    expect(passed.players.ai.hasPassed).toBe(true);
    const result = minimaxSearch(passed, 2, 'ai');
    expect(result.nodesEvaluated).toBeGreaterThan(2);
  });
});
