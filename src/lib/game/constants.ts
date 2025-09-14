import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Player, PlayerProjectCard } from './types';

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
        case 19: hex.bonusTag = 'Space'; hex.frameColor = 'gray'; break;
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
      case 4: hex.bonusTag = 'Space'; hex.frameColor = 'gray'; break;
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
        type: 'Heat',
        tags: ['Energy', 'Science'],
        effects: {
            White: {
                description: 'Gain 2 Heat cubes. Requires 1 Science tag.',
                cost: 4,
                requirements: { tags: { Science: 1 } },
                effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
            },
            Black: {
                description: 'Gain 1 Heat cube.',
                cost: 2,
                requirements: {},
                effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
            }
        }
    },
    {
        id: 'proj-002',
        title: 'Asteroid Mining',
        type: 'Grey',
        tags: ['Production', 'Space'],
        effects: {
            White: {
                description: 'Gain 3 Production resources.',
                cost: 8,
                requirements: {},
                effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
            },
            Black: {
                description: 'Gain 1 Production resource.',
                cost: 3,
                requirements: {},
                effect: (gs, p) => ({ newGameState: gs, newPlayer: p }), // Placeholder
            }
        }
    },
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

  const humanPlayerId = isHumanWhite ? 'White' : 'Black';
  const aiPlayerId = isHumanWhite ? 'Black' : 'White';

  // Placeholder for project card setup
  const humanProjectCards: PlayerProjectCard[] = [
    { card: PROJECT_CARDS[0], facingPlayerId: humanPlayerId, usedThisGeneration: false },
    { card: PROJECT_CARDS[1], facingPlayerId: humanPlayerId, usedThisGeneration: false },
  ];

  const aiProjectCards: PlayerProjectCard[] = [
      { card: PROJECT_CARDS[0], facingPlayerId: aiPlayerId, usedThisGeneration: false },
      { card: PROJECT_CARDS[1], facingPlayerId: aiPlayerId, usedThisGeneration: false },
  ];

  const humanPlayer: Player = {
    id: humanPlayerId,
    isAI: false,
    credits: 5,
    resources: { Nature: 2, Production: 1, Science: 1 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: humanProjectCards,
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[playerMapId])),
  };

  const aiPlayer: Player = {
    id: aiPlayerId,
    isAI: true,
    credits: 5,
    resources: { Nature: 2, Production: 1, Science: 1 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: aiProjectCards,
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
