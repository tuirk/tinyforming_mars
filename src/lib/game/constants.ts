
import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Player, Requirements, Tag } from './types';
import { drawInitialCards } from './state';

const THARSIS_MAP_HEXES: MapData['hexes'] = Array.from({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: 'land' as 'land',
    occupiedBy: { type: null, playerId: null },
    isWaterReserved: false,
  }))
  .map(hex => {
    switch (hex.id) {
        case 1: hex.bonusTag = 'Production'; hex.frameColor = 'orange'; break;
        case 3: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Science'; break;
        case 8: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
        case 9: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Nature'; break;
        case 10: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Production'; break;
        case 12: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
        case 15: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Nature'; break;
        case 16: hex.type = 'water'; hex.isWaterReserved = true; break;
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
    type: 'land' as 'land',
    occupiedBy: { type: null, playerId: null },
    isWaterReserved: false,
  }))
  .map(hex => {
    switch (hex.id) {
        case 1: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Science'; break;
        case 2: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Production'; break;
        case 4: hex.bonusTag = 'Space'; hex.frameColor = 'gray'; break;
        case 6: hex.type = 'water'; hex.isWaterReserved = true; break;
        case 7: hex.bonusTag = 'Science'; hex.frameColor = 'white'; break;
        case 9: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Nature'; break;
        case 10: hex.bonusTag = 'Nature'; hex.frameColor = 'green'; break;
        case 11: hex.type = 'water'; hex.isWaterReserved = true; hex.resourceTokenIcon = 'Nature'; break;
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

const emptyReq = { Energy: 0, Production: 0, Nature: 0, Science: 0, Space: 0, Plant: 0, Building: 0, Heat: 0, Water: 0 };
const emptyParams = { Heat: 0, Greenery: 0, Water: 0 };

export const PROJECT_CARDS: ProjectCardData[] = Array.from({ length: 7 }, (_, i) => ({
  cardId: i + 1,
  sideA: {
    slot1: {
      id: `${i + 1}-A1`,
      name: `Card ${i + 1} Side A, Project 1`,
      cost: { credits: i + 1, reducible: false },
      tagRequirements: {...emptyReq},
      parameterRequirements: {...emptyParams},
      effect: "Placeholder effect A1.",
      effectType: 'utility',
      automaticTags: { Space: 1},
    },
    slot2: {
      id: `${i + 1}-A2`,
      name: `Card ${i + 1} Side A, Project 2`,
      cost: { credits: i + 1, reducible: false },
      tagRequirements: {...emptyReq},
      parameterRequirements: {...emptyParams},
      effect: "Placeholder effect A2.",
      effectType: 'utility',
      automaticTags: { Plant: 1},
    }
  },
  sideB: {
    slot1: {
      id: `${i + 1}-B1`,
      name: `Card ${i + 1} Side B, Project 1`,
      cost: { credits: i + 1, reducible: false },
      tagRequirements: {...emptyReq},
      parameterRequirements: {...emptyParams},
      effect: "Placeholder effect B1.",
      effectType: 'utility',
      automaticTags: { Production: 1, Space: 1},
    },
    slot2: {
      id: `${i + 1}-B2`,
      name: `Card ${i + 1} Side B, Project 2`,
      cost: { credits: i + 1, reducible: false },
      tagRequirements: {...emptyReq},
      parameterRequirements: {...emptyParams},
      effect: "Placeholder effect B2.",
      effectType: 'utility',
      automaticTags: { Production: 1},
    }
  }
}));

// Overwrite card 1 with specific data
PROJECT_CARDS[0] = {
  cardId: 1,
  sideA: {
    slot1: {
      id: "1-A1",
      name: "Research Outpost",
      cost: { credits: 0, reducible: false },
      tagRequirements: { ...emptyReq, Production: 1, Science: 1 },
      parameterRequirements: {...emptyParams},
      effect: "Place or Relocate one of your cities. If that city is not adjacent to any other Cube(s), Gain 1 available Resource Token of your choice.",
      effectType: "utility",
      automaticTags: { ...emptyReq, Energy: 1, Space: 1 },
    },
    slot2: {
      id: "1-A2",
      name: "Windmills",
      cost: { credits: 4, reducible: true },
      tagRequirements: { ...emptyReq, Energy: 2 },
      parameterRequirements: {...emptyParams},
      effect: "Gain 1 Heat Cube",
      effectType: "heat",
      costReductionRule: "Reduce cost by 1 Credit per unoccupied hex adjacent to your cities (minimum cost 1)",
      automaticTags: { ...emptyReq, Nature: 2 },
    }
  },
  sideB: {
    slot1: {
      id: "1-B1",
      name: "Subterranean Reservoir",
      cost: { credits: 3, reducible: true },
      tagRequirements: { ...emptyReq, Nature: 1, Science: 1 },
      parameterRequirements: {...emptyParams},
      effect: "Place 1 Water Cube",
      effectType: "water",
      costReductionRule: "Reduce the cost by 1 Credit for each additional Nature Tag (minimum cost of 1)",
      automaticTags: { ...emptyReq, Energy: 2 },
    },
    slot2: {
      id: "1-B2",
      name: "Insects",
      cost: { credits: 2, reducible: false },
      tagRequirements: { ...emptyReq, Nature: 1, Science: 1 },
      parameterRequirements: { ...emptyParams, Heat: 6 },
      parameterReductionRule: "Reduce the Heat Parameter requirement by 2 for each additional Science Tag you have",
      effect: "Place 1 Greenery Cube",
      effectType: "greenery",
      automaticTags: { ...emptyReq, Production: 1, Space: 1 },
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
  
  const { activeCards, remainingDeck } = drawInitialCards(PROJECT_CARDS);
  
  const initialTags: Requirements<Record<Tag, number>> = { Energy: 0, Production: 0, Nature: 0, Science: 0, Space: 0, Plant: 0, Building: 0, Heat: 0, Water: 0 };
  const initialBonusTags = { Production: 0, Science: 0, Nature: 0, Space: 0 };
  const initialResourceTokens = { Nature: 0, Production: 0, Science: 0 };

  const humanPlayerCards = activeCards.map(c => ({ effect: c.player1Side, usedThisGeneration: false }));
  const aiPlayerCards = activeCards.map(c => ({ effect: c.player2Side, usedThisGeneration: false }));

  const humanPlayer: Player = {
    id: humanPlayerId,
    isAI: false,
    credits: 5,
    permanentTags: {...initialTags},
    bonusTagsFromCities: {...initialBonusTags},
    resourceTokens: {...initialResourceTokens},
    cities: [],
    personalSupply: { heat: 0 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: humanPlayerCards,
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[playerMapId])),
    standardProjectUsed: false,
  };

  const aiPlayer: Player = {
    id: aiPlayerId,
    isAI: true,
    credits: 5,
    permanentTags: {...initialTags},
    bonusTagsFromCities: {...initialBonusTags},
    resourceTokens: {...initialResourceTokens},
    cities: [],
    personalSupply: { heat: 0 },
    parameterCubes: { Water: 0, Greenery: 0, Heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: aiPlayerCards,
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
    supplies: {
      credits: 100,
      parameterTiles: {
        Water: 4,
        Greenery: 7,
        Heat: 11,
      },
      resourceTokens: {
        Nature: 2,
        Production: 1,
        Science: 1,
      }
    },
    projectCards: {
      drawDeck: remainingDeck,
      discardPile: [],
      activeCards: activeCards,
    },
    isGameOver: false,
    gameEndTriggered: false,
    passCount: 0,
  };
};
