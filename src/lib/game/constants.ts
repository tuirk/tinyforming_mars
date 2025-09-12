import type { GameState, MapData, ProjectCardData, StandardProject } from './types';

const THARSIS_MAP_HEXES: MapData['hexes'] = [
  ...Array.from({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: [5, 7, 9, 11, 15].includes(i + 1) ? 'water' : 'land',
    cubes: [],
  })),
];

export const THARSIS_MAP: MapData = {
  name: 'Tharsis',
  hexes: THARSIS_MAP_HEXES,
};

export const PROJECT_CARDS: ProjectCardData[] = [
    {
        id: 'proj-001',
        title: 'Geothermal Vents',
        description: 'Gain 2 Heat cubes. Requires 1 Science tag.',
        cost: 4,
        tags: ['Energy'],
        requirements: { tags: { Science: 1 } },
        effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
    },
    {
        id: 'proj-002',
        title: 'Asteroid Mining',
        description: 'Gain 3 Production resources.',
        cost: 8,
        tags: ['Production'],
        requirements: {},
        effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
    },
    {
        id: 'proj-003',
        title: 'Research Outpost',
        description: 'Gain 1 Science resource for each Science tag you have.',
        cost: 6,
        tags: ['Science'],
        requirements: {},
        effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
    },
    {
        id: 'proj-004',
        title: 'Adapted Lichen',
        description: 'Place a Greenery cube. Requires 1 Nature tag.',
        cost: 5,
        tags: ['Nature'],
        requirements: { tags: { Nature: 1 } },
        effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
    }
];

export const STANDARD_PROJECTS: StandardProject[] = [
    {
        id: 'std-01',
        title: 'Sell Patent',
        description: 'Discard a Project Card to gain 2 Credits.',
        cost: 0,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-02',
        title: 'Build City',
        description: 'Place a city on a land hex.',
        cost: 10,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-03',
        title: 'Import Water',
        description: 'Place a Water cube.',
        cost: 6,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-04',
        title: 'Greenhouses',
        description: 'Place a Greenery cube.',
        cost: 7,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
];

export const getInitialGameState = (): GameState => {
  const startingPlayer = Math.random() < 0.5 ? 'White' : 'Black';
  
  return {
    generation: 1,
    phase: 'Action',
    players: {
      White: {
        id: 'White',
        credits: 5,
        resources: { Nature: 2, Production: 1, Science: 1 },
        parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
        projectCards: PROJECT_CARDS.slice(0, 3), // Give first 3 cards for demo
        playedProjectCards: [],
        victoryPoints: 0,
      },
      Black: {
        id: 'Black',
        credits: 5,
        resources: { Nature: 2, Production: 1, Science: 1 },
        parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
        projectCards: PROJECT_CARDS.slice(1, 4), // Give different cards for demo
        playedProjectCards: [],
        victoryPoints: 0,
      },
    },
    currentPlayer: startingPlayer,
    startingPlayer: startingPlayer,
    map: THARSIS_MAP,
    cubeSupply: {
      Water: 10,
      Greenery: 20,
      Heat: 30,
    },
    projectCardDeck: PROJECT_CARDS,
    isGameOver: false,
    passCount: 0,
  };
};
