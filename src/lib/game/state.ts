
// src/lib/game/state.ts
import type { ProjectCardData, PlayerProjectCard, CardSide, ActiveProjectCard } from "./types";

export function shuffle<T>(arr: T[]): T[] {
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
 * Draws the initial 3 cards for the game setup.
 * The choosing player for each card is not determined here.
 */
export function drawInitialCards(initialDeck: ProjectCardData[]) {
  const deck = shuffle(initialDeck);
  if (deck.length < 3) throw new Error("Deck needs at least 3 cards for setup!");

  const drawnCardsData = deck.slice(0, 3);
  const remainingDeck = deck.slice(3);

  const activeCards: ActiveProjectCard[] = drawnCardsData.map(cardData => {
    // For now, randomly assign sides. The UI will later allow players to choose.
    const side = pickRandomSide(cardData);
    // Let's assume Player 1 is the human for now for simplicity.
    return {
      cardId: cardData.cardId,
      player1Side: side.slot1,
      player2Side: side.slot2,
    };
  });

  return {
    activeCards,
    remainingDeck,
  };
}
