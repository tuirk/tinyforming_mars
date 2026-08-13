// ============================================================
// TINYforming Mars — Heuristic Evaluation (Task 1C.1 / 1C.2)
// Scores a GameState from a player's perspective.
// ============================================================

import type { GameState, ResourceType, TagType } from '../engine/types';
import {
  getPlayerById,
  getLegalActions,
  countPermanentTags,
  calculateEffectiveCost,
} from '../engine/rules';
import { calculatePlayerScore } from '../engine/scoring';
import { expectedCreditsAfterIncome } from '../engine/income';
import { STANDARD_PROJECTS } from '../engine/standardProjects';

export const TIEBREAK = {
  city: 0.001,
  greenery: 0.0001,
  water: 0.00001,
  heat: 0.000001,
};

export const WEIGHTS = {
  credits: 0.3,
  resourceTokenUseful: 0.8,
  resourceTokenSpare: 0.25,
  tagFirst: 0.8,
  tagSecond: 0.35,
  tagExtra: 0.1,
  affordableFacingCard: 0.12,
  standardProjectAvailable: 0.08,
  legalMoves: 0,
};

const TAG_TYPES: TagType[] = ['energy', 'production', 'nature', 'science', 'space'];

export function getEndGameProximity(state: GameState): number {
  const exhaustedCount =
    (state.parameterSupply.heat === 0 ? 1 : 0) +
    (state.parameterSupply.greenery === 0 ? 1 : 0) +
    (state.parameterSupply.water === 0 ? 1 : 0);
  const exhaustedParams = exhaustedCount / 3;
  const occupiedCount = state.board.filter(
    (h) => h.tile !== null || h.city !== null,
  ).length;
  const occupiedHexes = occupiedCount / 19;
  const generationProgress = state.generation / 12;
  return (exhaustedParams + occupiedHexes + generationProgress) / 3;
}

export function scorePermanentTags(tags: Record<TagType, number>): number {
  let s = 0;
  for (const t of TAG_TYPES) {
    const n = tags[t] ?? 0;
    if (n >= 1) s += WEIGHTS.tagFirst;
    if (n >= 2) s += WEIGHTS.tagSecond;
    if (n >= 3) s += WEIGHTS.tagExtra * (n - 2);
  }
  return s;
}

function tagDemand(state: GameState, playerId: string): Record<TagType, number> {
  const demand: Record<TagType, number> = {
    energy: 0, production: 0, nature: 0, science: 0, space: 0,
  };
  const player = getPlayerById(state, playerId);
  for (const card of player.projectCardsFacing) {
    if (player.usedProjectThisGen.includes(card.cardId)) continue;
    for (const req of card.tagRequirements) {
      demand[req.tag] = Math.max(demand[req.tag], req.count);
    }
  }
  if (!player.usedStandardProjectThisGen) {
    for (const p of STANDARD_PROJECTS) {
      for (const req of p.tagRequirements) {
        demand[req.tag] = Math.max(demand[req.tag], req.count);
      }
    }
  }
  return demand;
}

export function scoreResourceTokens(state: GameState, playerId: string): number {
  const player = getPlayerById(state, playerId);
  const permanent = countPermanentTags(player, state);
  const demand = tagDemand(state, playerId);
  const remainingShort: Record<string, number> = {};
  for (const t of TAG_TYPES) {
    remainingShort[t] = Math.max(0, demand[t] - permanent[t]);
  }
  let score = 0;
  for (const tok of player.resourceTokens) {
    const t = tok as ResourceType;
    if ((remainingShort[t] ?? 0) > 0) {
      score += WEIGHTS.resourceTokenUseful;
      remainingShort[t] -= 1;
    } else {
      score += WEIGHTS.resourceTokenSpare;
    }
  }
  return score;
}

function positionalScore(state: GameState, playerId: string, positionalMultiplier: number): number {
  const player = getPlayerById(state, playerId);
  let score = 0;
  const pid = playerId as 'human' | 'ai';
  score += expectedCreditsAfterIncome(state, pid) * WEIGHTS.credits * positionalMultiplier;
  if (!player.usedStandardProjectThisGen) {
    score += WEIGHTS.standardProjectAvailable * positionalMultiplier;
  }
  score += scorePermanentTags(countPermanentTags(player, state)) * positionalMultiplier;
  for (const card of player.projectCardsFacing) {
    if (player.credits >= calculateEffectiveCost(card, player, state)) {
      score += WEIGHTS.affordableFacingCard * positionalMultiplier;
    }
  }
  score += scoreResourceTokens(state, playerId) * positionalMultiplier;
  score += getLegalActions(state, playerId).length * WEIGHTS.legalMoves * positionalMultiplier;
  return score;
}

export function evaluate(state: GameState, playerId: string): number {
  const proximity = getEndGameProximity(state);
  const vpMultiplier = 1 + proximity * 0.5;
  const positionalMultiplier = 1 - proximity * 0.5;

  const breakdown = calculatePlayerScore(state, playerId);
  let score = breakdown.total * vpMultiplier;
  score +=
    breakdown.cityPoints * TIEBREAK.city +
    breakdown.greeneryPoints * TIEBREAK.greenery +
    breakdown.waterPoints * TIEBREAK.water +
    breakdown.heatPoints * TIEBREAK.heat;
  score += positionalScore(state, playerId, positionalMultiplier);
  return score;
}
