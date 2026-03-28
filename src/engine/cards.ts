// ============================================================
// TINYforming Mars — All 14 Project Cards (28 Sides)
// VERIFIED against physical cards, March 28 2026
// ============================================================

import type { CardId, CardSide, ProjectCard } from './types';

// ============================================================
// VERIFIED CARDS (1-3)
// ============================================================

const card1: ProjectCard = {
  id: 1,
  sideA: {
    cardId: 1,
    side: 'A',
    name: 'ICE CAP MELTING',
    color: 'blue',
    cost: 3,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 2 },
      { tag: 'production', count: 1 },
    ],
    parameterRequirements: [{ type: 'heat', count: 5 }],
    effect: { type: 'place_water', constraint: { row: 'south' } },
    tags: ['production', 'nature'],
  },
  sideB: {
    cardId: 1,
    side: 'B',
    name: 'POWER GRID',
    color: 'red',
    cost: 5,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 2 },
      { tag: 'production', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'gain_heat', count: 1 },
        { type: 'gain_credits', formula: { type: 'per_city', amount: 1 } },
      ],
    },
    tags: ['nature', 'science'],
  },
};

const card2: ProjectCard = {
  id: 2,
  sideA: {
    cardId: 2,
    side: 'A',
    name: 'ARTIFICIAL LAKE',
    color: 'blue',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'production', count: 2 }],
    parameterRequirements: [{ type: 'heat', count: 4 }],
    effect: {
      type: 'place_water',
      constraint: { adjacent_to: 'city', hex_type: 'water' },
    },
    tags: ['nature', 'nature'],
  },
  sideB: {
    cardId: 2,
    side: 'B',
    name: 'SOLAR POWER',
    color: 'red',
    cost: 3,
    costReduction: { type: 'per_city_on_row', row: 'center', amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'science', count: 1 },
    ],
    parameterRequirements: [],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['energy', 'nature'],
  },
};

const card3: ProjectCard = {
  id: 3,
  sideA: {
    cardId: 3,
    side: 'A',
    name: 'WATER FROM EUROPA',
    color: 'blue',
    cost: 3,
    costReduction: { type: 'per_tag', tag: 'space', beyond: 1, amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 1 },
      { tag: 'space', count: 1 },
    ],
    parameterRequirements: [],
    effect: { type: 'place_water' },
    tags: ['nature', 'nature'],
  },
  sideB: {
    cardId: 3,
    side: 'B',
    name: 'LAVA FLOWS',
    color: 'red',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 2 },
      { tag: 'nature', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'place_heat_on_map',
      constraint: { hex_type: 'land' },
    },
    tags: ['production', 'science'],
  },
};

// ============================================================
// VERIFIED CARDS (4-7)
// ============================================================

const card4: ProjectCard = {
  id: 4,
  sideA: {
    cardId: 4,
    side: 'A',
    name: 'ICE ASTEROID',
    color: 'blue',
    cost: 3,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'space', count: 2 }],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'place_water' },
        { type: 'return_greenery' }, // If adjacent to greenery, return 1 to supply
      ],
    },
    tags: ['energy', 'production'],
  },
  sideB: {
    cardId: 4,
    side: 'B',
    name: 'FUSION POWER',
    color: 'red',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'science', count: 2 }],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'gain_heat', count: 1 },
        { type: 'gain_resource_token', choice: true },
      ],
    },
    tags: ['production', 'nature'],
  },
};

const card5: ProjectCard = {
  id: 5,
  sideA: {
    cardId: 5,
    side: 'A',
    name: 'ASTEROID MINING',
    color: 'grey',
    cost: 1,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'energy', count: 1 }],
    parameterRequirements: [],
    effect: {
      type: 'gain_credits',
      formula: { type: 'per_tags_union', tags: ['production', 'space'], amount: 1 },
    },
    tags: ['energy', 'nature'],
  },
  sideB: {
    cardId: 5,
    side: 'B',
    name: 'GHG FACTORIES',
    color: 'red',
    cost: 3,
    costReduction: { type: 'per_tag', tag: 'production', beyond: 2, amount: 1 },
    parameterReduction: null,
    tagRequirements: [{ tag: 'production', count: 2 }],
    parameterRequirements: [],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['energy', 'science'],
  },
};

const card6: ProjectCard = {
  id: 6,
  sideA: {
    cardId: 6,
    side: 'A',
    name: 'GRASS',
    color: 'green',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'nature', count: 3 }],
    parameterRequirements: [{ type: 'heat', count: 3 }],
    effect: {
      type: 'place_greenery',
      constraint: { adjacent_to: 'city' },
    },
    tags: ['energy', 'production'],
  },
  sideB: {
    cardId: 6,
    side: 'B',
    name: 'GEOTHERMAL POWER',
    color: 'red',
    cost: 3,
    costReduction: { type: 'per_heat_cubes', divisor: 2, amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 2 },
      { tag: 'nature', count: 1 },
    ],
    parameterRequirements: [],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['science', 'space'],
  },
};

const card7: ProjectCard = {
  id: 7,
  sideA: {
    cardId: 7,
    side: 'A',
    name: 'WINDMILLS',
    color: 'red',
    cost: 4,
    costReduction: { type: 'per_adjacent_unoccupied', amount: 1 },
    parameterReduction: null,
    tagRequirements: [{ tag: 'energy', count: 2 }],
    parameterRequirements: [],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['nature', 'nature'],
  },
  sideB: {
    cardId: 7,
    side: 'B',
    name: 'RESEARCH OUTPOST',
    color: 'grey',
    cost: 1,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'science', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'place_or_relocate_city',
      bonusCondition: {
        not_adjacent_to_cubes: true,
        bonus: { type: 'gain_resource_token', choice: true },
      },
    },
    tags: ['energy', 'space'],
  },
};

// ============================================================
// VERIFIED CARDS (8-14)
// ============================================================

const card8: ProjectCard = {
  id: 8,
  sideA: {
    cardId: 8,
    side: 'A',
    name: 'LICHEN',
    color: 'green',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'nature', count: 2 }],
    parameterRequirements: [{ type: 'heat', count: 2 }],
    effect: {
      type: 'place_greenery',
      constraint: { not_adjacent_to: 'city' },
    },
    tags: ['production', 'production'],
  },
  sideB: {
    cardId: 8,
    side: 'B',
    name: 'GREAT DAM',
    color: 'red',
    cost: 3,
    costReduction: { type: 'per_tile', tile: 'water', beyond: 2, amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'nature', count: 1 },
      // "Water" tag on card = water parameter requirement, not a tag type
    ],
    parameterRequirements: [{ type: 'water', count: 2 }],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['energy', 'science'],
  },
};

const card9: ProjectCard = {
  id: 9,
  sideA: {
    cardId: 9,
    side: 'A',
    name: 'TREES',
    color: 'green',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'nature', count: 1 },
      { tag: 'science', count: 1 },
    ],
    parameterRequirements: [{ type: 'heat', count: 5 }],
    effect: {
      type: 'place_greenery',
      constraint: { min_adjacent_greenery: 2 },
    },
    tags: ['space', 'space'],
  },
  sideB: {
    cardId: 9,
    side: 'B',
    name: 'NUCLEAR POWER',
    color: 'red',
    cost: 3,
    costReduction: { type: 'per_tag', tag: 'energy', amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'science', count: 1 },
    ],
    parameterRequirements: [],
    effect: { type: 'gain_heat', count: 1 },
    tags: ['nature', 'space'],
  },
};

const card10: ProjectCard = {
  id: 10,
  sideA: {
    cardId: 10,
    side: 'A',
    name: 'ALGAE',
    color: 'green',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'nature', count: 1 },
      { tag: 'energy', count: 1 },
    ],
    parameterRequirements: [{ type: 'water', count: 2 }], // Water tiles on map, NOT heat
    effect: {
      type: 'place_greenery',
      constraint: { min_adjacent_water: 1 },
    },
    tags: ['science', 'science'],
  },
  sideB: {
    cardId: 10,
    side: 'B',
    name: 'COMET',
    color: 'red',
    cost: 3,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 1 },
      { tag: 'space', count: 1 },
    ],
    parameterRequirements: [], // NO parameter prereq — the 5 heat is a conditional in the effect
    effect: {
      type: 'composite',
      effects: [
        { type: 'gain_heat', count: 1 },
        // Conditional: if you now have 5+ heat cubes, may also place 1 water
        // TODO: This conditional logic needs special handling in the action executor
        { type: 'place_water' },
      ],
    },
    tags: ['nature', 'nature'],
  },
};

const card11: ProjectCard = {
  id: 11,
  sideA: {
    cardId: 11,
    side: 'A',
    name: 'MOSS',
    color: 'green',
    cost: 4,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'nature', count: 2 }],
    parameterRequirements: [{ type: 'water', count: 1 }],
    effect: {
      type: 'composite',
      effects: [
        { type: 'place_greenery' },
        // Gain 1 credit per water adjacent to placed greenery
        { type: 'gain_credits', formula: { type: 'per_adjacent_water', amount: 1 } },
      ],
    },
    tags: ['production', 'production'],
  },
  sideB: {
    cardId: 11,
    side: 'B',
    name: 'AQUIFER PUMPING',
    color: 'blue',
    cost: 4,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 1 },
      { tag: 'nature', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'place_water' },
        // Gain 2 credits if NOT adjacent to any other water
        // TODO: This conditional logic needs special handling in the action executor
        { type: 'gain_credits', formula: { type: 'fixed', amount: 2 } },
      ],
    },
    tags: ['production', 'space'],
  },
};

const card12: ProjectCard = {
  id: 12,
  sideA: {
    cardId: 12,
    side: 'A',
    name: 'BUSHES',
    color: 'green',
    cost: 5,
    costReduction: { type: 'per_greenery_adjacent_to_own_cities', amount: 1 },
    parameterReduction: null,
    tagRequirements: [{ tag: 'nature', count: 1 }],
    parameterRequirements: [{ type: 'heat', count: 4 }],
    effect: { type: 'place_greenery' },
    tags: ['energy', 'energy'],
  },
  sideB: {
    cardId: 12,
    side: 'B',
    name: 'METHANE FROM TITAN',
    color: 'red',
    cost: 2,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'space', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'gain_heat', count: 1 },
        // Optional: spend 2 additional credits + Space tag → gain 1 more heat
        // TODO: This optional spend logic needs special handling in the action executor
      ],
    },
    tags: ['energy', 'nature'],
  },
};

const card13: ProjectCard = {
  id: 13,
  sideA: {
    cardId: 13,
    side: 'A',
    name: 'PROTECTED VALLEY',
    color: 'green',
    cost: 4,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [{ tag: 'nature', count: 2 }],
    parameterRequirements: [{ type: 'heat', count: 2 }],
    effect: {
      type: 'place_greenery',
      constraint: { hex_type: 'water' }, // Special: greenery on a water hex
    },
    tags: ['energy', 'energy'],
  },
  sideB: {
    cardId: 13,
    side: 'B',
    name: 'ASTEROID',
    color: 'red',
    cost: 4,
    costReduction: null,
    parameterReduction: null,
    tagRequirements: [
      { tag: 'energy', count: 1 },
      { tag: 'space', count: 1 },
    ],
    parameterRequirements: [],
    effect: {
      type: 'composite',
      effects: [
        { type: 'gain_heat', count: 1 },
        { type: 'return_greenery' }, // May return 1 greenery from any hex to supply
      ],
    },
    tags: ['production', 'production'],
  },
};

const card14: ProjectCard = {
  id: 14,
  sideA: {
    cardId: 14,
    side: 'A',
    name: 'INSECTS',
    color: 'green',
    cost: 2,
    costReduction: null,
    parameterReduction: {
      parameter: 'heat',
      per_tag: 'science',
      beyond: 1,
      reduction_per_tag: 2,
      minimum: 0,
    },
    tagRequirements: [
      { tag: 'nature', count: 1 },
      { tag: 'science', count: 2 },
    ],
    parameterRequirements: [{ type: 'heat', count: 6 }], // Parameter reduction: 6* heat → −2 per Science tag beyond 1
    effect: { type: 'place_greenery' },
    tags: ['production', 'space'],
  },
  sideB: {
    cardId: 14,
    side: 'B',
    name: 'SUBTERRANEAN RESERVOIR',
    color: 'blue',
    cost: 3,
    costReduction: { type: 'per_tag', tag: 'nature', beyond: 1, amount: 1 },
    parameterReduction: null,
    tagRequirements: [
      { tag: 'nature', count: 1 },
      { tag: 'science', count: 1 },
    ],
    parameterRequirements: [],
    effect: { type: 'place_water' },
    tags: ['energy', 'energy'],
  },
};

// ============================================================
// Exports
// ============================================================

export const PROJECT_CARDS: ProjectCard[] = [
  card1, card2, card3, card4, card5, card6, card7,
  card8, card9, card10, card11, card12, card13, card14,
];

/** Look up a card by ID */
export function getCard(cardId: CardId): ProjectCard | undefined {
  return PROJECT_CARDS.find((c) => c.id === cardId);
}

/** Get a specific side of a card */
export function getCardSide(cardId: CardId, side: 'A' | 'B'): CardSide | undefined {
  const card = getCard(cardId);
  if (!card) return undefined;
  return side === 'A' ? card.sideA : card.sideB;
}
