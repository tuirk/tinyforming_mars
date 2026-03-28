// ============================================================
// TINYforming Mars — Game State Initialization & Research Phase
// Tasks 1A.4 (initialization) + 1A.15 (research phase)
// ============================================================

import type {
  GameState,
  MapId,
  PlayerColor,
  PlayerState,
  HexState,
  CardId,
  CardSideId,
  DraftedCard,
} from './types';
import { getMapHexes } from './maps';
import { getCardSide } from './cards';

// ============================================================
// Internal helper — Fisher-Yates shuffle (pure, returns new array)
// ============================================================

function defaultShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

// ============================================================
// Game Initialization (Task 1A.4)
// ============================================================

/** Create a fresh game state with random map and color assignment */
export function createInitialState(): GameState {
  // Random map selection (coin flip)
  const map: MapId = Math.random() < 0.5 ? 'tharsis' : 'elysium';

  // Random color assignment (coin flip)
  const humanColor: PlayerColor = Math.random() < 0.5 ? 'white' : 'black';

  return createGameState(map, humanColor);
}

/** Create a game state with specific map and color (for testing) */
export function createGameState(
  map: MapId,
  humanColor: PlayerColor,
  shuffleFn?: <T>(arr: T[]) => T[],
): GameState {
  const shuffle = shuffleFn ?? defaultShuffle;

  // 1. Build board from map hex definitions
  const hexDefs = getMapHexes(map);
  const board: HexState[] = hexDefs.map((hex) => ({
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

  // 2. Determine player colors
  const aiColor: PlayerColor = humanColor === 'white' ? 'black' : 'white';

  const humanPlayer: PlayerState = {
    id: 'human',
    color: humanColor,
    credits: 5,
    heatTilesPersonal: 0,
    cities: [],
    resourceTokens: [],
    projectCardsFacing: [],
    usedProjectThisGen: [],
    usedStandardProjectThisGen: false,
    hasPassed: false,
    creditsOnCards: 0,
  };

  const aiPlayer: PlayerState = {
    id: 'ai',
    color: aiColor,
    credits: 5,
    heatTilesPersonal: 0,
    cities: [],
    resourceTokens: [],
    projectCardsFacing: [],
    usedProjectThisGen: [],
    usedStandardProjectThisGen: false,
    hasPassed: false,
    creditsOnCards: 0,
  };

  // 6. Shuffle deck [1..14]
  const allCardIds: CardId[] = Array.from({ length: 14 }, (_, i) => i + 1);
  const deck = shuffle(allCardIds);

  // 8. White goes first in generation 1
  const startPlayerId = humanColor === 'white' ? 'human' : 'ai';
  const otherId = startPlayerId === 'human' ? 'ai' : 'human';

  // 9. Turn order
  const turnOrder = [startPlayerId, otherId];

  // 11. Generate unique ID
  const id = crypto.randomUUID();

  return {
    id,
    map,
    generation: 1,
    phase: 'setup',
    startPlayerId,
    players: {
      human: humanPlayer,
      ai: aiPlayer,
    },
    board,
    parameterSupply: { heat: 11, greenery: 7, water: 4 },
    resourceTokenSupply: { nature: 2, production: 1, science: 1 },
    creditSupply: 0, // 10 total - 5 per player
    deck,
    discard: [],
    currentCards: [],
    turnOrder,
    passedPlayers: [],
    actionLog: [],
    aiLog: [],
    endCondition: null,
    winner: null,
  };
}

// ============================================================
// Research Phase (Task 1A.15)
// ============================================================

/**
 * Draw 3 cards from the deck for research.
 * If the deck is empty, shuffles the discard pile into the deck first.
 */
export function drawCardsForResearch(
  state: GameState,
): { newState: GameState; drawnCardIds: [CardId, CardId, CardId] } {
  let deck = [...state.deck];
  let discard = [...state.discard];

  // If deck has fewer than 3 cards, shuffle discard into deck
  if (deck.length < 3) {
    deck = [...deck, ...defaultShuffle(discard)];
    discard = [];
  }

  // Draw up to 3 cards from the top of the deck
  const count = Math.min(3, deck.length);
  const drawnCardIds = deck.splice(0, count) as [CardId, CardId, CardId];

  const newState: GameState = {
    ...state,
    deck,
    discard,
  };

  return { newState, drawnCardIds };
}

/**
 * Draft a card: assign which side faces human, push to currentCards,
 * and push the appropriate CardSide to each player's projectCardsFacing.
 */
export function draftCard(
  state: GameState,
  cardId: CardId,
  humanFacingSide: CardSideId,
): GameState {
  const aiFacingSide: CardSideId = humanFacingSide === 'A' ? 'B' : 'A';

  const drafted: DraftedCard = {
    cardId,
    humanSide: humanFacingSide,
    aiSide: aiFacingSide,
  };

  const humanCardSide = getCardSide(cardId, humanFacingSide);
  const aiCardSide = getCardSide(cardId, aiFacingSide);

  if (!humanCardSide || !aiCardSide) {
    throw new Error(`Card ${cardId} side ${humanFacingSide} not found`);
  }

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

/**
 * Begin the research phase for the current generation.
 * Sets phase to 'research', clears per-generation state, draws 3 cards.
 */
export function beginResearchPhase(state: GameState): GameState {
  // Clear previous generation's cards and per-gen flags
  const clearedState: GameState = {
    ...state,
    phase: 'research' as const,
    currentCards: [],
    passedPlayers: [],
    players: {
      human: {
        ...state.players.human,
        projectCardsFacing: [],
        usedProjectThisGen: [],
        usedStandardProjectThisGen: false,
        hasPassed: false,
        creditsOnCards: 0,
      },
      ai: {
        ...state.players.ai,
        projectCardsFacing: [],
        usedProjectThisGen: [],
        usedStandardProjectThisGen: false,
        hasPassed: false,
        creditsOnCards: 0,
      },
    },
  };

  // Draw 3 cards
  const { newState } = drawCardsForResearch(clearedState);
  return newState;
}

/**
 * Determine who drafts the current card based on how many cards
 * have been drafted so far. Starting player picks cards 0 and 2,
 * the other player picks card 1.
 */
export function getDraftingPlayerId(state: GameState): string {
  const drafted = state.currentCards.length;
  const startPlayer = state.startPlayerId;
  const otherPlayer = startPlayer === 'human' ? 'ai' : 'human';

  // Starting player picks 0 and 2, other picks 1
  if (drafted === 0 || drafted === 2) {
    return startPlayer;
  }
  return otherPlayer;
}
