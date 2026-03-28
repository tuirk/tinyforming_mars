// Generation flow controller
// Phase 1A task 1A.14

import type { GameState, GameAction } from './types';
import { executeAction } from './actions';
import { processIncomePhase } from './income';
import { checkEndCondition, calculateGameResult } from './scoring';
import { beginResearchPhase } from './gameState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rotate turn order so the other (non-passed) player goes next. */
function rotateTurnOrder(state: GameState, actingPlayerId: string): string[] {
  const otherPlayer = actingPlayerId === 'human' ? 'ai' : 'human';
  const pid = otherPlayer as 'human' | 'ai';

  // If the other player has already passed, acting player stays first
  if (state.players[pid].hasPassed) {
    return [actingPlayerId, otherPlayer];
  }

  // Otherwise the other player goes next
  return [otherPlayer, actingPlayerId];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get the next player who should act. Returns null if both have passed. */
export function getNextActor(state: GameState): string | null {
  for (const playerId of state.turnOrder) {
    const pid = playerId as 'human' | 'ai';
    if (!state.players[pid].hasPassed) {
      return playerId;
    }
  }
  return null;
}

/** Process a single action in the action phase: execute the action, rotate turns. */
export function processActionPhaseStep(
  state: GameState,
  action: GameAction,
  actingPlayerId: string,
): GameState {
  // Execute the action (pass is handled inside executeAction)
  let next = executeAction(state, action, actingPlayerId);

  // Check if both players have now passed
  const bothPassed =
    next.players.human.hasPassed && next.players.ai.hasPassed;

  if (bothPassed) {
    // Transition to income phase automatically
    next = { ...next, phase: 'income' as const };
    next = postIncomePhase(next);
    return next;
  }

  // Rotate turn order so the other non-passed player acts next
  next = { ...next, turnOrder: rotateTurnOrder(next, actingPlayerId) };

  return next;
}

/** Start the action phase: set phase to 'action', set turn order. */
export function startActionPhase(state: GameState): GameState {
  const startId = state.startPlayerId;
  const otherId = startId === 'human' ? 'ai' : 'human';

  return {
    ...state,
    phase: 'action' as const,
    turnOrder: [startId, otherId],
    passedPlayers: [],
    players: {
      human: { ...state.players.human, hasPassed: false },
      ai: { ...state.players.ai, hasPassed: false },
    },
  };
}

/** Process the transition after income phase: check end game, advance generation or end. */
export function postIncomePhase(state: GameState): GameState {
  // Run income phase
  let next = processIncomePhase(state);

  // Check end condition
  const endCondition = checkEndCondition(next);

  if (endCondition) {
    // Game over
    const result = calculateGameResult(next);
    return {
      ...next,
      phase: 'game_over' as const,
      endCondition,
      winner: result.winner,
    };
  }

  // Advance to next generation
  const nextGeneration = next.generation + 1;
  const nextStartPlayer = determineStartPlayer(next, nextGeneration);
  next = {
    ...next,
    generation: nextGeneration,
    startPlayerId: nextStartPlayer,
  };

  // Begin research phase for the new generation
  next = beginResearchPhase(next);

  return next;
}

/** Determine who starts a given generation based on color assignment. */
export function determineStartPlayer(
  state: GameState,
  generation: number,
): string {
  // White goes first in odd generations (1, 3, 5, ...)
  // Black goes first in even generations (2, 4, 6, ...)
  const isOdd = generation % 2 === 1;
  const colorThatGoesFirst = isOdd ? 'white' : 'black';

  if (state.players.human.color === colorThatGoesFirst) {
    return 'human';
  }
  return 'ai';
}
