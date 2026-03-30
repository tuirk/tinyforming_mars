// Structured AI reasoning logger
// TODO: Implement in Phase 1C task 1C.6

import type { AILogEntry, AIMode, GameAction, Phase } from '../engine/types';

/** Create a log entry for an AI decision */
export function createLogEntry(params: {
  generation: number;
  phase: Phase;
  evaluatedActions?: { action: GameAction; score: number; breakdown?: string }[];
  minimaxAdjustment?: { action: GameAction; originalScore: number; adjustedScore: number }[];
  geminiReasoning?: string;
  decision: GameAction;
  decisionSource: AIMode;
}): AILogEntry {
  return {
    ...params,
    timestamp: Date.now(),
  };
}
