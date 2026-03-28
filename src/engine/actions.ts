// ============================================================
// TINYforming Mars — Action Execution (Tasks 1A.8, 1A.9, 1A.10)
// Handles execution of ALL game actions: project cards, standard
// projects, and pass. Pure functions that take state + action and
// return a new state (structuredClone at the top, then mutate).
// ============================================================

import type {
  GameState,
  GameAction,
  CardEffect,
  CreditFormula,
  HexId,
  HexState,
  ResourceType,
  CardSideId,
  TagType,
} from './types';
import { getCardSide } from './cards';
import { getStandardProject } from './standardProjects';
import { calculateEffectiveCost, countPlayerTags, getPlayerById } from './rules';

// ============================================================
// Internal helper: hex lookup (rules.ts keeps its own private)
// ============================================================

function getHex(state: GameState, hexId: HexId): HexState {
  const hex = state.board.find((h) => h.id === hexId);
  if (!hex) throw new Error(`Hex ${hexId} not found on board`);
  return hex;
}

// ============================================================
// Top-level dispatcher
// ============================================================

/** Execute a validated game action and return the new state */
export function executeAction(
  state: GameState,
  action: GameAction,
  actingPlayerId: string,
): GameState {
  // Clone once at the top — all sub-functions mutate this clone
  const s = structuredClone(state);

  switch (action.type) {
    case 'activate_project':
      return executeProjectCard(s, action, actingPlayerId);
    case 'standard_project':
      return executeStandardProject(s, action, actingPlayerId);
    case 'pass':
      return executePass(s, actingPlayerId);
    default:
      throw new Error(`Unknown action type: ${(action as GameAction).type}`);
  }
}

// ============================================================
// Action: Pass
// ============================================================

function executePass(state: GameState, playerId: string): GameState {
  const player = getPlayerById(state, playerId);
  player.hasPassed = true;
  if (!state.passedPlayers.includes(playerId)) {
    state.passedPlayers.push(playerId);
  }
  return state;
}

// ============================================================
// Action: Project Card (1A.8)
// ============================================================

function executeProjectCard(
  state: GameState,
  action: Extract<GameAction, { type: 'activate_project' }>,
  playerId: string,
): GameState {
  const player = getPlayerById(state, playerId);

  // 1. Look up card side
  const cardSide = getCardSide(action.cardId, action.side);
  if (!cardSide) throw new Error(`Card side ${action.cardId}${action.side} not found`);

  // 2. Calculate effective cost
  const cost = calculateEffectiveCost(cardSide, player, state);

  // 3. Deduct credits
  player.credits -= cost;
  player.creditsOnCards += cost;

  // 4. Spend resource tokens if provided
  if (action.spentTokens && action.spentTokens.length > 0) {
    for (const token of action.spentTokens) {
      const idx = player.resourceTokens.indexOf(token);
      if (idx !== -1) {
        player.resourceTokens.splice(idx, 1);
        state.resourceTokenSupply[token]++;
      }
    }
  }

  // 5. Execute card effect
  executeCardEffect(state, cardSide.effect, playerId, action);

  // 6. Mark card as used
  player.usedProjectThisGen.push(action.cardId);

  return state;
}

// ============================================================
// Action: Standard Project (1A.9)
// ============================================================

function executeStandardProject(
  state: GameState,
  action: Extract<GameAction, { type: 'standard_project' }>,
  playerId: string,
): GameState {
  const player = getPlayerById(state, playerId);

  // 1. Look up project
  const project = getStandardProject(action.projectId);
  if (!project) throw new Error(`Standard project ${action.projectId} not found`);

  // 2. Deduct credits
  player.credits -= project.cost;
  player.creditsOnCards += project.cost;

  // 3. Spend resource tokens if provided
  if (action.spentTokens && action.spentTokens.length > 0) {
    for (const token of action.spentTokens) {
      const idx = player.resourceTokens.indexOf(token);
      if (idx !== -1) {
        player.resourceTokens.splice(idx, 1);
        state.resourceTokenSupply[token]++;
      }
    }
  }

  // 4. Execute by project ID
  switch (action.projectId) {
    case 'sell_patent':
      // Gain 1 credit from supply
      gainCreditsFromSupply(state, playerId, 1);
      break;
    case 'build_city':
      if (action.targetHexId !== undefined) {
        placeCity(state, action.targetHexId, playerId);
      }
      break;
    case 'import_water':
      if (action.targetHexId !== undefined) {
        placeWaterTile(state, action.targetHexId, playerId);
      }
      break;
    case 'greenhouses':
      if (action.targetHexId !== undefined) {
        placeGreeneryTile(state, action.targetHexId, playerId);
      }
      break;
    case 'energy_farms':
      gainHeatToPersonal(state, playerId, 1);
      break;
  }

  // 5. Mark standard project as used
  player.usedStandardProjectThisGen = true;

  return state;
}

// ============================================================
// Card Effect Executor
// ============================================================

function executeCardEffect(
  state: GameState,
  effect: CardEffect,
  playerId: string,
  action: GameAction,
): void {
  switch (effect.type) {
    case 'place_water':
      if ('targetHexId' in action && action.targetHexId !== undefined) {
        placeWaterTile(state, action.targetHexId, playerId);
      }
      break;

    case 'place_greenery':
      if ('targetHexId' in action && action.targetHexId !== undefined) {
        placeGreeneryTile(state, action.targetHexId, playerId);
      }
      break;

    case 'gain_heat':
      gainHeatToPersonal(state, playerId, effect.count);
      break;

    case 'place_heat_on_map':
      if ('targetHexId' in action && action.targetHexId !== undefined) {
        placeHeatTileOnMap(state, action.targetHexId, playerId);
      }
      break;

    case 'gain_credits': {
      const contextHexId = 'targetHexId' in action ? action.targetHexId : undefined;
      const amount = evaluateCreditFormula(effect.formula, state, playerId, contextHexId);
      gainCreditsFromSupply(state, playerId, amount);
      break;
    }

    case 'gain_resource_token':
      if ('chosenResourceToken' in action && action.chosenResourceToken !== undefined) {
        gainResourceToken(state, playerId, action.chosenResourceToken);
      }
      break;

    case 'place_or_relocate_city':
      if ('targetHexId' in action && action.targetHexId !== undefined) {
        placeOrRelocateCity(state, action.targetHexId, playerId);

        // Check bonus condition (e.g., Research Outpost: not adjacent to cubes)
        if (effect.bonusCondition) {
          const hex = getHex(state, action.targetHexId);
          if (effect.bonusCondition.not_adjacent_to_cubes) {
            const adjacents = hex.adjacentHexIds.map((id) => getHex(state, id));
            const hasAdjacentCubes = adjacents.some(
              (adj) => adj.tile !== null || adj.city !== null,
            );
            if (!hasAdjacentCubes) {
              // Bonus: gain resource token
              if (
                effect.bonusCondition.bonus.type === 'gain_resource_token' &&
                'chosenResourceToken' in action &&
                action.chosenResourceToken !== undefined
              ) {
                gainResourceToken(state, playerId, action.chosenResourceToken);
              }
            }
          }
        }
      }
      break;

    case 'return_greenery':
      if ('secondaryTargetHexId' in action && action.secondaryTargetHexId !== undefined) {
        returnGreeneryToSupply(state, action.secondaryTargetHexId);
      }
      break;

    case 'composite':
      executeCompositeEffect(state, effect.effects, playerId, action);
      break;
  }
}

// ============================================================
// Composite Effect Handler — SPECIAL CARDS
// ============================================================

function executeCompositeEffect(
  state: GameState,
  effects: CardEffect[],
  playerId: string,
  action: GameAction,
): void {
  // Detect special cards by checking the action's cardId
  const cardId = 'cardId' in action ? action.cardId : undefined;
  const side: CardSideId | undefined = 'side' in action ? action.side : undefined;

  // --- Comet (Card 10B) ---
  if (cardId === 10 && side === 'B') {
    // Step 1: gain_heat(1)
    gainHeatToPersonal(state, playerId, 1);

    // Step 2: IF player now has 5+ heatTilesPersonal AND water supply > 0, place water
    const player = getPlayerById(state, playerId);
    if (
      player.heatTilesPersonal >= 5 &&
      state.parameterSupply.water > 0 &&
      'targetHexId' in action &&
      action.targetHexId !== undefined
    ) {
      placeWaterTile(state, action.targetHexId, playerId);
    }
    return;
  }

  // --- Aquifer Pumping (Card 11B) ---
  if (cardId === 11 && side === 'B') {
    if ('targetHexId' in action && action.targetHexId !== undefined) {
      const targetHexId = action.targetHexId;

      // Check adjacency BEFORE placing — count water tiles adjacent to target hex
      const hex = getHex(state, targetHexId);
      const adjacentWaterCount = hex.adjacentHexIds
        .map((id) => getHex(state, id))
        .filter((adj) => adj.tile === 'water').length;

      // Place the water tile (this also grants +1 credit per adjacent water via placeWaterTile)
      placeWaterTile(state, targetHexId, playerId);

      // Aquifer Pumping bonus: +2 credits if NOT adjacent to any other water
      if (adjacentWaterCount === 0) {
        gainCreditsFromSupply(state, playerId, 2);
      }
    }
    return;
  }

  // --- Methane from Titan (Card 12B) ---
  if (cardId === 12 && side === 'B') {
    // Step 1: gain_heat(1)
    gainHeatToPersonal(state, playerId, 1);

    // Step 2: Optional spend — if action.optionalSpend === true AND player has 2+ credits
    // AND has Space tag, deduct 2 more credits and gain 1 more heat
    if ('optionalSpend' in action && action.optionalSpend === true) {
      const player = getPlayerById(state, playerId);
      const tags = countPlayerTags(player, state);
      if (player.credits >= 2 && tags.space >= 1) {
        player.credits -= 2;
        player.creditsOnCards += 2;
        gainHeatToPersonal(state, playerId, 1);
      }
    }
    return;
  }

  // --- Generic composite: execute effects in sequence ---
  for (const effect of effects) {
    executeCardEffect(state, effect, playerId, action);
  }
}

// ============================================================
// Tile Placement Helpers (1A.10)
// ============================================================

function placeWaterTile(
  state: GameState,
  hexId: HexId,
  playerId: string,
): void {
  const hex = getHex(state, hexId);
  hex.tile = 'water';
  hex.tilePlacedBy = playerId;

  // Decrement water supply
  state.parameterSupply.water--;

  // If hex has resourceTokenIcon and that token is in supply, give to player
  if (hex.resourceTokenIcon !== null) {
    const tokenType = hex.resourceTokenIcon;
    if (state.resourceTokenSupply[tokenType] > 0) {
      state.resourceTokenSupply[tokenType]--;
      const player = getPlayerById(state, playerId);
      player.resourceTokens.push(tokenType);
    }
  }

  // Count adjacent water tiles → gain 1 credit per adjacent water from creditSupply
  const adjacentWaterCount = hex.adjacentHexIds
    .map((id) => getHex(state, id))
    .filter((adj) => adj.tile === 'water').length;
  if (adjacentWaterCount > 0) {
    gainCreditsFromSupply(state, playerId, adjacentWaterCount);
  }
}

function placeGreeneryTile(
  state: GameState,
  hexId: HexId,
  playerId: string,
): void {
  const hex = getHex(state, hexId);
  hex.tile = 'greenery';
  hex.tilePlacedBy = playerId;

  // Decrement greenery supply
  state.parameterSupply.greenery--;
}

function placeHeatTileOnMap(
  state: GameState,
  hexId: HexId,
  playerId: string,
): void {
  const hex = getHex(state, hexId);
  hex.tile = 'heat';
  hex.tilePlacedBy = playerId;

  // Decrement heat supply — does NOT add to personal supply
  state.parameterSupply.heat--;
}

function gainHeatToPersonal(
  state: GameState,
  playerId: string,
  count: number,
): void {
  const available = Math.min(count, state.parameterSupply.heat);
  state.parameterSupply.heat -= available;
  const player = getPlayerById(state, playerId);
  player.heatTilesPersonal += available;
}

function gainCreditsFromSupply(
  state: GameState,
  playerId: string,
  amount: number,
): void {
  const gained = Math.min(amount, state.creditSupply);
  const player = getPlayerById(state, playerId);
  player.credits += gained;
  state.creditSupply -= gained;
}

function placeCity(
  state: GameState,
  hexId: HexId,
  playerId: string,
): void {
  const hex = getHex(state, hexId);
  hex.city = { playerId };
  const player = getPlayerById(state, playerId);
  player.cities.push(hexId);
}

function relocateCity(
  state: GameState,
  fromHexId: HexId,
  toHexId: HexId,
  playerId: string,
): void {
  // Clear old hex city
  const oldHex = getHex(state, fromHexId);
  oldHex.city = null;

  // Set new hex city
  const newHex = getHex(state, toHexId);
  newHex.city = { playerId };

  // Update player.cities array
  const player = getPlayerById(state, playerId);
  const idx = player.cities.indexOf(fromHexId);
  if (idx !== -1) {
    player.cities[idx] = toHexId;
  }
}

function placeOrRelocateCity(
  state: GameState,
  hexId: HexId,
  playerId: string,
): void {
  const player = getPlayerById(state, playerId);
  if (player.cities.length < 2) {
    placeCity(state, hexId, playerId);
  } else if (player.cities.length === 2) {
    // Relocate — move the first city
    relocateCity(state, player.cities[0], hexId, playerId);
  }
}

function returnGreeneryToSupply(state: GameState, hexId: HexId): void {
  const hex = getHex(state, hexId);
  hex.tile = null;
  hex.tilePlacedBy = null;
  state.parameterSupply.greenery++;
}

function gainResourceToken(
  state: GameState,
  playerId: string,
  tokenType: ResourceType,
): void {
  if (state.resourceTokenSupply[tokenType] > 0) {
    state.resourceTokenSupply[tokenType]--;
    const player = getPlayerById(state, playerId);
    player.resourceTokens.push(tokenType);
  }
}

// ============================================================
// Credit Formula Evaluator
// ============================================================

function evaluateCreditFormula(
  formula: CreditFormula,
  state: GameState,
  playerId: string,
  contextHexId?: HexId,
): number {
  const player = getPlayerById(state, playerId);

  switch (formula.type) {
    case 'fixed':
      return formula.amount;

    case 'per_tag': {
      const tags = countPlayerTags(player, state);
      return tags[formula.tag] * formula.amount;
    }

    case 'per_tags_union': {
      const tags = countPlayerTags(player, state);
      let total = 0;
      for (const tag of formula.tags) {
        total += tags[tag];
      }
      return total * formula.amount;
    }

    case 'per_city': {
      // Count ALL cities on board (both players)
      let cityCount = 0;
      for (const hex of state.board) {
        if (hex.city !== null) {
          cityCount++;
        }
      }
      return cityCount * formula.amount;
    }

    case 'per_adjacent_water': {
      if (contextHexId === undefined) return 0;
      const hex = getHex(state, contextHexId);
      const adjacentWaterCount = hex.adjacentHexIds
        .map((id) => getHex(state, id))
        .filter((adj) => adj.tile === 'water').length;
      return adjacentWaterCount * formula.amount;
    }

    default:
      return 0;
  }
}
