export type PlayerColor = 'White' | 'Black';
export type ResourceType = 'Nature' | 'Production' | 'Science';
export type CubeType = 'Water' | 'Greenery' | 'Heat';
export type Tag = 'Science' | 'Nature' | 'Energy' | 'Production' | 'Building';
export type HexType = 'land' | 'water';

export interface Hex {
  id: number;
  type: HexType;
  bonusTag?: Tag;
  owner?: PlayerColor;
  cubes: CubeType[];
}

export interface MapData {
  name: string;
  hexes: Hex[];
}

export interface Resources {
  Nature: number;
  Production: number;
  Science: number;
}

export interface Player {
  id: PlayerColor;
  credits: number;
  resources: Resources;
  parameterCubes: {
    Water: number;
    Greenery: number;
    Heat: number;
  };
  projectCards: ProjectCardData[];
  playedProjectCards: ProjectCardData[];
  victoryPoints: number;
}

export interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  cost: number;
  tags: Tag[];
  requirements: {
    tags?: Partial<Record<Tag, number>>;
    resources?: Partial<Resources>;
  };
  effect: (gameState: GameState, player: Player) => { newGameState: GameState; newPlayer: Player };
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
  players: {
    White: Player;
    Black: Player;
  };
  currentPlayer: PlayerColor;
  startingPlayer: PlayerColor;
  map: MapData;
  cubeSupply: {
    Water: number;
    Greenery: number;
    Heat: number;
  };
  projectCardDeck: ProjectCardData[];
  isGameOver: boolean;
  passCount: number;
}
