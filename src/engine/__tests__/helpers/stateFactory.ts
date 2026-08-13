// ============================================================
// Test State Factory — builder functions for unit tests
// All functions return new objects (no mutation).
// ============================================================

import type {
  GameState,
  PlayerState,
  HexState,
  HexId,
  ParameterTileType,
  CardSide,
  TagType,
  DraftedCard,
  MapRow,
} from '../../types';
import { THARSIS_HEXES } from '../../maps';

// ============================================================
// PlayerState builder
// ============================================================

export function makePlayerState(overrides?: Partial<PlayerState>): PlayerState {
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

// ============================================================
// Board builder from Tharsis map
// ============================================================

/**
 * Creates 19 HexState objects from the Tharsis map definition.
 * Optional `placements` map lets you override individual hexes by ID.
 */
export function makeBoardFromTharsis(
  placements?: Partial<Record<HexId, Partial<HexState>>>,
): HexState[] {
  const board: HexState[] = THARSIS_HEXES.map((hex) => ({
    id: hex.id,
    type: hex.type,
    bonusTag: hex.bonusTag,
    resourceTokenIcon: hex.resourceTokenIcon,
    tile: null,
    tilePlacedBy: null,
    city: null,
    row: hex.mapRow,
    adjacentHexIds: hex.adjacentIds,
  }));

  if (placements) {
    for (const [idStr, overrides] of Object.entries(placements)) {
      const id = Number(idStr);
      const idx = board.findIndex((h) => h.id === id);
      if (idx !== -1 && overrides) {
        board[idx] = { ...board[idx], ...overrides };
      }
    }
  }

  return board;
}

// ============================================================
// Full GameState builder
// ============================================================

export function makeGameState(overrides?: Partial<GameState>): GameState {
  const board = makeBoardFromTharsis();

  const human = makePlayerState({ id: 'human', color: 'white' });
  const ai = makePlayerState({ id: 'ai', color: 'black' });

  const base: GameState = {
    id: 'test-game',
    map: 'tharsis',
    matchType: 'human-vs-ai',
    generation: 1,
    phase: 'action',
    startPlayerId: 'human',
    players: { human, ai },
    board,
    parameterSupply: { heat: 11, greenery: 7, water: 4 },
    resourceTokenSupply: { nature: 2, production: 1, science: 1 },
    creditSupply: 0,
    deck: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    discard: [],
    currentCards: [],
    turnOrder: ['human', 'ai'],
    passedPlayers: [],
    actionLog: [],
    aiLog: [],
    endCondition: null,
    winner: null,
  };

  if (!overrides) return base;

  // Deep-merge players if provided
  const merged: GameState = {
    ...base,
    ...overrides,
    players: {
      human: overrides.players?.human
        ? { ...base.players.human, ...overrides.players.human }
        : base.players.human,
      ai: overrides.players?.ai
        ? { ...base.players.ai, ...overrides.players.ai }
        : base.players.ai,
    },
    parameterSupply: overrides.parameterSupply
      ? { ...base.parameterSupply, ...overrides.parameterSupply }
      : base.parameterSupply,
    resourceTokenSupply: overrides.resourceTokenSupply
      ? { ...base.resourceTokenSupply, ...overrides.resourceTokenSupply }
      : base.resourceTokenSupply,
  };

  return merged;
}

// ============================================================
// Immutable state transformers
// ============================================================

/**
 * Returns new state with a city placed on the given hex for the given player.
 * Updates both the board hex and the player's cities array.
 */
export function withCity(
  state: GameState,
  hexId: HexId,
  playerId: string,
): GameState {
  const newBoard = state.board.map((hex) =>
    hex.id === hexId
      ? { ...hex, city: { playerId } }
      : hex,
  );

  const pid = playerId as 'human' | 'ai';
  const player = state.players[pid];
  const updatedPlayer: PlayerState = {
    ...player,
    cities: [...player.cities, hexId],
  };

  return {
    ...state,
    board: newBoard,
    players: {
      ...state.players,
      [pid]: updatedPlayer,
    },
  };
}

/**
 * Returns new state with a parameter tile placed on the given hex.
 * Updates the board hex and decrements the corresponding parameter supply.
 */
export function withTile(
  state: GameState,
  hexId: HexId,
  tileType: ParameterTileType,
  playerId: string,
): GameState {
  const newBoard = state.board.map((hex) =>
    hex.id === hexId
      ? { ...hex, tile: tileType, tilePlacedBy: playerId }
      : hex,
  );

  const newSupply = { ...state.parameterSupply };
  newSupply[tileType] = Math.max(0, newSupply[tileType] - 1);

  return {
    ...state,
    board: newBoard,
    parameterSupply: newSupply,
  };
}

/**
 * Returns new state with the player's projectCardsFacing set to the given card sides.
 */
export function withPlayerCards(
  state: GameState,
  playerId: string,
  cardSides: CardSide[],
): GameState {
  const pid = playerId as 'human' | 'ai';
  const player = state.players[pid];
  const updatedPlayer: PlayerState = {
    ...player,
    projectCardsFacing: [...cardSides],
  };

  return {
    ...state,
    players: {
      ...state.players,
      [pid]: updatedPlayer,
    },
  };
}
