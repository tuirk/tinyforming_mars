import type { GameState } from './types';

export interface IncomeStep {
  playerId: string;
  description: string;
  creditChange: number;
}

export function computeIncomeBreakdown(state: GameState): IncomeStep[] {
  const steps: IncomeStep[] = [];
  const startId = state.startPlayerId as 'human' | 'ai';
  const otherId = startId === 'human' ? 'ai' : 'human';

  // Rulebook: credits on projects return before income is paid
  let creditSupply =
    state.creditSupply +
    state.players.human.creditsOnCards +
    state.players.ai.creditsOnCards;

  const cardsReturned = state.players.human.creditsOnCards + state.players.ai.creditsOnCards;
  if (cardsReturned > 0) {
    steps.push({
      playerId: '',
      description: `${cardsReturned} credit${cardsReturned > 1 ? 's' : ''} returned from cards to supply`,
      creditChange: cardsReturned,
    });
  }

  for (const pid of [startId, otherId] as const) {
    const player = state.players[pid];
    const playerLabel = pid === 'human' ? 'You' : 'AI';

    const cityCount = player.cities.length;
    let waterIncome = 0;
    for (const cityHexId of player.cities) {
      const cityHex = state.board.find((h) => h.id === cityHexId);
      if (!cityHex) continue;
      for (const adjId of cityHex.adjacentHexIds) {
        const adjHex = state.board.find((h) => h.id === adjId);
        if (adjHex && adjHex.tile === 'water') waterIncome++;
      }
    }

    const totalIncome = cityCount + waterIncome;
    const gained = Math.min(totalIncome, creditSupply);
    creditSupply -= gained;
    const lost = totalIncome - gained;

    // Show only what was actually paid from supply (may be less than city+water)
    if (gained > 0) {
      const parts: string[] = [];
      if (cityCount > 0) {
        parts.push(`${cityCount} ${cityCount > 1 ? 'cities' : 'city'}`);
      }
      if (waterIncome > 0) {
        parts.push(`${waterIncome} adjacent water`);
      }
      steps.push({
        playerId: pid,
        description: `${playerLabel}: +${gained} credit${gained > 1 ? 's' : ''} (${parts.join(' + ')})`,
        creditChange: gained,
      });
    } else if (totalIncome > 0) {
      steps.push({
        playerId: pid,
        description: `${playerLabel}: +0 credits (supply empty — ${totalIncome} earned but lost)`,
        creditChange: 0,
      });
    }

    if (lost > 0 && gained > 0) {
      steps.push({
        playerId: pid,
        description: `${playerLabel}: ${lost} credit${lost > 1 ? 's' : ''} lost — supply ran out`,
        creditChange: 0,
      });
    }

    const newCredits = player.credits + gained;
    if (newCredits > 5) {
      const excess = newCredits - 5;
      steps.push({
        playerId: pid,
        description: `${playerLabel}: Credits capped at 5, returning ${excess} to supply`,
        creditChange: -excess,
      });
      creditSupply += excess;
    }
  }

  if (state.currentCards.length > 0) {
    steps.push({
      playerId: '',
      description: `${state.currentCards.length} project cards discarded`,
      creditChange: 0,
    });
  }

  return steps;
}
