// src/lib/game/state.ts
import type { ProjectCardData, PlayerProjectCard, CardSide } from "./types";
import { PROJECT_CARDS } from "./constants";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomSide(card: ProjectCardData): CardSide {
  return Math.random() < 0.5 ? card.sideA : card.sideB;
}

/**
 * Draws one shared card for the round:
 * - Shuffle deck
 * - Reveal top card (side A or B at random)
 * - Slot1 -> Human, Slot2 -> AI
 */
export function drawSharedCardRound(initialDeck: ProjectCardData[]) {
  const deck = shuffle(initialDeck);
  if (deck.length === 0) throw new Error("Deck is empty!");

  const card = deck[0]; // top card
  const side = pickRandomSide(card);

  const humanProject: PlayerProjectCard = {
    cardId: card.cardId,
    effect: side.slot1,
    usedThisGeneration: false,
  };

  const aiProject: PlayerProjectCard = {
    cardId: card.cardId,
    effect: side.slot2,
    usedThisGeneration: false,
  };

  return {
    card,
    humanProject,
    aiProject,
    remainingDeck: deck.slice(1)
  };
}
