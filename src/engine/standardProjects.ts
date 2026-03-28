// ============================================================
// TINYforming Mars — Standard Projects (5 projects)
// VERIFIED against physical cards, March 28 2026
// ============================================================

import type { StandardProjectDefinition, StandardProjectId } from './types';

export const STANDARD_PROJECTS: StandardProjectDefinition[] = [
  {
    id: 'sell_patent',
    name: 'Sell Patent',
    cost: 1,
    tagRequirements: [],
    effectType: 'gain_credits',
    // Note: Cannot use if credit supply is empty
  },
  {
    id: 'build_city',
    name: 'Build City',
    cost: 2,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'space', count: 1 },
    ],
    effectType: 'place_or_relocate_city',
    // Rules: max 2 cities, unoccupied land hex, not water, not adjacent to any city
  },
  {
    id: 'import_water',
    name: 'Import Water',
    cost: 3,
    tagRequirements: [
      { tag: 'science', count: 1 },
      { tag: 'space', count: 1 },
    ],
    effectType: 'place_water',
    // PRD correction: was Space + Nature, verified as Science + Space
  },
  {
    id: 'greenhouses',
    name: 'Greenhouses',
    cost: 3,
    tagRequirements: [
      { tag: 'production', count: 1 },
      { tag: 'nature', count: 2 },
    ],
    effectType: 'place_greenery',
  },
  {
    id: 'energy_farms',
    name: 'Energy Farms',
    cost: 3,
    tagRequirements: [
      { tag: 'energy', count: 1 },
      { tag: 'science', count: 1 },
    ],
    effectType: 'gain_heat',
    // PRD correction: was Energy×2 + Science, verified as Energy + Science
  },
];

/** Look up a standard project by ID */
export function getStandardProject(id: StandardProjectId): StandardProjectDefinition | undefined {
  return STANDARD_PROJECTS.find((p) => p.id === id);
}
