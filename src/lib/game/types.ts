
export type PlayerColor = 'White' | 'Black';
export type ResourceType = 'Nature' | 'Production' | 'Science';
export type ParameterType = 'Water' | 'Greenery' | 'Heat';
export type TileType = 'city' | ParameterType;

export type Tag = 'Energy' | 'Production' | 'Nature' | 'Science' | 'Space' | 'Plant' | 'Building' | 'Heat' | 'Water';
export type BonusTag = 'Production' | 'Science' | 'Nature' | 'Space';


export type HexType = 'land' | 'water';
export type MapId = 'Tharsis' | 'Elysium';
export type TokenType = 'city' | 'specialProject';

export interface Hex {
  id: number;
  type: HexType;
  bonusTag?: BonusTag;
  frameColor?: 'gray' | 'white' | 'green' | 'orange';
  isWaterReserved: boolean;
  resourceTokenIcon?: ResourceType;
  occupiedBy: {
    type: TileType | null;
    playerId: PlayerColor | null;
  };
}

export interface MapData {
  id: MapId;
  name: string;
  hexes: Hex[];
}

export type Requirements<T> = {
    [key in keyof T]?: number;
}

export type ProjectEffect = {
  id: string;
  name: string;
  cost: { credits: number, reducible: boolean };
  tagRequirements: Requirements<Record<Tag, number>>;
  parameterRequirements: Requirements<Record<ParameterType, number>>;
  effect: string;
  effectType: 'heat' | 'greenery' | 'water' | 'utility';
  automaticTags: Requirements<Record<Tag, number>>;
  costReductionRule?: string;
  parameterReductionRule?: string;
};

export type CardSide = {
  slot1: ProjectEffect; // always for the card owner
  slot2: ProjectEffect; // always for the opponent
};

export type ProjectCardData = {
  cardId: number;
  sideA: CardSide;
  sideB: CardSide;
};

export type PlayerProjectCard = {
  effect: ProjectEffect;
  usedThisGeneration: boolean;
};

export type ActiveProjectCard = {
  cardId: number;
  player1Side: ProjectEffect;
  player2Side: ProjectEffect;
};

export interface Player {
  id: PlayerColor;
  isAI: boolean;
  credits: number;
  permanentTags: Requirements<Record<Tag, number>>;
  bonusTagsFromCities: Requirements<Record<BonusTag, number>>;
  resourceTokens: Requirements<Record<ResourceType, number>>;
  cities: number[]; // hex IDs
  personalSupply: {
    heat: number;
  };
  parameterCubes: {
    Water: number;
    Greenery: number;
    Heat: number;
  };
  tokens: {
    city: number;
    specialProject: number;
  };
  projectCards: PlayerProjectCard[];
  victoryPoints: number;
  map: MapData;
  standardProjectUsed: boolean;
}

export interface StandardProject {
    id: string;
    title: string;
    description: string;
    cost: number;
    action: (gameState: GameState, player: Player) => { newGameState: GameState; newPlayer: Player };
}

export interface GameState {
  generation: number;
  phase: 'Research' | 'Action' | 'Income' | 'End';
  players: Player[];
  currentPlayerIndex: number;
  startingPlayerIndex: number;
  supplies: {
    parameterTiles: {
      Water: number;
      Greenery: number;
      Heat: number;
    };
    resourceTokens: {
      Nature: number;
      Production: number;
      Science: number;
    };
    credits: number;
  };
  projectCards: {
    drawDeck: ProjectCardData[];
    discardPile: ProjectCardData[];
    activeCards: ActiveProjectCard[];
  };
  isGameOver: boolean;
  gameEndTriggered: boolean;
  passCount: number;
}
