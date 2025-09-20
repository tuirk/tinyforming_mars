
'use client';

import { useState, useEffect } from 'react';
import { produce } from 'immer';
import type { GameState, Player, Hex, PlayerColor } from '@/lib/game/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HexGrid } from './HexGrid';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CityPlacementProps {
    gameState: GameState;
    player: Player;
    onPlaceCity: (hex: Hex, playerId: PlayerColor) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
    humanPlayer: Player;
    aiPlayer: Player;
}

// Adjacency list for the 19-hex grid
const ADJACENCY_MAP: Record<number, number[]> = {
    1: [2, 4, 5],
    2: [1, 3, 5, 6],
    3: [2, 6, 7],
    4: [1, 5, 8, 9],
    5: [1, 2, 4, 6, 9, 10],
    6: [2, 3, 5, 7, 10, 11],
    7: [3, 6, 11, 12],
    8: [4, 9, 13],
    9: [4, 5, 8, 10, 13, 14],
    10: [5, 6, 9, 11, 14, 15],
    11: [6, 7, 10, 12, 15, 16],
    12: [7, 11, 16],
    13: [8, 9, 14, 17],
    14: [9, 10, 13, 15, 17, 18],
    15: [10, 11, 14, 16, 18, 19],
    16: [11, 12, 15, 19],
    17: [13, 14, 18],
    18: [14, 15, 17, 19],
    19: [15, 16, 18],
};

export function CityPlacement({ gameState, player, onPlaceCity, setGameState, humanPlayer, aiPlayer }: CityPlacementProps) {
    const { toast } = useToast();

    const getOpponent = (p: Player) => p.id === humanPlayer.id ? aiPlayer : humanPlayer;

    const isValidPlacement = (hex: Hex, targetPlayer: Player): boolean => {
        if (hex.occupiedBy.type) {
             if (!targetPlayer.isAI) {
                toast({ title: 'Invalid Placement', description: "This hex is already occupied.", variant: 'destructive'});
            }
            return false;
        }

        if (hex.isWaterReserved) {
            if (!targetPlayer.isAI) {
                toast({ title: 'Invalid Placement', description: "Cannot place a city on a hex reserved for water.", variant: 'destructive'});
            }
            return false;
        }

        // The white player (second player) has an additional restriction
        if (targetPlayer.id === 'White') {
            const opponent = getOpponent(targetPlayer);
            const opponentCityHexIds = opponent.cities;
            
            if (opponentCityHexIds.length > 0) {
                const opponentCityId = opponentCityHexIds[0];
                const adjacentToOpponentCity = ADJACENCY_MAP[opponentCityId]?.includes(hex.id);
                if (adjacentToOpponentCity) {
                     if (!targetPlayer.isAI) {
                        toast({ title: 'Invalid Placement', description: "Cannot place a city adjacent to the opponent's starting city.", variant: 'destructive'});
                    }
                    return false;
                }
            }
        }

        return true;
    };
    
    useEffect(() => {
        if (player.isAI) {
            // AI city placement logic
            const placeCityForAI = () => {
                const validHexes = player.map.hexes.filter(h => isValidPlacement(h, player));
                if (validHexes.length > 0) {
                    const randomHex = validHexes[Math.floor(Math.random() * validHexes.length)];
                    onPlaceCity(randomHex, player.id);
                } else {
                    // This should not happen in a normal game
                    console.error("AI has no valid city placement locations.");
                    // As a fallback, try to find any non-water, non-occupied hex
                    const fallbackHexes = player.map.hexes.filter(h => !h.isWaterReserved && !h.occupiedBy.type);
                    if(fallbackHexes.length > 0) onPlaceCity(fallbackHexes[0], player.id);
                }
            }
            // Add a small delay for user experience
            const timer = setTimeout(placeCityForAI, 1500);
            return () => clearTimeout(timer);
        }
    }, [player, onPlaceCity]);


    const handleHexClick = (hex: Hex, targetPlayer: Player) => {
        if (targetPlayer.isAI || targetPlayer.id !== player.id) return;
        
        if (isValidPlacement(hex, targetPlayer)) {
            onPlaceCity(hex, player.id);
        } else {
            console.log("Invalid city placement clicked.");
        }
    }

    if (player.isAI) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-2xl font-headline">AI is placing its city...</p>
                <p className="text-muted-foreground">{player.id} is making a decision.</p>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Initial City Placement</CardTitle>
                    <CardDescription>
                        It's <span className="font-bold text-primary">{player.id}'s</span> turn.
                        <br />
                        Place one city on any hex on your board that is not reserved for water.
                        { player.id === 'White' && ' You cannot place your city adjacent to the Black player\'s city.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8">
                     <div className="flex-grow">
                        <h2 className="text-lg font-headline text-center mb-2">Your Board ({player.map.name})</h2>
                        <HexGrid map={player.map} onHexClick={(hex) => handleHexClick(hex, player)} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
