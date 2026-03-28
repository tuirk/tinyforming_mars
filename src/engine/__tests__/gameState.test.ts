// ============================================================
// Unit tests — gameState.ts (initialization + research phase)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  createGameState,
  drawCardsForResearch,
  draftCard,
  getDraftingPlayerId,
  beginResearchPhase,
} from '../gameState';
import { THARSIS_HEXES } from '../maps';
import { makeGameState } from './helpers/stateFactory';

// Deterministic "no-op" shuffle for predictable deck order
const noShuffle = <T>(arr: T[]): T[] => [...arr];

// ============================================================
// createGameState
// ============================================================

describe('createGameState', () => {
  it('creates a board with 19 hexes', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.board).toHaveLength(19);
  });

  it('gives both players 5 starting credits', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.players.human.credits).toBe(5);
    expect(state.players.ai.credits).toBe(5);
  });

  it('sets credit supply to 0 after dealing starting credits', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.creditSupply).toBe(0);
  });

  it('sets parameter supplies correctly (heat:11, greenery:7, water:4)', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.parameterSupply).toEqual({
      heat: 11,
      greenery: 7,
      water: 4,
    });
  });

  it('sets resource token supplies correctly (nature:2, production:1, science:1)', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.resourceTokenSupply).toEqual({
      nature: 2,
      production: 1,
      science: 1,
    });
  });

  it('creates a deck with 14 card IDs', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.deck).toHaveLength(14);
    // With noShuffle the deck is [1..14]
    expect(state.deck).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('assigns white player to go first in generation 1 (human is white)', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.startPlayerId).toBe('human');
    expect(state.turnOrder[0]).toBe('human');
  });

  it('assigns white player to go first in generation 1 (ai is white)', () => {
    const state = createGameState('tharsis', 'black', noShuffle);
    expect(state.startPlayerId).toBe('ai');
    expect(state.turnOrder[0]).toBe('ai');
  });

  it('sets phase to setup', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.phase).toBe('setup');
  });

  it('board hex types match Tharsis map definition', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    for (const hexDef of THARSIS_HEXES) {
      const boardHex = state.board.find((h) => h.id === hexDef.id);
      expect(boardHex).toBeDefined();
      expect(boardHex!.type).toBe(hexDef.type);
      expect(boardHex!.bonusTag).toBe(hexDef.bonusTag);
    }
  });

  it('all board hexes start unoccupied (no tiles or cities)', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    for (const hex of state.board) {
      expect(hex.tile).toBeNull();
      expect(hex.city).toBeNull();
    }
  });

  it('starts at generation 1', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    expect(state.generation).toBe(1);
  });
});

// ============================================================
// Research phase
// ============================================================

describe('drawCardsForResearch', () => {
  it('draws 3 cards from the deck', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    const { newState, drawnCardIds } = drawCardsForResearch(state);

    expect(drawnCardIds).toHaveLength(3);
    expect(drawnCardIds).toEqual([1, 2, 3]); // noShuffle deck is [1..14]
    expect(newState.deck).toHaveLength(11);
  });

  it('removes drawn cards from deck', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    const { newState, drawnCardIds } = drawCardsForResearch(state);

    for (const id of drawnCardIds) {
      expect(newState.deck).not.toContain(id);
    }
  });
});

describe('draftCard', () => {
  it('adds the card to currentCards and both players projectCardsFacing', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    const drafted = draftCard(state, 1, 'A');

    expect(drafted.currentCards).toHaveLength(1);
    expect(drafted.currentCards[0].cardId).toBe(1);
    expect(drafted.currentCards[0].humanSide).toBe('A');
    expect(drafted.currentCards[0].aiSide).toBe('B');

    // Human sees side A, AI sees side B
    expect(drafted.players.human.projectCardsFacing).toHaveLength(1);
    expect(drafted.players.human.projectCardsFacing[0].side).toBe('A');
    expect(drafted.players.ai.projectCardsFacing).toHaveLength(1);
    expect(drafted.players.ai.projectCardsFacing[0].side).toBe('B');
  });

  it('appends to existing drafted cards', () => {
    let state = createGameState('tharsis', 'white', noShuffle);
    state = draftCard(state, 1, 'A');
    state = draftCard(state, 2, 'B');

    expect(state.currentCards).toHaveLength(2);
    expect(state.players.human.projectCardsFacing).toHaveLength(2);
    expect(state.players.ai.projectCardsFacing).toHaveLength(2);
  });
});

describe('getDraftingPlayerId', () => {
  it('starting player picks card 0 (first pick)', () => {
    const state = makeGameState({
      startPlayerId: 'human',
      currentCards: [],
    });
    expect(getDraftingPlayerId(state)).toBe('human');
  });

  it('other player picks card 1 (second pick)', () => {
    const state = makeGameState({
      startPlayerId: 'human',
      currentCards: [{ cardId: 1, humanSide: 'A', aiSide: 'B' }],
    });
    expect(getDraftingPlayerId(state)).toBe('ai');
  });

  it('starting player picks card 2 (third pick)', () => {
    const state = makeGameState({
      startPlayerId: 'human',
      currentCards: [
        { cardId: 1, humanSide: 'A', aiSide: 'B' },
        { cardId: 2, humanSide: 'A', aiSide: 'B' },
      ],
    });
    expect(getDraftingPlayerId(state)).toBe('human');
  });
});

describe('beginResearchPhase', () => {
  it('sets phase to research', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    const result = beginResearchPhase(state);
    expect(result.phase).toBe('research');
  });

  it('draws 3 cards from the deck (deck shrinks by 3)', () => {
    const state = createGameState('tharsis', 'white', noShuffle);
    const result = beginResearchPhase(state);
    expect(result.deck).toHaveLength(11);
  });

  it('clears previous generation per-gen state', () => {
    // Set up state as if previous generation had activity
    const state = makeGameState({
      phase: 'income',
      currentCards: [{ cardId: 1, humanSide: 'A', aiSide: 'B' }],
      passedPlayers: ['human'],
      players: {
        human: makePlayerStateForTest({
          usedProjectThisGen: [1],
          usedStandardProjectThisGen: true,
          hasPassed: true,
        }),
        ai: makePlayerStateForTest({
          id: 'ai',
          color: 'black',
        }),
      },
    });

    const result = beginResearchPhase(state);
    expect(result.currentCards).toHaveLength(0); // cleared before draw
    expect(result.passedPlayers).toHaveLength(0);
    expect(result.players.human.usedProjectThisGen).toHaveLength(0);
    expect(result.players.human.usedStandardProjectThisGen).toBe(false);
    expect(result.players.human.hasPassed).toBe(false);
  });
});

// local helper to avoid circular import
function makePlayerStateForTest(overrides?: Partial<import('../types').PlayerState>): import('../types').PlayerState {
  return {
    id: 'human',
    color: 'white',
    credits: 5,
    heatTilesPersonal: 0,
    cities: [],
    resourceTokens: [],
    projectCardsFacing: [],
    usedProjectThisGen: [],
    usedStandardProjectThisGen: false,
    hasPassed: false,
    creditsOnCards: 0,
    ...overrides,
  };
}
