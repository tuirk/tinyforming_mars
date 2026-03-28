// ============================================================
// TINYforming Mars — Hex Map Definitions (Tharsis & Elysium)
// 19 hexes per map, 1-based IDs (1–19)
// ============================================================

import type { HexDefinition, MapId } from './types';

// --- Shared adjacency map (identical topology for both maps) ---

const ADJACENCY: Record<number, number[]> = {
  1:  [2, 4, 5],
  2:  [1, 3, 5, 6],
  3:  [2, 6, 7],
  4:  [1, 5, 8, 9],
  5:  [1, 2, 4, 6, 9, 10],
  6:  [2, 3, 5, 7, 10, 11],
  7:  [3, 6, 11, 12],
  8:  [4, 9, 13],
  9:  [4, 5, 8, 10, 13, 14],
  10: [5, 6, 9, 11, 14, 15],
  11: [6, 7, 10, 12, 15, 16],
  12: [7, 11, 16],
  13: [8, 9, 14, 17],
  14: [9, 10, 13, 15, 17, 18],
  15: [10, 11, 14, 16, 18, 19],
  16: [11, 12, 15, 19],
  17: [13, 14, 18],
  18: [14, 15, 17, 19],
  19: [15, 16, 18],
};

// --- Row/col layout (same grid for both maps) ---
// Row 0 (3 hexes): IDs 1,2,3   cols 1,2,3
// Row 1 (4 hexes): IDs 4,5,6,7 cols 0.5,1.5,2.5,3.5
// Row 2 (5 hexes): IDs 8,9,10,11,12 cols 0,1,2,3,4
// Row 3 (4 hexes): IDs 13,14,15,16 cols 0.5,1.5,2.5,3.5
// Row 4 (3 hexes): IDs 17,18,19 cols 1,2,3

interface HexLayout {
  id: number;
  row: number;
  col: number;
}

const HEX_LAYOUT: HexLayout[] = [
  // Row 0
  { id: 1,  row: 0, col: 1 },
  { id: 2,  row: 0, col: 2 },
  { id: 3,  row: 0, col: 3 },
  // Row 1
  { id: 4,  row: 1, col: 0.5 },
  { id: 5,  row: 1, col: 1.5 },
  { id: 6,  row: 1, col: 2.5 },
  { id: 7,  row: 1, col: 3.5 },
  // Row 2
  { id: 8,  row: 2, col: 0 },
  { id: 9,  row: 2, col: 1 },
  { id: 10, row: 2, col: 2 },
  { id: 11, row: 2, col: 3 },
  { id: 12, row: 2, col: 4 },
  // Row 3
  { id: 13, row: 3, col: 0.5 },
  { id: 14, row: 3, col: 1.5 },
  { id: 15, row: 3, col: 2.5 },
  { id: 16, row: 3, col: 3.5 },
  // Row 4
  { id: 17, row: 4, col: 1 },
  { id: 18, row: 4, col: 2 },
  { id: 19, row: 4, col: 3 },
];

// Map row assignment: row 0 = north, rows 1-2 = center, rows 3-4 = south
function getMapRow(row: number): 'north' | 'center' | 'south' {
  if (row === 0) return 'north';
  if (row <= 2) return 'center';
  return 'south';
}

// ============================================================
// THARSIS
// ============================================================
// Bonus hexes (verified):
//   Hex 1:  bonusTag = 'production'
//   Hex 8:  bonusTag = 'nature'
//   Hex 12: bonusTag = 'nature'
//   Hex 17: bonusTag = 'production'
//   Hex 19: bonusTag = 'space'
//
// Water hexes (from legacy code — TODO: VERIFY WITH PHYSICAL CARDS):
//   Hex 3:  water, resourceTokenIcon = 'science'
//   Hex 9:  water, resourceTokenIcon = 'nature'
//   Hex 10: water, resourceTokenIcon = 'production'
//   Hex 15: water, resourceTokenIcon = 'nature'
//   Hex 16: water, no resource token icon
// ============================================================

const THARSIS_WATER_HEXES = new Set([3, 9, 10, 15, 16]); // TODO: VERIFY WITH PHYSICAL CARDS

export const THARSIS_HEXES: HexDefinition[] = HEX_LAYOUT.map((layout): HexDefinition => {
  const { id, row, col } = layout;
  const isWater = THARSIS_WATER_HEXES.has(id);

  // Bonus tags (verified)
  let bonusTag: HexDefinition['bonusTag'] = null;
  if (id === 1)  bonusTag = 'production';
  if (id === 8)  bonusTag = 'nature';
  if (id === 12) bonusTag = 'nature';
  if (id === 17) bonusTag = 'production';
  if (id === 19) bonusTag = 'space';

  // Resource token icons on water hexes — TODO: VERIFY WITH PHYSICAL CARDS
  let resourceTokenIcon: HexDefinition['resourceTokenIcon'] = null;
  if (id === 3)  resourceTokenIcon = 'science';    // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 9)  resourceTokenIcon = 'nature';      // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 10) resourceTokenIcon = 'production';  // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 15) resourceTokenIcon = 'nature';      // TODO: VERIFY WITH PHYSICAL CARDS
  // Hex 16: water with no resource token icon       // TODO: VERIFY WITH PHYSICAL CARDS

  return {
    id,
    row,
    col,
    type: isWater ? 'water' : 'land',
    bonusTag,
    resourceTokenIcon,
    adjacentIds: ADJACENCY[id],
    mapRow: getMapRow(row),
  };
});

// ============================================================
// ELYSIUM
// ============================================================
// Bonus hexes (verified):
//   Hex 4:  bonusTag = 'space'
//   Hex 7:  bonusTag = 'science'
//   Hex 10: bonusTag = 'nature'
//   Hex 17: bonusTag = 'production'
//   Hex 19: bonusTag = 'production'
//
// Water hexes (from legacy code — TODO: VERIFY WITH PHYSICAL CARDS):
//   Hex 1:  water, resourceTokenIcon = 'science'
//   Hex 2:  water, resourceTokenIcon = 'production'
//   Hex 6:  water, no resource token icon
//   Hex 9:  water, resourceTokenIcon = 'nature'
//   Hex 11: water, resourceTokenIcon = 'nature'
// ============================================================

const ELYSIUM_WATER_HEXES = new Set([1, 2, 6, 9, 11]); // TODO: VERIFY WITH PHYSICAL CARDS

export const ELYSIUM_HEXES: HexDefinition[] = HEX_LAYOUT.map((layout): HexDefinition => {
  const { id, row, col } = layout;
  const isWater = ELYSIUM_WATER_HEXES.has(id);

  // Bonus tags (verified)
  let bonusTag: HexDefinition['bonusTag'] = null;
  if (id === 4)  bonusTag = 'space';
  if (id === 7)  bonusTag = 'science';
  if (id === 10) bonusTag = 'nature';
  if (id === 17) bonusTag = 'production';
  if (id === 19) bonusTag = 'production';

  // Resource token icons on water hexes — TODO: VERIFY WITH PHYSICAL CARDS
  let resourceTokenIcon: HexDefinition['resourceTokenIcon'] = null;
  if (id === 1)  resourceTokenIcon = 'science';     // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 2)  resourceTokenIcon = 'production';  // TODO: VERIFY WITH PHYSICAL CARDS
  // Hex 6: water with no resource token icon         // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 9)  resourceTokenIcon = 'nature';       // TODO: VERIFY WITH PHYSICAL CARDS
  if (id === 11) resourceTokenIcon = 'nature';       // TODO: VERIFY WITH PHYSICAL CARDS

  return {
    id,
    row,
    col,
    type: isWater ? 'water' : 'land',
    bonusTag,
    resourceTokenIcon,
    adjacentIds: ADJACENCY[id],
    mapRow: getMapRow(row),
  };
});

// ============================================================
// Exports
// ============================================================

export const MAP_DEFINITIONS: Record<MapId, HexDefinition[]> = {
  tharsis: THARSIS_HEXES,
  elysium: ELYSIUM_HEXES,
};

/** Get hex definitions for a given map */
export function getMapHexes(mapId: MapId): HexDefinition[] {
  return MAP_DEFINITIONS[mapId];
}

/** Get adjacent hex IDs for a given hex on a given map */
export function getAdjacentIds(mapId: MapId, hexId: number): number[] {
  const hex = MAP_DEFINITIONS[mapId].find((h) => h.id === hexId);
  return hex?.adjacentIds ?? [];
}
