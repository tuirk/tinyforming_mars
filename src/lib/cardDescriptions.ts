import type { CardEffect, CostReduction, ParameterReduction, PlacementConstraint, CreditFormula } from '@/engine/types';

function describeConstraint(c?: PlacementConstraint): string {
  if (!c) return '';
  const parts: string[] = [];
  if (c.row) parts.push(`on ${c.row}ern row`);
  if (c.hex_type === 'water') parts.push('on a water hex');
  if (c.hex_type === 'land') parts.push('on a land hex');
  if (c.adjacent_to === 'city') parts.push('adjacent to a city');
  if (c.adjacent_to === 'greenery') parts.push('adjacent to greenery');
  if (c.adjacent_to === 'water') parts.push('adjacent to water');
  if (c.adjacent_to === 'none') parts.push('not adjacent to anything');
  if (c.not_adjacent_to === 'city') parts.push('not adjacent to any city');
  if (c.min_adjacent_greenery) parts.push(`adjacent to ${c.min_adjacent_greenery}+ greenery`);
  if (c.min_adjacent_water) parts.push(`adjacent to ${c.min_adjacent_water}+ water`);
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function describeCreditFormula(f: CreditFormula): string {
  switch (f.type) {
    case 'fixed': return `${f.amount} credit${f.amount !== 1 ? 's' : ''}`;
    case 'per_tag': return `1 credit per ${f.tag} tag`;
    case 'per_tags_union': return `1 credit per ${f.tags.join(' or ')} tag`;
    case 'per_city': return `${f.amount} credit${f.amount !== 1 ? 's' : ''} per city on Mars`;
    case 'per_adjacent_water': return `${f.amount} credit${f.amount !== 1 ? 's' : ''} per adjacent water`;
  }
}

export function describeCardEffect(effect: CardEffect): string {
  switch (effect.type) {
    case 'place_water': return `Place 1 Water tile${describeConstraint(effect.constraint)}`;
    case 'place_greenery': return `Place 1 Greenery tile${describeConstraint(effect.constraint)}`;
    case 'gain_heat': return `Gain ${effect.count} Heat tile${effect.count > 1 ? 's' : ''}`;
    case 'place_heat_on_map': return `Place 1 Heat tile on map${describeConstraint(effect.constraint)}`;
    case 'gain_credits': return `Gain ${describeCreditFormula(effect.formula)}`;
    case 'gain_resource_token': return effect.choice ? 'Gain 1 Resource Token of your choice' : 'Gain 1 Resource Token';
    case 'place_or_relocate_city': {
      let desc = 'Place or relocate a city';
      if (effect.bonusCondition?.not_adjacent_to_cubes) desc += '. If not adjacent to any tiles, gain 1 Resource Token';
      return desc;
    }
    case 'return_greenery': return 'You may return 1 Greenery tile to supply';
    case 'composite': return effect.effects.map(describeCardEffect).join('. ');
  }
}

export function describeCostReduction(r: CostReduction): string {
  switch (r.type) {
    case 'per_tag': return `-${r.amount} credit per ${r.tag} tag${r.beyond ? ` beyond ${r.beyond}` : ''}`;
    case 'per_tile': return `-${r.amount} credit per ${r.tile} tile${r.beyond ? ` beyond ${r.beyond}` : ''} on map`;
    case 'per_city_on_row': return `-${r.amount} credit per city on ${r.row} row`;
    case 'per_adjacent_unoccupied': return `-${r.amount} credit per unoccupied hex adjacent to your cities`;
    case 'per_heat_cubes': return `-${r.amount} credit per ${r.divisor} heat cubes you have`;
    case 'per_greenery_adjacent_to_own_cities': return `-${r.amount} credit per greenery adjacent to your cities`;
  }
}

export function describeParameterReduction(r: ParameterReduction): string {
  return `-${r.reduction_per_tag} ${r.parameter} requirement per ${r.per_tag} tag beyond ${r.beyond}`;
}
