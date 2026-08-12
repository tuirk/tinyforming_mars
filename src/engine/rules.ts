// ============================================================
// TINYforming Mars — Rules Engine (Tasks 1A.5, 1A.6, 1A.7)
// Pure functions: tag counting, requirement checking, legal moves
// ============================================================

import type {
  GameState,
  PlayerState,
  CardSide,
  CardEffect,
  TagType,
  TagRequirement,
  ParameterRequirement,
  ParameterTileType,
  ResourceType,
  HexId,
  HexState,
  GameAction,
  CardSideId,
  PlacementConstraint,
  MapRow,
  StandardProjectDefinition,
} from './types';
import { getCardSide } from './cards';
import { STANDARD_PROJECTS } from './standardProjects';

// ============================================================
// Requirement check result
// ============================================================

export interface RequirementCheckResult {
  canActivate: boolean;
  effectiveCost: number;
  missingTags: TagRequirement[];
  missingParams: ParameterRequirement[];
  insufficientCredits: boolean;
  noSupplyForEffect: boolean;
}

// ============================================================
// Helper: player & opponent lookup
// ============================================================

export function getPlayerById(state: GameState, id: string): PlayerState {
  if (id === 'human') return state.players.human;
  if (id === 'ai') return state.players.ai;
  throw new Error(`Unknown player id: ${id}`);
}

export function getOpponentId(playerId: string): string {
  return playerId === 'human' ? 'ai' : 'human';
}

// ============================================================
// Helper: board queries
// ============================================================

function getHex(state: GameState, hexId: HexId): HexState {
  const hex = state.board.find((h) => h.id === hexId);
  if (!hex) throw new Error(`Hex ${hexId} not found on board`);
  return hex;
}

function isOccupied(hex: HexState): boolean {
  return hex.tile !== null || hex.city !== null;
}

/** Count tiles of a specific type on the board */
export function countMapTiles(state: GameState, tileType: ParameterTileType): number {
  return state.board.filter((h) => h.tile === tileType).length;
}

/** Calculate the current parameter level */
export function calculateParameterLevel(state: GameState, paramType: ParameterTileType): number {
  if (paramType === 'heat') {
    // Heat level = personal heat cubes of both players + heat tiles on the board
    return (
      state.players.human.heatTilesPersonal +
      state.players.ai.heatTilesPersonal +
      countMapTiles(state, 'heat')
    );
  }
  // Greenery and water levels = count of those tiles on the board
  return countMapTiles(state, paramType);
}

// ============================================================
// Task 1A.5: Tag Counting
// ============================================================

/**
 * Count a player's available tags from all sources:
 * (a) Bottom tags on all 3 project card sides facing them
 * (b) Bonus hex tags from cities on bonus hexes
 * (c) Held resource tokens (spendable as matching tags)
 */
export function countPlayerTags(player: PlayerState, state: GameState): Record<TagType, number> {
  const tags = countPermanentTags(player, state);

  // (c) Resource tokens — nature, production, science map 1:1 to matching tag
  for (const token of player.resourceTokens) {
    tags[token as TagType]++;
  }

  return tags;
}

/**
 * Tags that are always available without spending: card bottoms + bonus hex cities.
 * Resource tokens are NOT included — they must be spent to count toward requirements.
 */
export function countPermanentTags(player: PlayerState, state: GameState): Record<TagType, number> {
  const tags: Record<TagType, number> = {
    energy: 0,
    production: 0,
    nature: 0,
    science: 0,
    space: 0,
  };

  for (const cardSide of player.projectCardsFacing) {
    tags[cardSide.tags[0]]++;
    tags[cardSide.tags[1]]++;
  }

  for (const cityHexId of player.cities) {
    const hex = getHex(state, cityHexId);
    if (hex.bonusTag !== null) {
      tags[hex.bonusTag]++;
    }
  }

  return tags;
}

/**
 * Minimum resource tokens to spend so tag requirements are met.
 * Rulebook: tokens are returned to supply when needed as matching tags.
 * Only spends for the shortfall beyond permanent tags (cards + bonus hexes).
 */
export function computeSpentTokensForRequirements(
  player: PlayerState,
  state: GameState,
  requirements: TagRequirement[],
): ResourceType[] {
  const permanent = countPermanentTags(player, state);
  const pool = [...player.resourceTokens];
  const spent: ResourceType[] = [];

  for (const req of requirements) {
    const shortfall = Math.max(0, req.count - permanent[req.tag]);
    if (shortfall === 0) continue;

    // Only nature / production / science exist as resource tokens
    if (req.tag !== 'nature' && req.tag !== 'production' && req.tag !== 'science') {
      continue;
    }

    for (let i = 0; i < shortfall; i++) {
      const idx = pool.indexOf(req.tag);
      if (idx === -1) break;
      pool.splice(idx, 1);
      spent.push(req.tag);
    }
  }

  return spent;
}

// ============================================================
// Task 1A.6: Effective Cost Calculation
// ============================================================

export function calculateEffectiveCost(
  card: CardSide,
  player: PlayerState,
  state: GameState,
): number {
  let cost = card.cost;

  if (!card.costReduction) return cost;

  const reduction = card.costReduction;
  let discount = 0;

  switch (reduction.type) {
    case 'per_tag': {
      const tagCount = countPlayerTags(player, state)[reduction.tag];
      const beyond = reduction.beyond ?? 0;
      const excess = Math.max(0, tagCount - beyond);
      discount = excess * reduction.amount;
      break;
    }
    case 'per_tile': {
      const tileCount = countMapTiles(state, reduction.tile);
      const beyond = reduction.beyond ?? 0;
      const excess = Math.max(0, tileCount - beyond);
      discount = excess * reduction.amount;
      break;
    }
    case 'per_city_on_row': {
      // Count ALL cities (both players) on the specified row
      let cityCount = 0;
      for (const hex of state.board) {
        if (hex.city !== null && hex.row === reduction.row) {
          cityCount++;
        }
      }
      discount = cityCount * reduction.amount;
      break;
    }
    case 'per_adjacent_unoccupied': {
      // Count unoccupied hexes adjacent to THIS player's cities
      const seen = new Set<HexId>();
      for (const cityHexId of player.cities) {
        const cityHex = getHex(state, cityHexId);
        for (const adjId of cityHex.adjacentHexIds) {
          if (!seen.has(adjId)) {
            seen.add(adjId);
            const adjHex = getHex(state, adjId);
            if (!isOccupied(adjHex)) {
              discount += reduction.amount;
            }
          }
        }
      }
      break;
    }
    case 'per_heat_cubes': {
      const heatCubes = player.heatTilesPersonal;
      discount = Math.floor(heatCubes / reduction.divisor) * reduction.amount;
      break;
    }
    case 'per_greenery_adjacent_to_own_cities': {
      // Count greenery tiles adjacent to this player's cities (deduplicated)
      const seenGreenery = new Set<HexId>();
      for (const cityHexId of player.cities) {
        const cityHex = getHex(state, cityHexId);
        for (const adjId of cityHex.adjacentHexIds) {
          if (!seenGreenery.has(adjId)) {
            seenGreenery.add(adjId);
            const adjHex = getHex(state, adjId);
            if (adjHex.tile === 'greenery') {
              discount += reduction.amount;
            }
          }
        }
      }
      break;
    }
  }

  cost -= discount;
  // Minimum cost is 1 for cards with costReduction
  return Math.max(1, cost);
}

// ============================================================
// Task 1A.6: Requirement Checking — Project Cards
// ============================================================

export function checkRequirements(
  player: PlayerState,
  state: GameState,
  card: CardSide,
): RequirementCheckResult {
  const effectiveCost = calculateEffectiveCost(card, player, state);
  const playerTags = countPlayerTags(player, state);

  // Check tag requirements
  const missingTags: TagRequirement[] = [];
  for (const req of card.tagRequirements) {
    if (playerTags[req.tag] < req.count) {
      missingTags.push({ tag: req.tag, count: req.count - playerTags[req.tag] });
    }
  }

  // Check parameter requirements (with parameterReduction)
  const missingParams: ParameterRequirement[] = [];
  for (const req of card.parameterRequirements) {
    let requiredLevel = req.count;

    // Apply parameter reduction (e.g., Insects: reduce heat req per science tag)
    if (card.parameterReduction && card.parameterReduction.parameter === req.type) {
      const pr = card.parameterReduction;
      const tagCount = playerTags[pr.per_tag];
      const excess = Math.max(0, tagCount - pr.beyond);
      requiredLevel -= excess * pr.reduction_per_tag;
      requiredLevel = Math.max(pr.minimum, requiredLevel);
    }

    const currentLevel = calculateParameterLevel(state, req.type);
    if (currentLevel < requiredLevel) {
      missingParams.push({ type: req.type, count: requiredLevel - currentLevel });
    }
  }

  // Check credits
  const insufficientCredits = player.credits < effectiveCost;

  // Check supply for effect
  const noSupplyForEffect = !hasSupplyForEffect(state, card.effect);

  const canActivate =
    missingTags.length === 0 &&
    missingParams.length === 0 &&
    !insufficientCredits &&
    !noSupplyForEffect;

  return {
    canActivate,
    effectiveCost,
    missingTags,
    missingParams,
    insufficientCredits,
    noSupplyForEffect,
  };
}

/** Check whether the supply has tiles/tokens for the effect */
function hasSupplyForEffect(
  state: GameState,
  effect: CardSide['effect'],
): boolean {
  switch (effect.type) {
    case 'place_water':
      return state.parameterSupply.water > 0;
    case 'place_greenery':
      return state.parameterSupply.greenery > 0;
    case 'place_heat_on_map':
      return state.parameterSupply.heat > 0;
    case 'gain_heat':
      return true; // gainHeatToPersonal handles supply=0 gracefully with Math.min
    case 'gain_resource_token':
      return (
        state.resourceTokenSupply.nature > 0 ||
        state.resourceTokenSupply.production > 0 ||
        state.resourceTokenSupply.science > 0
      );
    case 'composite':
      // Check the primary (first) effect
      return effect.effects.length === 0 || hasSupplyForEffect(state, effect.effects[0]);
    case 'gain_credits':
      return true; // Credits come from supply but we don't block on creditSupply for card effects
    case 'place_or_relocate_city':
      return true; // Cities are player pieces, not from a supply
    case 'return_greenery':
      return true; // Returning greenery is always possible (if there is one on the board)
    default:
      return true;
  }
}

// ============================================================
// Task 1A.6: Requirement Checking — Standard Projects
// ============================================================

export function checkStandardProjectRequirements(
  player: PlayerState,
  state: GameState,
  project: StandardProjectDefinition,
): RequirementCheckResult {
  const effectiveCost = project.cost;
  const playerTags = countPlayerTags(player, state);

  // Check tag requirements
  const missingTags: TagRequirement[] = [];
  for (const req of project.tagRequirements) {
    if (playerTags[req.tag] < req.count) {
      missingTags.push({ tag: req.tag, count: req.count - playerTags[req.tag] });
    }
  }

  // No parameter requirements for standard projects
  const missingParams: ParameterRequirement[] = [];

  // Check credits
  const insufficientCredits = player.credits < effectiveCost;

  // Check supply for effect
  let noSupplyForEffect = false;
  switch (project.effectType) {
    case 'place_water':
      noSupplyForEffect = state.parameterSupply.water <= 0;
      break;
    case 'place_greenery':
      noSupplyForEffect = state.parameterSupply.greenery <= 0;
      break;
    case 'gain_heat':
      noSupplyForEffect = state.parameterSupply.heat <= 0;
      break;
    case 'gain_credits':
      // sell_patent: check credit supply > 0
      if (project.id === 'sell_patent') {
        noSupplyForEffect = state.creditSupply <= 0;
      }
      break;
    case 'place_or_relocate_city':
      // build_city: place if under 2 cities, else relocate — needs a valid hex either way
      {
        if (player.cities.length >= 2) {
          noSupplyForEffect = !player.cities.some(
            (fromHexId) =>
              getValidHexesForPlacement(state, 'city', player.id, undefined, {
                ignoreCityHexId: fromHexId,
              }).length > 0,
          );
        } else {
          const validHexes = getValidHexesForPlacement(state, 'city', player.id);
          noSupplyForEffect = validHexes.length === 0;
        }
      }
      break;
  }

  const canActivate =
    missingTags.length === 0 &&
    missingParams.length === 0 &&
    !insufficientCredits &&
    !noSupplyForEffect;

  return {
    canActivate,
    effectiveCost,
    missingTags,
    missingParams,
    insufficientCredits,
    noSupplyForEffect,
  };
}

// ============================================================
// Task 1A.7: Hex Placement Validation
// ============================================================

/**
 * Check whether a hex meets a placement constraint.
 */
function hexMeetsConstraint(
  state: GameState,
  hexId: HexId,
  constraint: PlacementConstraint,
  _playerId: string,
): boolean {
  const hex = getHex(state, hexId);

  // Row constraint
  if (constraint.row !== undefined && hex.row !== constraint.row) {
    return false;
  }

  // Hex type constraint
  if (constraint.hex_type !== undefined && hex.type !== constraint.hex_type) {
    return false;
  }

  // Adjacent-to constraint
  if (constraint.adjacent_to !== undefined) {
    const adjacents = hex.adjacentHexIds.map((id) => getHex(state, id));
    switch (constraint.adjacent_to) {
      case 'city':
        if (!adjacents.some((adj) => adj.city !== null)) return false;
        break;
      case 'greenery':
        if (!adjacents.some((adj) => adj.tile === 'greenery')) return false;
        break;
      case 'water':
        if (!adjacents.some((adj) => adj.tile === 'water')) return false;
        break;
      case 'none':
        if (adjacents.some((adj) => adj.tile !== null || adj.city !== null)) return false;
        break;
    }
  }

  // Not-adjacent-to constraint
  if (constraint.not_adjacent_to !== undefined) {
    const adjacents = hex.adjacentHexIds.map((id) => getHex(state, id));
    switch (constraint.not_adjacent_to) {
      case 'city':
        if (adjacents.some((adj) => adj.city !== null)) return false;
        break;
    }
  }

  // Minimum adjacent greenery
  if (constraint.min_adjacent_greenery !== undefined) {
    const count = hex.adjacentHexIds
      .map((id) => getHex(state, id))
      .filter((adj) => adj.tile === 'greenery').length;
    if (count < constraint.min_adjacent_greenery) return false;
  }

  // Minimum adjacent water
  if (constraint.min_adjacent_water !== undefined) {
    const count = hex.adjacentHexIds
      .map((id) => getHex(state, id))
      .filter((adj) => adj.tile === 'water').length;
    if (count < constraint.min_adjacent_water) return false;
  }

  return true;
}

/**
 * Get all valid hex IDs for placing a tile or city.
 */
export function getValidHexesForPlacement(
  state: GameState,
  tileType: ParameterTileType | 'city',
  playerId: string,
  constraint?: PlacementConstraint,
  options?: { ignoreCityHexId?: HexId },
): HexId[] {
  const validHexes: HexId[] = [];

  for (const hex of state.board) {
    // Must be unoccupied (no tile AND no city)
    if (isOccupied(hex)) continue;

    switch (tileType) {
      case 'water':
        // Water goes on water hexes, unless card allows any hex (Ice Cap Melting)
        if (!constraint?.allow_any_hex && hex.type !== 'water') continue;
        break;
      case 'greenery':
        // Greenery normally goes on land, UNLESS constraint says hex_type=water (Protected Valley)
        if (constraint?.hex_type === 'water') {
          if (hex.type !== 'water') continue;
        } else {
          if (hex.type !== 'land') continue;
        }
        break;
      case 'heat':
        // Heat on map goes on land hexes
        if (hex.type !== 'land') continue;
        break;
      case 'city':
        // Cities go on land, not adjacent to any other city
        if (hex.type !== 'land') continue;
        {
          const player = getPlayerById(state, playerId);
          const ignoreCityHexId =
            options?.ignoreCityHexId ??
            (player.cities.length >= 2 ? player.cities[0] : null);
          const adjacents = hex.adjacentHexIds.map((id) => getHex(state, id));
          if (
            adjacents.some(
              (adj) => adj.city !== null && adj.id !== ignoreCityHexId,
            )
          ) {
            continue;
          }
        }
        break;
    }

    // Check constraint if provided
    if (constraint && !hexMeetsConstraint(state, hex.id, constraint, playerId)) {
      continue;
    }

    validHexes.push(hex.id);
  }

  return validHexes;
}

// ============================================================
// Task 1A.7: Legal Move Generation
// ============================================================

/**
 * Determine the tile type that an effect places (if any).
 */
function effectPlacesTile(
  effect: CardSide['effect'],
): { tileType: ParameterTileType | 'city'; constraint?: PlacementConstraint } | null {
  switch (effect.type) {
    case 'place_water':
      return { tileType: 'water', constraint: effect.constraint };
    case 'place_greenery':
      return { tileType: 'greenery', constraint: effect.constraint };
    case 'place_heat_on_map':
      return { tileType: 'heat', constraint: effect.constraint };
    case 'place_or_relocate_city':
      return { tileType: 'city' };
    case 'composite':
      // Check the primary (first) effect for placement
      for (const sub of effect.effects) {
        const result = effectPlacesTile(sub);
        if (result) return result;
      }
      return null;
    default:
      return null;
  }
}

/**
 * Check if an effect (or composite sub-effect) requires a resource token choice.
 */
function effectNeedsResourceTokenChoice(effect: CardEffect): boolean {
  if (effect.type === 'gain_resource_token' && effect.choice) return true;
  if (effect.type === 'composite') return effect.effects.some(effectNeedsResourceTokenChoice);
  if (effect.type === 'place_or_relocate_city' && effect.bonusCondition?.bonus.type === 'gain_resource_token') return true;
  return false;
}

/**
 * Check if an effect (or composite sub-effect) contains a return_greenery effect.
 */
function effectHasReturnGreenery(effect: CardEffect): boolean {
  if (effect.type === 'return_greenery') return true;
  if (effect.type === 'composite') return effect.effects.some(effectHasReturnGreenery);
  return false;
}

/**
 * Get all legal actions for a player in the current game state.
 * This is the main entry point for both UI and AI.
 */
export function getLegalActions(state: GameState, playerId: string): GameAction[] {
  const player = getPlayerById(state, playerId);
  const actions: GameAction[] = [];

  // After passing, no further actions this generation
  if (player.hasPassed) {
    return actions;
  }

  // 1. Project cards
  for (const drafted of state.currentCards) {
    const side: CardSideId = playerId === 'human' ? drafted.humanSide : drafted.aiSide;
    const cardSide = getCardSide(drafted.cardId, side);
    if (!cardSide) continue;

    // Skip if already used this generation
    if (player.usedProjectThisGen.includes(drafted.cardId)) continue;

    // Check requirements
    const result = checkRequirements(player, state, cardSide);
    if (!result.canActivate) continue;

    // Determine action variants based on effect properties
    const needsResourceToken = effectNeedsResourceTokenChoice(cardSide.effect);
    const hasReturnGreenery = effectHasReturnGreenery(cardSide.effect);
    const isMethaneFromTitan = drafted.cardId === 12 && side === 'B';
    const isComet = drafted.cardId === 10 && side === 'B';
    const isResearchOutpost = drafted.cardId === 7 && side === 'B';

    // Collect available resource token types if needed
    const tokenTypes: ResourceType[] = [];
    if (needsResourceToken) {
      if (state.resourceTokenSupply.nature > 0) tokenTypes.push('nature');
      if (state.resourceTokenSupply.production > 0) tokenTypes.push('production');
      if (state.resourceTokenSupply.science > 0) tokenTypes.push('science');
    }

    // Collect greenery hex IDs on the board for return_greenery cards
    const greeneryHexIds: HexId[] = [];
    if (hasReturnGreenery) {
      for (const hex of state.board) {
        if (hex.tile === 'greenery') greeneryHexIds.push(hex.id);
      }
    }

    // --- Comet (10B): gain heat always; optional water if post-gain heat >= 5 ---
    if (isComet) {
      const baseAction: GameAction = {
        type: 'activate_project',
        cardId: drafted.cardId,
        side,
      };
      actions.push(baseAction);
      const heatAfter = player.heatTilesPersonal + 1;
      if (heatAfter >= 5 && state.parameterSupply.water > 0) {
        const waterHexes = getValidHexesForPlacement(state, 'water', playerId);
        for (const hexId of waterHexes) {
          actions.push({ ...baseAction, targetHexId: hexId });
        }
      }
      continue;
    }

    // Check if effect requires tile placement
    const placement = effectPlacesTile(cardSide.effect);
    if (placement) {
      // Research Outpost / city place-or-relocate with 2 cities: fromHexId × target
      if (isResearchOutpost && player.cities.length >= 2) {
        for (const fromHexId of player.cities) {
          const validHexes = getValidHexesForPlacement(
            state,
            'city',
            playerId,
            undefined,
            { ignoreCityHexId: fromHexId },
          );
          for (const hexId of validHexes) {
            const baseAction: GameAction = {
              type: 'activate_project',
              cardId: drafted.cardId,
              side,
              targetHexId: hexId,
              fromHexId,
            };
            if (needsResourceToken && tokenTypes.length > 0) {
              for (const tokenType of tokenTypes) {
                actions.push({ ...baseAction, chosenResourceToken: tokenType });
              }
            } else {
              actions.push(baseAction);
            }
          }
        }
        continue;
      }

      const validHexes = getValidHexesForPlacement(
        state,
        placement.tileType,
        playerId,
        placement.constraint,
      );
      // If placement is needed but no valid hexes, card cannot be activated
      if (validHexes.length === 0) continue;

      for (const hexId of validHexes) {
        const baseAction: GameAction = {
          type: 'activate_project',
          cardId: drafted.cardId,
          side,
          targetHexId: hexId,
        };

        if (needsResourceToken && tokenTypes.length > 0) {
          for (const tokenType of tokenTypes) {
            actions.push({ ...baseAction, chosenResourceToken: tokenType });
          }
        } else if (hasReturnGreenery) {
          // Ice Asteroid (4A): return 1 adjacent greenery is mandatory when any exist
          const placedHex = state.board.find((h) => h.id === hexId);
          let adjGreeneryCount = 0;
          if (placedHex) {
            for (const adjId of placedHex.adjacentHexIds) {
              const adjHex = state.board.find((h) => h.id === adjId);
              if (adjHex && adjHex.tile === 'greenery') {
                adjGreeneryCount++;
                actions.push({ ...baseAction, secondaryTargetHexId: adjId });
              }
            }
          }
          if (adjGreeneryCount === 0) {
            actions.push(baseAction);
          }
        } else {
          actions.push(baseAction);
        }
      }
    } else {
      // No placement needed
      const baseAction: GameAction = {
        type: 'activate_project',
        cardId: drafted.cardId,
        side,
      };

      if (needsResourceToken && tokenTypes.length > 0) {
        for (const tokenType of tokenTypes) {
          actions.push({ ...baseAction, chosenResourceToken: tokenType });
        }
      } else if (isMethaneFromTitan) {
        actions.push(baseAction);
        const tags = countPlayerTags(player, state);
        const creditsAfterCost = player.credits - result.effectiveCost;
        if (creditsAfterCost >= 2 && tags.space >= 2) {
          actions.push({ ...baseAction, optionalSpend: true });
        }
      } else if (hasReturnGreenery) {
        // Asteroid (13B): no tile placement, optional return greenery from anywhere
        for (const gHexId of greeneryHexIds) {
          actions.push({ ...baseAction, secondaryTargetHexId: gHexId });
        }
        // Also allow activating without returning greenery (it's optional)
        actions.push(baseAction);
      } else {
        actions.push(baseAction);
      }
    }
  }

  // 2. Standard projects
  if (!player.usedStandardProjectThisGen) {
    for (const project of STANDARD_PROJECTS) {
      const result = checkStandardProjectRequirements(player, state, project);
      if (!result.canActivate) continue;

      // Check if effect requires tile placement
      switch (project.effectType) {
        case 'place_water': {
          const validHexes = getValidHexesForPlacement(state, 'water', playerId);
          for (const hexId of validHexes) {
            actions.push({
              type: 'standard_project',
              projectId: project.id,
              targetHexId: hexId,
            });
          }
          break;
        }
        case 'place_greenery': {
          const validHexes = getValidHexesForPlacement(state, 'greenery', playerId);
          for (const hexId of validHexes) {
            actions.push({
              type: 'standard_project',
              projectId: project.id,
              targetHexId: hexId,
            });
          }
          break;
        }
        case 'place_or_relocate_city': {
          if (player.cities.length >= 2) {
            for (const fromHexId of player.cities) {
              const validHexes = getValidHexesForPlacement(
                state,
                'city',
                playerId,
                undefined,
                { ignoreCityHexId: fromHexId },
              );
              for (const hexId of validHexes) {
                actions.push({
                  type: 'standard_project',
                  projectId: project.id,
                  targetHexId: hexId,
                  fromHexId,
                });
              }
            }
          } else {
            const validHexes = getValidHexesForPlacement(state, 'city', playerId);
            for (const hexId of validHexes) {
              actions.push({
                type: 'standard_project',
                projectId: project.id,
                targetHexId: hexId,
              });
            }
          }
          break;
        }
        default:
          // gain_credits, gain_heat — no placement needed
          actions.push({
            type: 'standard_project',
            projectId: project.id,
          });
          break;
      }
    }
  }

  // 3. Pass action — always available if player hasn't passed
  if (!player.hasPassed) {
    actions.push({ type: 'pass' });
  }

  return actions;
}
