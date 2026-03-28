// Game state initialization and management
// TODO: Implement in Phase 1A task 1A.4

import type { GameState, MapId, PlayerColor } from './types';

/** Create a fresh game state with random map and color assignment */
export function createInitialState(): GameState {
  // Random map selection (coin flip)
  const map: MapId = Math.random() < 0.5 ? 'tharsis' : 'elysium';

  // Random color assignment (coin flip)
  const humanColor: PlayerColor = Math.random() < 0.5 ? 'white' : 'black';

  return createGameState(map, humanColor);
}

/** Create a game state with specific map and color (for testing) */
export function createGameState(_map: MapId, _humanColor: PlayerColor): GameState {
  // TODO: Implement full initialization:
  // 1. Set up board from map hex definitions
  // 2. Assign colors
  // 3. Distribute starting credits (5 each from supply)
  // 4. Set up parameter supply (heat: 11, greenery: 7, water: 4)
  // 5. Set up resource token supply (nature: 2, production: 1, science: 1)
  // 6. Shuffle deck
  throw new Error('Not implemented — Phase 1A task 1A.4');
}
