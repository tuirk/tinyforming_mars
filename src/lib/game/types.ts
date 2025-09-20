

export type PlayerColor = 'White' | 'Black';
export type ResourceType = 'Nature' | 'Production' | 'Science';
export type ParameterType = 'Water' | 'Greenery' | 'Heat';
export type TileType = 'city' | ParameterType;

export type Tag = 'Energy' | 'Production' | 'Nature' | 'Science' | 'Space' | 'Plant' | 'Building';
export type BonusTag = 'Production' | 'Science' | 'Nature' | 'Space';


export type HexType = 'land' | 'water';
export type MapId = 'Tharsis' | 'Elysium';
export type TokenType = 'city' | 'specialProject';
export type CardType = 'Heat' | 'Greenery' | 'Water' | 'Grey';

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

export type ProjectEffect = {
  id: string;    
  name: string;
  cost?: number | string;
  tags?: Tag[];
  requirements?: string[];
  effect: string;
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
  cardId: number;
  effect: ProjectEffect;
  usedThisGeneration: boolean;
};

export interface Player {
  id: PlayerColor;
  isAI: boolean;
  credits: number;
  tags: {
    Energy: number;
    Production: number;
    Nature: number;
    Science: number;
    Space: number;
    Building: number;
    Plant: number;
  };
  bonusTagsFromCities: {
    Production: number;
    Science: number;
    Nature: number;
    Space: number;
  };
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
  parametersInSupply: {
    Water: number;
    Greenery: number;
    Heat: number;
  };
  creditsInSupply: number;
  projectCardDeck: ProjectCardData[];
  isGameOver: boolean;
  gameEndTriggered: boolean;
  passCount: number;
}
