
'use client';

import { useState, useEffect } from 'react';
import { produce } from 'immer';
import type { GameState, PlayerColor, ProjectCardData, CardSide, Hex } from '@/lib/game/types';
import { CardDraft } from './CardDraft';
import { CityPlacement } from './CityPlacement';
import { shuffle } from '@/lib/game/state';
import { useToast } from '@/hooks/use-toast';

interface SetupPhaseProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

type SetupStep = 'card-draft' | 'city-placement' | 'complete';

export function SetupPhase({ gameState, setGameState }: SetupPhaseProps) {
    const [setupStep, setSetupStep] = useState<SetupStep>('card-draft');
    const [draftTurn, setDraftTurn] = useState(0); // 0, 1, 2 for the three cards
    const [draftingPlayerId, setDraftingPlayerId] = useState<PlayerColor>('White');
    const [drawnCard, setDrawnCard] = useState<ProjectCardData | null>(null);
    
    const [placementTurn, setPlacementTurn] = useState(0); // 0: Black, 1: White
    const { toast } = useToast();

    // Start drafting process
    useEffect(() => {
        if (setupStep === 'card-draft' && !drawnCard && draftTurn < 3) {
            const draftingPlayer = gameState.players.find(p => p.id === draftingPlayerId);
            if (draftingPlayer?.isAI) {
                // AI drafting logic
                const card = gameState.projectCards.drawDeck[0];
                const chosenSide = Math.random() < 0.5 ? card.sideA : card.sideB;
                
                // Add a delay for UX
                const timer = setTimeout(() => handleCardDraft(chosenSide), 1500);
                return () => clearTimeout(timer);
            } else {
                // Human drafting
                const timer = setTimeout(() => setDrawnCard(gameState.projectCards.drawDeck[0]), 500);
                return () => clearTimeout(timer);
            }
        }
    }, [setupStep, drawnCard, draftTurn, draftingPlayerId, gameState]);

    // Effect to handle turn progression after a card has been drafted.
    useEffect(() => {
        if (setupStep !== 'card-draft' || draftTurn === 0) return;

        // This effect runs when draftTurn changes, which now happens *after* gameState is updated.
        const expectedTotalCards = draftTurn * 2;
        const actualTotalCards = gameState.players.reduce((sum, p) => sum + p.projectCards.length, 0);

        if (actualTotalCards === expectedTotalCards) {
            if (draftTurn >= 3) {
                setSetupStep('city-placement');
            } else {
                 // W, B, W drafting order
                const nextDrafter = (draftTurn === 1) ? (draftingPlayerId === 'White' ? 'Black' : 'White') : 'White';
                setDraftingPlayerId(nextDrafter);
            }
        }
    }, [draftTurn, gameState.players, setupStep]);

    useEffect(() => {
        if (setupStep === 'city-placement' && draftTurn >= 3) {
            toast({ title: 'Card Draft Complete', description: 'All players have their starting projects. Time to place cities.' });
        }
    }, [setupStep, draftTurn, toast]);

    const handleCardDraft = (chosenSide: CardSide) => {
        setDrawnCard(null); // Clear the card for the next turn
        
        setGameState(produce(draft => {
            if (!draft) return;
    
            const draftingPlayerIndex = draft.players.findIndex(p => p.id === draftingPlayerId);
            const opponentPlayerIndex = draftingPlayerIndex === 0 ? 1 : 0;

            draft.players[draftingPlayerIndex].projectCards.push({ effect: chosenSide.slot1, usedThisGeneration: false });
            draft.players[opponentPlayerIndex].projectCards.push({ effect: chosenSide.slot2, usedThisGeneration: false });
            
            // Move card from draw to discard
            const draftedCard = draft.projectCards.drawDeck.shift();
            if (draftedCard) {
                draft.projectCards.discardPile.push(draftedCard);
            }
        }));

        setDraftTurn(prev => prev + 1);
    };
    
    useEffect(() => {
        if (setupStep === 'city-placement' && placementTurn > 0) {
            const placementOrder: PlayerColor[] = gameState.players.find(p => p.id === 'Black') ? ['Black', 'White'] : ['White', 'Black'];
            const playerWhoPlaced = placementOrder[placementTurn -1];
            toast({title: `${playerWhoPlaced} placed a city.`})
        }
        if (setupStep === 'complete') {
            toast({ title: 'Setup Complete!', description: `Generation 1 begins. It's White's turn.` });
        }
    }, [placementTurn, setupStep, toast, gameState.players]);

    const handleCityPlacement = (hex: Hex, playerId: PlayerColor) => {
        setGameState(produce(draft => {
            if (!draft) return;

            const playerIndex = draft.players.findIndex(p => p.id === playerId);
            const player = draft.players[playerIndex];
            const hexOnMap = player.map.hexes.find(h => h.id === hex.id);

            if (!hexOnMap) return;

            hexOnMap.occupiedBy = { type: 'city', playerId };
            player.cities.push(hex.id);
            
            if (placementTurn >= 1) { // Both players have placed cities
                // Finalize setup
                draft.generation = 1;
                draft.phase = 'Action';
                draft.currentPlayerIndex = draft.players.findIndex(p => p.id === 'White');
                draft.startingPlayerIndex = draft.currentPlayerIndex;
                setSetupStep('complete');
            } else {
                setPlacementTurn(1);
            }
        }));
    }

    if (!gameState) return null;

    const humanPlayer = gameState.players.find(p => !p.isAI)!;
    const aiPlayer = gameState.players.find(p => p.isAI)!;


    if (setupStep === 'card-draft') {
        const draftingPlayer = gameState.players.find(p => p.id === draftingPlayerId);
        return (
            <CardDraft
                player={draftingPlayer!}
                card={drawnCard}
                onDraft={handleCardDraft}
                draftTurn={draftTurn}
            />
        );
    }
    
    if (setupStep === 'city-placement') {
        const placementOrder: PlayerColor[] = gameState.players.find(p => p.id === 'Black') ? ['Black', 'White'] : ['White', 'Black'];
        const playerToPlace = gameState.players.find(p => p.id === placementOrder[placementTurn])!;
        
        return (
            <CityPlacement
                gameState={gameState}
                player={playerToPlace}
                onPlaceCity={handleCityPlacement}
                setGameState={setGameState}
                humanPlayer={humanPlayer}
                aiPlayer={aiPlayer}
            />
        );
    }

    return null; // or a loading/completion screen
}
