
import type { GameState, MapData, ProjectCardData, StandardProject, MapId, Player, Requirements, Tag, ParameterType, Hex } from './types';
import { drawInitialCards } from './state';

const THARSIS_MAP_HEXES: MapData['hexes'] = Array.from<unknown, Hex>({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: 'land',
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

const ELYSIUM_MAP_HEXES: MapData['hexes'] = Array.from<unknown, Hex>({ length: 19 }, (_, i) => ({
    id: i + 1,
    type: 'land',
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

const emptyReq: Requirements<Record<Tag, number>> = { Energy: 0, Production: 0, Nature: 0, Science: 0, Space: 0, Plant: 0, Building: 0, Heat: 0, Water: 0 };
const emptyParams: Requirements<Record<ParameterType, number>> = { Heat: 0, Greenery: 0, Water: 0 };

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

// Card 2
PROJECT_CARDS[1].sideA.slot1 = {
  id: "2-A1",
  name: "Grass",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Nature: 3 },
  parameterRequirements: { ...emptyParams, Heat: 3 },
  effect: "Place 1 Greenery Cube. It must be placed adjacent to a city.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Energy: 1, Production: 1 },
};
PROJECT_CARDS[1].sideA.slot2 = {
  id: "2-A2",
  name: "Geothermal Power",
  cost: { credits: 3, reducible: true },
  tagRequirements: { ...emptyReq, Production: 2, Nature: 1 },
  parameterRequirements: { ...emptyParams },
  costReductionRule: "Reduce the cost by 1 Credit for every two Heat Cubes you have (minimum cost of 1)",
  effect: "Gain 1 Heat Cube",
  effectType: "heat",
  automaticTags: { ...emptyReq, Science: 1, Space: 1 },
};
PROJECT_CARDS[1].sideB.slot1 = {
  id: "2-B1",
  name: "Aquifer Pumping",
  cost: { credits: 4, reducible: false },
  tagRequirements: { ...emptyReq, Energy: 1, Nature: 1 },
  parameterRequirements: { ...emptyParams },
  effect: "Place 1 Water Cube. Gain 2 Credits if this Water Cube was not placed adjacent to any other Water Cubes.",
  effectType: "water",
  automaticTags: { ...emptyReq, Production: 1, Space: 1 },
};
PROJECT_CARDS[1].sideB.slot2 = {
  id: "2-B2",
  name: "Moss",
  cost: { credits: 4, reducible: false },
  tagRequirements: { ...emptyReq, Nature: 2 },
  parameterRequirements: { ...emptyParams, Water: 1 },
  effect: "Place 1 Greenery Cube. Gain 1 Credit for each Water Cube adjacent to the placed Greenery Cube.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Production: 2 },
};

// Card 3
PROJECT_CARDS[2].sideA.slot1 = {
    id: "3-A1",
    name: "Asteroid Mining",
    cost: { credits: 0, reducible: false },
    tagRequirements: { ...emptyReq, Space: 1 },
    parameterRequirements: { ...emptyParams },
    effect: "Gain 1 Credit for each Production and Space Tag you have on your Project cards.",
    effectType: "utility",
    automaticTags: { ...emptyReq, Energy: 1, Nature: 1 },
};
PROJECT_CARDS[2].sideA.slot2 = {
    id: "3-A2",
    name: "GHG Factories",
    cost: { credits: 3, reducible: true },
    tagRequirements: { ...emptyReq, Production: 2 },
    parameterRequirements: { ...emptyParams },
    costReductionRule: "Reduce the cost by 1 Credit for each Production Tag you have beyond two (minimum cost of 1)",
    effect: "Gain 1 Heat Cube",
    effectType: "heat",
    automaticTags: { ...emptyReq, Energy: 1, Science: 1 },
};
PROJECT_CARDS[2].sideB.slot1 = {
  id: "3-B1",
  name: "Methane from Titan",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Production: 1, Space: 1 },
  parameterRequirements: { ...emptyParams },
  effect: "Gain 1 Heat Cube. If you spend an additional 2 Credits and have an additional Space Tag, you may gain an additional Heat Cube.",
  effectType: "heat",
  automaticTags: { ...emptyReq, Energy: 1, Nature: 1 },
};
PROJECT_CARDS[2].sideB.slot2 = {
  id: "3-B2",
  name: "Bushes",
  cost: { credits: 5, reducible: true },
  tagRequirements: { ...emptyReq, Nature: 1 },
  parameterRequirements: { ...emptyParams, Heat: 4 },
  costReductionRule: "Reduce the cost by 1 Credit for every Greenery Cube adjacent to one of your cities (minimum cost of 1)",
  effect: "Place 1 Greenery Cube",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Energy: 2 },
};

// Card 4
PROJECT_CARDS[3].sideA.slot1 = {
    id: "4-A1",
    name: "Ice Asteroid",
    cost: { credits: 3, reducible: false },
    tagRequirements: { ...emptyReq, Space: 2 },
    parameterRequirements: { ...emptyParams },
    effect: "Place 1 Water Cube. If this Cube is placed adjacent to one or more Greenery Cubes, return one of those Greenery Cubes to the supply.",
    effectType: "water",
    automaticTags: { ...emptyReq, Energy: 1, Production: 1 },
};
PROJECT_CARDS[3].sideA.slot2 = {
  id: "4-A2",
  name: "Fusion Power",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Science: 2 },
  parameterRequirements: { ...emptyParams },
  effect: "Gain 1 Heat Cube and Gain 1 available Resource Token of your choice",
  effectType: "heat",
  automaticTags: { ...emptyReq, Production: 1, Nature: 1 },
};
PROJECT_CARDS[3].sideB.slot1 = {
  id: "4-B1",
  name: "Asteroid",
  cost: { credits: 4, reducible: false },
  tagRequirements: { ...emptyReq, Energy: 1, Space: 1 },
  parameterRequirements: { ...emptyParams },
  effect: "Gain 1 Heat Cube. You may return 1 Greenery Cube from the board to the supply.",
  effectType: "heat",
  automaticTags: { ...emptyReq, Production: 2 },
};
PROJECT_CARDS[3].sideB.slot2 = {
  id: "4-B2",
  name: "Protected Valley",
  cost: { credits: 4, reducible: false },
  tagRequirements: { ...emptyReq, Nature: 2 },
  parameterRequirements: { ...emptyParams, Heat: 2 },
  effect: "Place 1 Greenery Cube. It must be placed in a space reserved for a Water Cube.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Energy: 2 },
};

// Card 5
PROJECT_CARDS[4].sideA.slot1 = {
    id: "5-A1",
    name: "Water from Europa",
    cost: { credits: 3, reducible: true },
    tagRequirements: { ...emptyReq, Energy: 1, Space: 1 },
    parameterRequirements: { ...emptyParams },
    costReductionRule: "Reduce the cost by 1 Credit for each additional Space Tag beyond the first",
    effect: "Place 1 Water Cube",
    effectType: "water",
    automaticTags: { ...emptyReq, Production: 1, Nature: 1 },
};
PROJECT_CARDS[4].sideA.slot2 = {
    id: "5-A2",
    name: "Lava Flows",
    cost: { credits: 2, reducible: false },
    tagRequirements: { ...emptyReq, Energy: 2, Nature: 1 },
    parameterRequirements: { ...emptyParams },
    effect: "Place 1 Heat Cube in a hex not reserved for water",
    effectType: "heat",
    automaticTags: { ...emptyReq, Production: 1, Science: 1 },
};
PROJECT_CARDS[4].sideB.slot1 = {
    id: "5-B1",
    name: "Great Dam",
    cost: { credits: 3, reducible: true },
    tagRequirements: { ...emptyReq, Production: 1, Nature: 1 },
    parameterRequirements: { ...emptyParams, Water: 2 },
    costReductionRule: "Reduce the cost by 1 Credit for every Water Cube beyond two",
    effect: "Gain 1 Heat Cube",
    effectType: "heat",
    automaticTags: { ...emptyReq, Energy: 1, Science: 1 },
};
PROJECT_CARDS[4].sideB.slot2 = {
  id: "5-B2",
  name: "Lichen",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Nature: 2 },
  parameterRequirements: { ...emptyParams, Heat: 2 },
  effect: "Place 1 Greenery Cube. It cannot be placed adjacent to a city.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Production: 2 },
};

// Card 6
PROJECT_CARDS[5].sideA.slot1 = {
    id: "6-A1",
    name: "Artificial Lake",
    cost: { credits: 2, reducible: false },
    tagRequirements: { ...emptyReq, Production: 2 },
    parameterRequirements: { ...emptyParams, Heat: 4 },
    effect: "Place 1 Water Cube. It must be placed adjacent to at least one city.",
    effectType: "water",
    automaticTags: { ...emptyReq, Nature: 2 },
};
PROJECT_CARDS[5].sideA.slot2 = {
    id: "6-A2",
    name: "Solar Power",
    cost: { credits: 3, reducible: true },
    tagRequirements: { ...emptyReq, Production: 1, Science: 1 },
    parameterRequirements: { ...emptyParams },
    costReductionRule: "Reduce the cost by 1 Credit for each city on the Center row",
    effect: "Gain 1 Heat Cube",
    effectType: "heat",
    automaticTags: { ...emptyReq, Energy: 1, Nature: 1 },
};
PROJECT_CARDS[5].sideB.slot1 = {
    id: "6-B1",
    name: "Nuclear Power",
    cost: { credits: 3, reducible: true },
    tagRequirements: { ...emptyReq, Production: 1, Science: 1 },
    parameterRequirements: { ...emptyParams },
    costReductionRule: "Reduce the cost by 1 Credit for each Energy Tag you have (minimum cost of 1)",
    effect: "Gain 1 Heat Cube",
    effectType: "heat",
    automaticTags: { ...emptyReq, Nature: 1, Space: 1 },
};
PROJECT_CARDS[5].sideB.slot2 = {
  id: "6-B2",
  name: "Trees",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Nature: 1, Science: 1 },
  parameterRequirements: { ...emptyParams, Heat: 5 },
  effect: "Place 1 Greenery Cube. It must be placed adjacent to two other Greenery Cubes.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Space: 2 },
};

// Card 7
PROJECT_CARDS[6].sideA.slot1 = {
    id: "7-A1",
    name: "Ice Cap Melting",
    cost: { credits: 3, reducible: false },
    tagRequirements: { ...emptyReq, Energy: 2 },
    parameterRequirements: { ...emptyParams, Heat: 5 },
    effect: "Place 1 Water Cube. It must be placed in any unoccupied hex on the South row.",
    effectType: "water",
    automaticTags: { ...emptyReq, Production: 1, Nature: 1 },
};
PROJECT_CARDS[6].sideA.slot2 = {
    id: "7-A2",
    name: "Power Grid",
    cost: { credits: 5, reducible: false },
    tagRequirements: { ...emptyReq, Energy: 1, Production: 1 },
    parameterRequirements: { ...emptyParams },
    effect: "Gain 1 Heat Cube. Gain 1 Credit for each city",
    effectType: "heat",
    automaticTags: { ...emptyReq, Nature: 1, Science: 1 },
};
PROJECT_CARDS[6].sideB.slot1 = {
    id: "7-B1",
    name: "Comet",
    cost: { credits: 3, reducible: false },
    tagRequirements: { ...emptyReq, Energy: 1, Space: 1 },
    parameterRequirements: { ...emptyParams },
    effect: "Gain 1 Heat Cube. You may also place 1 Water Cube if you now have five or more Heat Cubes.",
    effectType: "heat",
    automaticTags: { ...emptyReq, Nature: 2 },
};
PROJECT_CARDS[6].sideB.slot2 = {
  id: "7-B2",
  name: "Algae",
  cost: { credits: 2, reducible: false },
  tagRequirements: { ...emptyReq, Energy: 1, Nature: 1 },
  parameterRequirements: { ...emptyParams, Water: 2 },
  effect: "Place 1 Greenery Cube. It must be placed adjacent to at least one Water Cube.",
  effectType: "greenery",
  automaticTags: { ...emptyReq, Science: 2 },
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
  
  const initialTags: Requirements<Record<Tag, number>> = { Energy: 0, Production: 0, Nature: 0, Science: 0, Space: 0, Plant: 0, Building: 0, Heat: 0, Water: 0 };
  const initialBonusTags = { Production: 0, Science: 0, Nature: 0, Space: 0 };
  const initialResourceTokens = { Nature: 0, Production: 0, Science: 0 };

  const humanPlayer: Player = {
    id: humanPlayerId,
    isAI: false,
    credits: 5,
    permanentTags: {...initialTags},
    bonusTagsFromCities: {...initialBonusTags},
    resourceTokens: {...initialResourceTokens},
    cities: [],
    personalSupply: { heat: 0 },
    tokens: { city: 2, specialProject: 1 },
    projectCards: [],
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
    tokens: { city: 2, specialProject: 1 },
    projectCards: [],
    victoryPoints: 0,
    map: JSON.parse(JSON.stringify(MAPS[aiMapId])),
    standardProjectUsed: false,
  };

  const players = [humanPlayer, aiPlayer].sort((a, b) => a.id === 'White' ? -1 : 1);
  const startingPlayerIndex = players.findIndex(p => p.id === 'White');

  return {
    generation: 0,
    phase: 'Setup',
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
      drawDeck: [...PROJECT_CARDS],
      discardPile: [],
      activeCards: [],
    },
    isGameOver: false,
    gameEndTriggered: false,
    passCount: 0,
  };
};
