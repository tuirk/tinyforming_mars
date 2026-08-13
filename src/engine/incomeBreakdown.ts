import type { GameState } from './types';

export interface IncomeStep {
  playerId: string;
  description: string;
  creditChange: number;
}

function incomeSources(cityCount: number, waterIncome: number): string {
  const parts: string[] = [];
  if (cityCount > 0) {
    parts.push(`${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`);
  }
  if (waterIncome > 0) {
    parts.push(
      `${waterIncome} adjacent water ${waterIncome === 1 ? 'tile' : 'tiles'}`,
    );
  }
  return parts.join(' + ');
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

  const cardsReturned =
    state.players.human.creditsOnCards + state.players.ai.creditsOnCards;
  if (cardsReturned > 0) {
    steps.push({
      playerId: '',
      description: `${cardsReturned} credit${cardsReturned === 1 ? '' : 's'} returned from project cards to the shared pool`,
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
    const unpaid = totalIncome - gained;
    const sources = incomeSources(cityCount, waterIncome);

    if (totalIncome > 0) {
      if (gained === totalIncome) {
        steps.push({
          playerId: pid,
          description: `${playerLabel}: +${gained} credit${gained === 1 ? '' : 's'} (${sources})`,
          creditChange: gained,
        });
      } else if (gained === 0) {
        steps.push({
          playerId: pid,
          description: `${playerLabel}: earned ${totalIncome} from ${sources}, but the shared pool was empty — unpaid`,
          creditChange: 0,
        });
      } else {
        steps.push({
          playerId: pid,
          description: `${playerLabel}: +${gained} of ${totalIncome} income paid (${sources}); shared pool ran short — ${unpaid} unpaid`,
          creditChange: gained,
        });
      }
    }

    const newCredits = player.credits + gained;
    if (newCredits > 5) {
      const excess = newCredits - 5;
      steps.push({
        playerId: pid,
        description: `${playerLabel}: hand limit is 5 — returning ${excess} credit${excess === 1 ? '' : 's'} to the shared pool`,
        creditChange: -excess,
      });
      creditSupply += excess;
    }
  }

  if (state.currentCards.length > 0) {
    const n = state.currentCards.length;
    steps.push({
      playerId: '',
      description: `${n} project card${n === 1 ? '' : 's'} discarded for next generation`,
      creditChange: 0,
    });
  }

  return steps;
}
