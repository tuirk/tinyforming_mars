
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

export function CityPlacement({ gameState, player, onPlaceCity, setGameState, humanPlayer, aiPlayer }: CityPlacementProps) {
    const { toast } = useToast();

    const getOpponent = (p: Player) => p.id === humanPlayer.id ? aiPlayer : humanPlayer;

    const isValidPlacement = (hex: Hex, targetPlayer: Player): boolean => {
        if (hex.isWaterReserved) return false;
        
        const opponent = getOpponent(targetPlayer);
        const opponentCityHexIds = opponent.cities;

        if (opponentCityHexIds.length === 0) return true;

        // Check adjacency to opponent's cities. This is a simplified check.
        // A full implementation would need a hex adjacency function.
        // For now, we'll check just the ID, which is not accurate for adjacency but is a placeholder.
        const opponentCityHex = targetPlayer.map.hexes.find(h => h.id === opponentCityHexIds[0]);
        if (opponentCityHex && Math.abs(opponentCityHex.id - hex.id) < 2) {
             // This is a placeholder for real adjacency logic
            toast({ title: 'Invalid Placement', description: "Cannot place a city adjacent to the opponent's starting city.", variant: 'destructive'});
            return false;
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
                    // As a fallback, try to find any non-water hex
                    const fallbackHex = player.map.hexes.find(h => !h.isWaterReserved);
                    if(fallbackHex) onPlaceCity(fallbackHex, player.id);
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
