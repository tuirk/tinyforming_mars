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

  let creditSupply = state.creditSupply;

  for (const pid of [startId, otherId] as const) {
    const player = state.players[pid];
    const playerLabel = pid === 'human' ? 'You' : 'AI';

    // Base city income
    const cityCount = player.cities.length;
    if (cityCount > 0) {
      steps.push({
        playerId: pid,
        description: `${playerLabel}: +${cityCount} credit${cityCount > 1 ? 's' : ''} (${cityCount} ${cityCount > 1 ? 'cities' : 'city'})`,
        creditChange: cityCount,
      });
    }

    // Water adjacency income
    let waterIncome = 0;
    for (const cityHexId of player.cities) {
      const cityHex = state.board.find(h => h.id === cityHexId);
      if (!cityHex) continue;
      for (const adjId of cityHex.adjacentHexIds) {
        const adjHex = state.board.find(h => h.id === adjId);
        if (adjHex && adjHex.tile === 'water') waterIncome++;
      }
    }
    if (waterIncome > 0) {
      steps.push({
        playerId: pid,
        description: `${playerLabel}: +${waterIncome} credit${waterIncome > 1 ? 's' : ''} (adjacent water tiles)`,
        creditChange: waterIncome,
      });
    }

    // Compute total and cap
    const totalIncome = cityCount + waterIncome;
    const gained = Math.min(totalIncome, creditSupply);
    creditSupply -= gained;

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

  // Credits from cards returned
  const cardsReturned = state.players.human.creditsOnCards + state.players.ai.creditsOnCards;
  if (cardsReturned > 0) {
    steps.push({
      playerId: '',
      description: `${cardsReturned} credit${cardsReturned > 1 ? 's' : ''} returned from cards to supply`,
      creditChange: cardsReturned,
    });
  }

  // Cards discarded
  if (state.currentCards.length > 0) {
    steps.push({
      playerId: '',
      description: `${state.currentCards.length} project cards discarded`,
      creditChange: 0,
    });
  }

  return steps;
}
