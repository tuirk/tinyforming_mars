import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Hex } from './types';

const THARSIS_MAP_HEXES: MapData['hexes'] = [
  ...Array.from({ length: 19 }, (_, i) => {
      const hexId = i + 1;
      let hex: Hex = {
          id: hexId,
          type: 'land',
          cubes: [],
      };

      // Water hexes based on image
      if ([5, 6, 9, 11, 14].includes(hexId)) {
          hex.type = 'water';
      }

      // Special tags based on image
      if (hexId === 2) hex.bonusTag = 'Energy';
      if (hexId === 4 || hexId === 7 || hexId === 13 || hexId === 16) hex.bonusTag = 'Nature';
      if (hexId === 17) hex.bonusTag = 'Science';
      if (hexId === 18) hex.bonusTag = 'Production';

      return hex;
  }),
];


export const THARSIS_MAP: MapData = {
  id: 'Tharsis',
  name: 'Tharsis',
  hexes: THARSIS_MAP_HEXES,
};

const ELYSIUM_MAP_HEXES: MapData['hexes'] = Array.from({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: 'land' as 'land' | 'water',
    cubes: [],
    bonusTag: undefined,
  }))
  .map(hex => {
    switch (hex.id) {
      // Water hexes
      case 1: case 2: case 6: case 9: case 11:
        hex.type = 'water';
        break;
    }
    switch (hex.id) {
      // Bonus Tags
      case 1: hex.bonusTag = 'Science'; break;
      case 2: hex.bonusTag = 'Production'; break;
      case 4: hex.bonusTag = 'Building'; break;
      case 7: hex.bonusTag = 'Science'; break;
      case 9: case 10: case 11:
        hex.bonusTag = 'Nature'; break;
      case 14: case 16: case 17: case 19:
        hex.bonusTag = 'Production'; break;
    }
    return hex;
});


export const ELYSIUM_MAP: MapData = {
    id: 'Elysium',
    name: 'Elysium',
    hexes: ELYSIUM_MAP_HEXES,
};

export const MAPS: Record<MapId, MapData> = {
    Tharsis: THARSIS_MAP,
    Elysium: ELYSIUM_MAP,
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

export const getInitialGameState = (playerMap: MapId, aiMap: MapId): GameState => {
  const startingPlayer = 'White';
  
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
        map: { ...MAPS[playerMap], hexes: JSON.parse(JSON.stringify(MAPS[playerMap].hexes)) },
      },
      Black: {
        id: 'Black',
        credits: 5,
        resources: { Nature: 2, Production: 1, Science: 1 },
        parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
        projectCards: PROJECT_CARDS.slice(1, 4), // Give different cards for demo
        playedProjectCards: [],
        victoryPoints: 0,
        map: { ...MAPS[aiMap], hexes: JSON.parse(JSON.stringify(MAPS[aiMap].hexes)) },
      },
    },
    currentPlayer: startingPlayer,
    startingPlayer: startingPlayer,
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
