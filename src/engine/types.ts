// ============================================================
// TINYforming Mars — Core Type Definitions
// Source of truth: PRD Section 5 (docs/prd.md)
// ============================================================

// --- Primitive / Literal Types ---

export type TagType = 'energy' | 'production' | 'nature' | 'science' | 'space';
export type ResourceType = 'nature' | 'production' | 'science';
export type ParameterTileType = 'heat' | 'greenery' | 'water';
export type MapRow = 'north' | 'center' | 'south';
export type PlayerColor = 'white' | 'black';
export type MapId = 'tharsis' | 'elysium';
export type Phase = 'setup' | 'research' | 'action' | 'income' | 'game_over';
export type CardColor = 'red' | 'green' | 'blue' | 'grey';
export type CardSideId = 'A' | 'B';
export type EndCondition = 'parameters' | 'hexes_full' | 'generation_12';

/** Hex IDs are integers 0–18 */
export type HexId = number;

/** Card IDs are integers 1–14 */
export type CardId = number;

// --- Hex Grid ---

/** Static hex definition — fixed per map, never mutated during a game */
export interface HexDefinition {
  id: HexId;
  row: number;          // rendering row (0-based)
  col: number;          // rendering column (0-based)
  type: 'land' | 'water';
  bonusTag: TagType | null;
  resourceTokenIcon: ResourceType | null;
  adjacentIds: HexId[];
  mapRow: MapRow;       // north/center/south for card effects
}

/** Runtime hex state — mutates as tiles and cities are placed */
export interface HexState {
  id: HexId;
  type: 'land' | 'water';
  bonusTag: TagType | null;
  resourceTokenIcon: ResourceType | null;
  tile: ParameterTileType | null;
  tilePlacedBy: string | null;        // player id
  city: { playerId: string } | null;
  row: MapRow;
  adjacentHexIds: HexId[];
}

// --- Cards ---

export interface TagRequirement {
  tag: TagType;
  count: number;
}

export interface ParameterRequirement {
  type: ParameterTileType;
  count: number;
}

export interface ParameterReduction {
  parameter: ParameterTileType;
  per_tag: TagType;
  beyond: number;
  reduction_per_tag: number;
  minimum: number;
}

export interface PlacementConstraint {
  adjacent_to?: 'city' | 'greenery' | 'water' | 'none';
  not_adjacent_to?: 'city';
  row?: MapRow;
  hex_type?: 'water' | 'land';
  min_adjacent_greenery?: number;
  min_adjacent_water?: number;
}

export interface CityBonusCondition {
  /** Bonus triggers when the placed city is NOT adjacent to any cubes */
  not_adjacent_to_cubes: boolean;
  bonus: { type: 'gain_resource_token'; choice: boolean };
}

export type CreditFormula =
  | { type: 'fixed'; amount: number }
  | { type: 'per_tag'; tag: TagType; amount: number }
  | { type: 'per_tags_union'; tags: TagType[]; amount: number }
  | { type: 'per_city'; amount: number }
  | { type: 'per_adjacent_water'; amount: number };

export type CardEffect =
  | { type: 'place_water'; constraint?: PlacementConstraint }
  | { type: 'place_greenery'; constraint?: PlacementConstraint }
  | { type: 'gain_heat'; count: number }
  | { type: 'place_heat_on_map'; constraint?: PlacementConstraint }
  | { type: 'gain_credits'; formula: CreditFormula }
  | { type: 'gain_resource_token'; choice: boolean }
  | { type: 'place_or_relocate_city'; bonusCondition?: CityBonusCondition }
  | { type: 'return_greenery' }
  | { type: 'composite'; effects: CardEffect[] };

export type CostReduction =
  | { type: 'per_tag'; tag: TagType; beyond?: number; amount: number }
  | { type: 'per_tile'; tile: ParameterTileType; beyond?: number; amount: number }
  | { type: 'per_city_on_row'; row: MapRow; amount: number }
  | { type: 'per_adjacent_unoccupied'; amount: number }
  | { type: 'per_heat_cubes'; divisor: number; amount: number }
  | { type: 'per_greenery_adjacent_to_own_cities'; amount: number };

export interface CardSide {
  cardId: CardId;
  side: CardSideId;
  name: string;
  color: CardColor;
  cost: number;
  costReduction: CostReduction | null;
  parameterReduction: ParameterReduction | null;
  tagRequirements: TagRequirement[];
  parameterRequirements: ParameterRequirement[];
  effect: CardEffect;
  tags: [TagType, TagType];
}

export interface ProjectCard {
  id: CardId;
  sideA: CardSide;
  sideB: CardSide;
}

// --- Drafted Cards (in-play during a Generation) ---

export interface DraftedCard {
  cardId: CardId;
  /** Which side faces the human player */
  humanSide: CardSideId;
  /** Which side faces the AI player */
  aiSide: CardSideId;
}

// --- Player State ---

export interface PlayerState {
  id: string;                         // 'human' or 'ai'
  color: PlayerColor;
  credits: number;
  heatTilesPersonal: number;          // Heat tiles in personal supply (+1 VP each)
  cities: HexId[];                    // hex IDs where cities are placed (max 2)
  resourceTokens: ResourceType[];     // held tokens (spendable as tags)
  projectCardsFacing: CardSide[];     // the 3 sides facing this player this Generation
  usedProjectThisGen: CardId[];       // card IDs activated this Generation
  usedStandardProjectThisGen: boolean;
  hasPassed: boolean;
  creditsOnCards: number;            // credits locked on project cards/standard projects this generation
}

// --- Game State ---

export interface GameState {
  id: string;
  map: MapId;
  generation: number;
  phase: Phase;
  startPlayerId: string;              // who goes first this Generation

  players: {
    human: PlayerState;
    ai: PlayerState;
  };

  board: HexState[];                  // 19 hexes — SINGLE SHARED BOARD
  parameterSupply: {
    heat: number;                     // starts at 11
    greenery: number;                 // starts at 7
    water: number;                    // starts at 4
  };
  resourceTokenSupply: {
    nature: number;                   // starts at 2
    production: number;               // starts at 1
    science: number;                  // starts at 1
  };
  creditSupply: number;               // starts at 10 (minus 5 per player = 0 after setup)

  deck: CardId[];                     // draw pile (card IDs)
  discard: CardId[];                  // discard pile
  currentCards: DraftedCard[];        // 3 cards in play this Generation

  turnOrder: string[];                // who acts next
  passedPlayers: string[];
  actionLog: ActionLogEntry[];
  aiLog: AILogEntry[];

  endCondition: EndCondition | null;
  winner: string | null;
}

// --- Actions ---

export type GameAction =
  | { type: 'activate_project'; cardId: CardId; side: CardSideId; targetHexId?: HexId; secondaryTargetHexId?: HexId; spentTokens?: ResourceType[]; chosenResourceToken?: ResourceType; optionalSpend?: boolean }
  | { type: 'standard_project'; projectId: StandardProjectId; targetHexId?: HexId; spentTokens?: ResourceType[] }
  | { type: 'pass' };

export type StandardProjectId =
  | 'sell_patent'
  | 'build_city'
  | 'import_water'
  | 'greenhouses'
  | 'energy_farms';

export type StandardProjectEffectType =
  | 'gain_credits'
  | 'place_or_relocate_city'
  | 'place_water'
  | 'place_greenery'
  | 'gain_heat';

export interface StandardProjectDefinition {
  id: StandardProjectId;
  name: string;
  cost: number;
  tagRequirements: TagRequirement[];
  effectType: StandardProjectEffectType;
}

// --- Logging ---

export interface ActionLogEntry {
  generation: number;
  phase: Phase;
  playerId: string;
  action: GameAction;
  timestamp: number;
}

export interface AILogEntry {
  generation: number;
  phase: Phase;
  evaluatedActions?: {
    action: GameAction;
    score: number;
    breakdown?: string;
  }[];
  minimaxAdjustment?: {
    action: GameAction;
    originalScore: number;
    adjustedScore: number;
  }[];
  geminiReasoning?: string;
  decision: GameAction;
  decisionSource: 'heuristic' | 'minimax' | 'gemini' | 'random';
  timestamp: number;
}

// --- Scoring ---

export interface ScoreBreakdown {
  cityPoints: number;
  greeneryPoints: number;
  waterPoints: number;
  heatPoints: number;
  total: number;
}

export interface GameResult {
  human: ScoreBreakdown;
  ai: ScoreBreakdown;
  winner: string | null;        // null = tie (after all tiebreakers)
  tiebreaker?: string;          // which tiebreaker decided it
}
