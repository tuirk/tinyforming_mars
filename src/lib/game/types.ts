export type PlayerColor = 'White' | 'Black';
export type ResourceType = 'Nature' | 'Production' | 'Science';
export type CubeType = 'Water' | 'Greenery' | 'Heat';
export type Tag = 'Science' | 'Nature' | 'Energy' | 'Production' | 'Space' | 'Plant' | 'Building';
export type HexType = 'land' | 'water';
export type MapId = 'Tharsis' | 'Elysium';
export type TokenType = 'city' | 'specialProject';
export type CardType = 'Heat' | 'Greenery' | 'Water' | 'Grey';

export interface Hex {
  id: number;
  type: HexType;
  bonusTag?: Tag;
  owner?: PlayerColor;
  cubes: CubeType[];
  frameColor?: 'gray' | 'white' | 'green' | 'orange';
}

export interface MapData {
  id: MapId;
  name: string;
  hexes: Hex[];
}

export interface Resources {
  Nature: number;
  Production: number;
  Science: number;
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
  },
  resources: Resources;
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
  cubeSupply: {
    Water: number;
    Greenery: number;
    Heat: number;
  };
  resourceSupply: {
      Nature: number;
      Production: number;
      Science: number;
  };
  projectCardDeck: ProjectCardData[];
  isGameOver: boolean;
  passCount: number;
}
