
import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Player, PlayerProjectCard, Tag } from './types';
import { drawSharedCardRound } from './state';

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


export const PROJECT_CARDS: ProjectCardData[] = Array.from({ length: 7 }, (_, i) => ({
  cardId: i + 1,
  sideA: {
    slot1: {
      id: `${i + 1}-A1`,
      name: `Card ${i + 1} Side A, Project 1`,
      cost: i + 1,
      tags: ["Space"],
      effect: "Placeholder effect A1."
    },
    slot2: {
      id: `${i + 1}-A2`,
      name: `Card ${i + 1} Side A, Project 2`,
      cost: i + 1,
      tags: ["Plant"],
      effect: "Placeholder effect A2."
    }
  },
  sideB: {
    slot1: {
      id: `${i + 1}-B1`,
      name: `Card ${i + 1} Side B, Project 1`,
      cost: i + 1,
      tags: ["Production", "Space"],
      effect: "Placeholder effect B1."
    },
    slot2: {
      id: `${i + 1}-B2`,
      name: `Card ${i + 1} Side B, Project 2`,
      cost: i + 1,
      tags: ["Production"],
      effect: "Placeholder effect B2."
    }
  }
}));

// Overwrite card 1 with specific data
PROJECT_CARDS[0] = {
  cardId: 1,
  sideA: {
    slot1: {
      id: "1-A1",
      name: "Methane From Titan",
      cost: 7,
      tags: ["Space"],
      requirements: ["heat >= 2", "space_tag >= 1"],
      effect: "Gain 1 heat cube. If you spend 1 additional heat cube, gain 2 credits and 1 additional space tag."
    },
    slot2: {
      id: "1-A2",
      name: "Bushes",
      cost: "5 - greenery_adjacent (min 1)",
      tags: ["Plant"],
      requirements: ["temperature >= -10"],
      effect: "Place 1 greenery cube. Reduce cost by 1 Credit per adjacent Greenery (min 1)."
    }
  },
  sideB: {
    slot1: {
      id: "1-B1",
      name: "Asteroid Mining",
      cost: 7,
      tags: ["Production", "Space"],
      effect: "Increase titanium production by 2."
    },
    slot2: {
      id: "1-B2",
      name: "Orbital Recycling (placeholder)",
      cost: 6,
      tags: ["Production"],
      effect: "Dummy effect"
    }
  }
};


export const STANDARD_PROJECTS: StandardProject[] = [
    {
        id: 'std-01',
        title: 'Sell Patent',
        description: 'Gain 1 Credit.',
        cost: 0,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-02',
        title: 'Build City',
        description: 'Requires: 1 Energy, 1 Space tag. Place a city.',
        cost: 2,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-03',
        title: 'Import Water',
        description: 'Requires: 1 Science tag. Place a water tile.',
        cost: 3,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-04',
        title: 'Greenhouses',
        description: 'Requires: 2 Nature tags. Place a greenery tile.',
        cost: 3,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
    {
        id: 'std-05',
        title: 'Energy Farms',
        description: 'Requires: 1 Energy, 1 Science tag. Gain 1 Heat tile.',
        cost: 3,
        action: (gs, p) => ({ newGameState: gs, newPlayer: p }),
    },
];

export const getInitialGameState = (playerMapId: MapId, aiMapId: MapId): GameState => {
  const isHumanWhite = Math.random() < 0.5;

  const humanPlayerId = isHumanWhite ? 'White' : 'Black';
  const aiPlayerId = isHumanWhite ? 'Black' : 'White';
  
  const { humanProject, aiProject, remainingDeck } = drawSharedCardRound(PROJECT_CARDS);
  
  const initialTags = { Energy: 0, Production: 0, Nature: 0, Science: 0, Space: 0, Plant: 0, Building: 0 };
  
  const humanPlayer: Player = {
    id: humanPlayerId,
    isAI: false,
    credits: 5,
    tags: {...initialTags},
    resources: { Nature: 2, Production: 1, Science: 1 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: [humanProject],
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[playerMapId])),
    standardProjectUsed: false,
  };

  const aiPlayer: Player = {
    id: aiPlayerId,
    isAI: true,
    credits: 5,
    tags: {...initialTags},
    resources: { Nature: 2, Production: 1, Science: 1 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: [aiProject],
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[aiMapId])),
    standardProjectUsed: false,
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
    projectCardDeck: remainingDeck,
    isGameOver: false,
    passCount: 0,
  };
};
