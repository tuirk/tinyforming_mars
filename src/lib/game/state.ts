// src/lib/game/state.ts
import type { ProjectCardData, PlayerProjectCard } from "./types";
import { PROJECT_CARDS } from "./constants";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomSide(card: ProjectCardData) {
  return Math.random() < 0.5 ? card.sideA : card.sideB;
}

/**
 * Deal initial projects:
 * - Shuffle deck
 * - Draw one card for human (owner)
 * - Draw one card for AI (owner)
 * - For each card: randomly choose side (A or B)
 *   - slot1 -> owner
 *   - slot2 -> opponent
 */
export function dealInitialProjects() {
  const deck = shuffle(PROJECT_CARDS.slice());
  if (deck.length < 2) throw new Error("Not enough cards to deal initial projects.");

  const humanDealtCard = deck.pop()!; // owner = human
  const aiDealtCard = deck.pop()!;    // owner = ai

  const humanSide = pickRandomSide(humanDealtCard);
  const aiSide = pickRandomSide(aiDealtCard);

  const humanProjects: PlayerProjectCard[] = [
    { cardId: humanDealtCard.cardId, effect: humanSide.slot1, usedThisGeneration: false }, // owner slot
    { cardId: aiDealtCard.cardId, effect: aiSide.slot2, usedThisGeneration: false }        // opponent slot from ai's card
  ];

  const aiProjects: PlayerProjectCard[] = [
    { cardId: aiDealtCard.cardId, effect: aiSide.slot1, usedThisGeneration: false },       // owner slot
    { cardId: humanDealtCard.cardId, effect: humanSide.slot2, usedThisGeneration: false }  // opponent slot from human's card
  ];

  return {
    humanProjects,
    aiProjects,
    remainingDeck: deck
  };
}
