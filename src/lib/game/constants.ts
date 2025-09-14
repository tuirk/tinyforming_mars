
import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Player } from './types';

const THARSIS_MAP_HEXES: MapData['hexes'] = Array.from({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: 'land' as 'land' | 'water',
    cubes: [],
  }))
  .map(hex => {
    switch (hex.id) {
        case 1: hex.bonusTag = 'Production'; hex.frameColor = 'orange'; break;
        case 3: hex.type = 'water'; hex.bonusTag = 'Science'; break;
        case 8: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
        case 9: hex.type = 'water'; hex.bonusTag = 'Nature'; break;
        case 10: hex.type = 'water'; hex.bonusTag = 'Nature'; break;
        case 12: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
        case 15: hex.type = 'water'; hex.bonusTag = 'Nature'; break;
        case 16: hex.type = 'water'; break;
        case 17: hex.bonusTag = 'Production'; hex.frameColor = 'orange'; break;
        case 19: hex.bonusTag = 'Building'; hex.frameColor = 'gray'; break;
    }
    return hex;
});


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
      case 1: hex.type = 'water'; hex.bonusTag = 'Science'; break;
      case 2: hex.type = 'water'; hex.bonusTag = 'Production'; break;
      case 4: hex.bonusTag = 'Building'; hex.frameColor = 'gray'; break;
      case 6: hex.type = 'water'; break;
      case 7: hex.bonusTag = 'Science'; hex.frameColor = 'white'; break;
      case 9: hex.type = 'water'; hex.bonusTag = 'Nature'; break;
      case 10: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
      case 11: hex.type = 'water'; hex.bonusTag = 'Nature'; break;
      case 17: hex.bonusTag = 'Production'; hex.frameColor = 'orange'; break;
      case 19: hex.bonusTag = 'Production'; hex.frameColor = 'orange'; break;
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

export const getInitialGameState = (playerMapId: MapId, aiMapId: MapId): GameState => {
  const isHumanWhite = Math.random() < 0.5;

  const humanPlayer: Player = {
    id: isHumanWhite ? 'White' : 'Black',
    isAI: false,
    credits: 5,
    resources: { Nature: 0, Production: 0, Science: 0 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: PROJECT_CARDS.slice(0, 3),
    playedProjectCards: [],
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[playerMapId])),
  };

  const aiPlayer: Player = {
    id: isHumanWhite ? 'Black' : 'White',
    isAI: true,
    credits: 5,
    resources: { Nature: 0, Production: 0, Science: 0 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: PROJECT_CARDS.slice(1, 4),
    playedProjectCards: [],
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[aiMapId])),
  };

  const players = [humanPlayer, aiPlayer].sort((a, b) => a.id === 'White' ? -1 : 1);
  const startingPlayerIndex = players.findIndex(p => p.id === 'White');

  return {
    generation: 1,
    phase: 'Action',
    players,
    currentPlayerIndex: startingPlayerIndex,
    startingPlayerIndex: startingPlayerIndex,
    cubeSupply: {
      Water: 4,
      Greenery: 7,
      Heat: 11,
    },
    resourceSupply: {
        Nature: 2,
        Production: 1,
        Science: 1,
    },
    projectCardDeck: PROJECT_CARDS,
    isGameOver: false,
    passCount: 0,
  };
};
