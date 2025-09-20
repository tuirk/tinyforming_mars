
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
                handleCardDraft(chosenSide);
            } else {
                // Human drafting
                setDrawnCard(gameState.projectCards.drawDeck[0]);
            }
        }
    }, [setupStep, drawnCard, draftTurn, draftingPlayerId, gameState, setGameState]);


    const handleCardDraft = (chosenSide: CardSide) => {
        setGameState(produce(draft => {
            if (!draft) return;
    
            const humanPlayerIndex = draft.players.findIndex(p => !p.isAI);
            const aiPlayerIndex = draft.players.findIndex(p => p.isAI);

            if (draft.players[humanPlayerIndex].id === draftingPlayerId) {
                // Human is drafting
                draft.players[humanPlayerIndex].projectCards.push({ effect: chosenSide.slot1, usedThisGeneration: false });
                draft.players[aiPlayerIndex].projectCards.push({ effect: chosenSide.slot2, usedThisGeneration: false });
            } else {
                // AI is drafting
                draft.players[aiPlayerIndex].projectCards.push({ effect: chosenSide.slot1, usedThisGeneration: false });
                draft.players[humanPlayerIndex].projectCards.push({ effect: chosenSide.slot2, usedThisGeneration: false });
            }
            
            // Move card from draw to discard
            const draftedCard = draft.projectCards.drawDeck.shift();
            if (draftedCard) {
                draft.projectCards.discardPile.push(draftedCard);
            }

            const nextDraftTurn = draftTurn + 1;
            
            if (nextDraftTurn >= 3) {
                // End of drafting
                toast({ title: 'Card Draft Complete', description: 'All players have their starting projects. Time to place cities.' });
                setSetupStep('city-placement');
            } else {
                // Next turn
                setDraftTurn(nextDraftTurn);
                setDrawnCard(null);
                // W, B, W drafting order
                const nextDrafter = (nextDraftTurn === 1) ? (draftingPlayerId === 'White' ? 'Black' : 'White') : 'White';
                setDraftingPlayerId(nextDrafter);
            }
        }));
    };

    const handleCityPlacement = (hex: Hex, playerId: PlayerColor) => {
        setGameState(produce(draft => {
            if (!draft) return;

            const playerIndex = draft.players.findIndex(p => p.id === playerId);
            const player = draft.players[playerIndex];
            const hexOnMap = player.map.hexes.find(h => h.id === hex.id);

            if (!hexOnMap) return;

            hexOnMap.occupiedBy = { type: 'city', playerId };
            player.cities.push(hex.id);
            
            toast({title: `${playerId} placed a city on hex #${hex.id}.`})

            if (placementTurn >= 1) { // Both players have placed cities
                // Finalize setup
                draft.generation = 1;
                draft.phase = 'Action';
                draft.currentPlayerIndex = draft.players.findIndex(p => p.id === 'White');
                draft.startingPlayerIndex = draft.currentPlayerIndex;
                toast({ title: 'Setup Complete!', description: `Generation 1 begins. It's White's turn.` });
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
