/**
 * Serializes game state and actions into compact text for LLM context.
 */

import type { GameState, GameAction } from '@/engine/types';
import type { ScoredAction } from './aiController';
import { getCard } from '@/engine/cards';
import { describeCardEffect } from '@/lib/cardDescriptions';

/**
 * Serialize the full game state into a compact text summary for the LLM.
 */
export function serializeGameState(state: GameState): string {
  const ai = state.players.ai;
  const human = state.players.human;

  const tilesOnBoard = state.board.filter(h => h.tile !== null);
  const citiesOnBoard = state.board.filter(h => h.city !== null);

  const boardSummary = state.board
    .filter(h => h.tile || h.city)
    .map(h => {
      const parts = [`Hex ${h.id} (${h.type}${h.bonusTag ? `, bonus:${h.bonusTag}` : ''})`];
      if (h.tile) parts.push(`tile:${h.tile} by ${h.tilePlacedBy}`);
      if (h.city) parts.push(`city:${h.city.playerId}`);
      return parts.join(' — ');
    })
    .join('\n  ');

  const emptyLand = state.board.filter(h => !h.tile && !h.city && h.type === 'land').length;
  const emptyWater = state.board.filter(h => !h.tile && h.type === 'water').length;

  const aiTags = ai.projectCardsFacing.map(c => c.tags.join(', ')).join(' | ');
  const aiCards = ai.projectCardsFacing.map(c =>
    `${c.name} (${c.cardId}${c.side}) cost:${c.cost} tags:[${c.tags.join(',')}] ${ai.usedProjectThisGen.includes(c.cardId) ? '[USED]' : ''}`
  ).join('\n  ');

  return `GAME STATE — Generation ${state.generation}/12, Phase: ${state.phase}
Map: ${state.map}
Start player this gen: ${state.startPlayerId}

SUPPLY:
  Heat tiles: ${state.parameterSupply.heat}/11
  Greenery tiles: ${state.parameterSupply.greenery}/7
  Water tiles: ${state.parameterSupply.water}/4
  Credits in supply: ${state.creditSupply}/10
  Resource tokens: Nature:${state.resourceTokenSupply.nature} Production:${state.resourceTokenSupply.production} Science:${state.resourceTokenSupply.science}

AI PLAYER (you):
  Credits: ${ai.credits}, Heat personal: ${ai.heatTilesPersonal}
  Cities on hexes: [${ai.cities.join(', ')}]
  Resource tokens held: [${ai.resourceTokens.join(', ') || 'none'}]
  Used standard project this gen: ${ai.usedStandardProjectThisGen ? 'yes' : 'no'}
  Has passed: ${ai.hasPassed ? 'yes' : 'no'}
  Cards:
  ${aiCards}

HUMAN PLAYER (opponent):
  Credits: ${human.credits}, Heat personal: ${human.heatTilesPersonal}
  Cities on hexes: [${human.cities.join(', ')}]
  Resource tokens held: [${human.resourceTokens.join(', ') || 'none'}]
  Has passed: ${human.hasPassed ? 'yes' : 'no'}

BOARD (occupied hexes):
  ${boardSummary || '(no tiles or cities yet)'}
  Empty land hexes: ${emptyLand}, Empty water hexes: ${emptyWater}

END-GAME STATUS:
  Exhausted supplies: ${['heat', 'greenery', 'water'].filter(t => state.parameterSupply[t as keyof typeof state.parameterSupply] === 0).join(', ') || 'none'}
  ${tilesOnBoard.length + citiesOnBoard.length >= 19 ? 'ALL HEXES OCCUPIED' : `${19 - tilesOnBoard.length - citiesOnBoard.length} hexes remaining`}
  ${state.generation >= 12 ? 'FINAL GENERATION' : ''}`;
}

/**
 * Serialize a single action into a human-readable description.
 */
export function serializeAction(action: GameAction, state: GameState): string {
  switch (action.type) {
    case 'pass':
      return 'Pass (end your turn for this generation)';

    case 'standard_project': {
      const names: Record<string, string> = {
        sell_patent: 'Sell Patent — gain 1 credit',
        build_city: `Build City — place/relocate city${action.targetHexId ? ` on hex ${action.targetHexId}` : ''}`,
        import_water: `Import Water — place water tile${action.targetHexId ? ` on hex ${action.targetHexId}` : ''}`,
        greenhouses: `Greenhouses — place greenery tile${action.targetHexId ? ` on hex ${action.targetHexId}` : ''}`,
        energy_farms: 'Energy Farms — gain 1 heat tile to personal supply',
      };
      const tokens = action.spentTokens?.length ? ` (spending tokens: ${action.spentTokens.join(', ')})` : '';
      return `Standard Project: ${names[action.projectId] || action.projectId}${tokens}`;
    }

    case 'activate_project': {
      const card = getCard(action.cardId);
      if (!card) return `Activate unknown card ${action.cardId}${action.side}`;
      const side = action.side === 'A' ? card.sideA : card.sideB;
      const target = action.targetHexId !== undefined ? ` → hex ${action.targetHexId}` : '';
      const tokens = action.spentTokens?.length ? ` (spending tokens: ${action.spentTokens.join(', ')})` : '';
      const optional = action.optionalSpend ? ' [with optional spend]' : '';
      return `Activate ${side.name} (Card ${action.cardId}${action.side}): ${describeCardEffect(side.effect)}${target}${tokens}${optional}`;
    }
  }
}

/**
 * Serialize the top N candidate actions with scores for LLM re-ranking.
 */
export function serializeCandidates(
  scored: ScoredAction[],
  state: GameState,
): string {
  return scored
    .map((s, i) => `${i + 1}. [Score: ${s.score.toFixed(2)}] ${serializeAction(s.action, state)}`)
    .join('\n');
}
