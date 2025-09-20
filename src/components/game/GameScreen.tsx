'use client';

import { useState, useEffect, useCallback } from 'react';
import { getInitialGameState, MAPS } from '@/lib/game/constants';
import type { GameState, Player, Hex, PlayerProjectCard, StandardProject, MapId } from '@/lib/game/types';
import { HexGrid } from './HexGrid';
import { PlayerDashboard } from './PlayerDashboard';
import { ActionPanel } from './ActionPanel';
import { GameStatus } from './GameStatus';
import { getAISuggestion, getAIExplanation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { MapSelection } from './MapSelection';
import { Supply } from './Supply';

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { toast } = useToast();
  const [selectedMap, setSelectedMap] = useState<MapId | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartGame = (playerMap: MapId) => {
    setSelectedMap(playerMap);
  };
  
  useEffect(() => {
    if (selectedMap && isClient && !gameState) {
      const mapIds = Object.keys(MAPS) as MapId[];
      const availableMaps = mapIds.filter(id => id !== selectedMap);
      const aiMapId = availableMaps[Math.floor(Math.random() * availableMaps.length)] || mapIds[0];
      setGameState(getInitialGameState(selectedMap, aiMapId));
    }
  }, [selectedMap, gameState, isClient]);

  const handleHexClick = (hex: Hex, player: Player) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI || player.id !== currentPlayer.id) return;
    
    console.log(`Hex clicked on ${player.id}'s board:`, hex.id);
    // Placeholder for cube placement logic
    toast({
      title: 'Action',
      description: `You clicked on hex #${hex.id} on your board. Cube placement logic to be implemented.`,
    });
  };

  const handlePlayerAction = (action: () => void) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    action();

    setGameState(prev => {
        if (!prev) return null;
        return { ...prev, currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length };
    });
  };
  
  const handlePass = () => {
    handlePlayerAction(() => {
        toast({ title: 'Player passes turn.' });
    });
  }

  const handleActivateCard = (playerCard: PlayerProjectCard) => {
    handlePlayerAction(() => {
        console.log('Activating card:', playerCard.effect.name);
        toast({
        title: 'Action',
        description: `Activated card: ${playerCard.effect.name}. Effect logic to be implemented.`,
        });
    });
  };

  const handleStandardProject = (project: StandardProject) => {
    handlePlayerAction(() => {
        console.log('Completing project:', project.title);
        toast({
        title: 'Action',
        description: `Completed project: ${project.title}. Effect logic to be implemented.`,
        });
    });
  };
  
  const processAIMove = useCallback(async (currentState: GameState) => {
    setIsAIThinking(true);
    const aiPlayer = currentState.players.find(p => p.isAI);
    if (!aiPlayer) return;
    
    const suggestion = await getAISuggestion({
      projectCards: aiPlayer.projectCards.map(c => c.effect.name),
      gameState: `Generation ${currentState.generation}. AI has ${aiPlayer.credits} credits.`,
    });

    const explanationInput = {
      move: `Action: ${suggestion.suggestedCard}. Reason: ${suggestion.reason}`,
      gameState: `Generation ${currentState.generation}. AI has ${aiPlayer.credits} credits and is deciding its move.`,
    }
    const explanation = await getAIExplanation(explanationInput);
    
    toast({
        title: `AI Move: ${suggestion.suggestedCard}`,
        description: explanation.explanation,
    });
    
    setGameState(prev => {
        if (!prev) return null;
        // Here you would update the game state based on the AI's move.
        // For now, we just pass the turn back to the player.
        return { ...prev, currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length, passCount: 0 };
    });

    setIsAIThinking(false);
  }, [toast]);


  useEffect(() => {
    if (gameState) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.isAI) {
        const timer = setTimeout(() => processAIMove(gameState), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, processAIMove]);

  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-2xl font-headline">Loading Game...</p>
      </div>
    );
  }

  if (!gameState) {
    return <MapSelection onMapSelect={handleStartGame} maps={Object.values(MAPS)} />;
  }

  const humanPlayer = gameState.players.find(p => !p.isAI)!;
  const aiPlayer = gameState.players.find(p => p.isAI)!;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 flex flex-col gap-4">
        <GameStatus
          generation={gameState.generation}
          currentPlayerId={currentPlayer.id}
          isAIThinking={isAIThinking}
        />
        <Supply gameState={gameState} />
        
        <div className="flex flex-col gap-8">
            {/* AI Player Section */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="lg:w-[70%] w-full">
                  <h2 className="text-lg font-headline text-center mb-2">AI's Board ({aiPlayer.map.name})</h2>
                  <HexGrid map={aiPlayer.map} onHexClick={(hex) => handleHexClick(hex, aiPlayer)} />
              </div>
              <div className="lg:w-[30%] w-full">
                  <PlayerDashboard player={aiPlayer} isCurrentPlayer={currentPlayer.id === aiPlayer.id} />
              </div>
            </div>

            {/* Human Player Section */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="lg:w-[70%] w-full">
                  <h2 className="text-lg font-headline text-center mb-2">Your Board ({humanPlayer.map.name})</h2>
                  <HexGrid map={humanPlayer.map} onHexClick={(hex) => handleHexClick(hex, humanPlayer)} />
              </div>
              <div className="lg:w-[30%] w-full">
                  <PlayerDashboard player={humanPlayer} isCurrentPlayer={currentPlayer.id === humanPlayer.id} />
              </div>
            </div>
        </div>
      </div>

      <aside className="xl:col-span-1 bg-card p-4 rounded-lg">
        <ActionPanel
          player={humanPlayer}
          isCurrentPlayer={currentPlayer.id === humanPlayer.id && !currentPlayer.isAI}
          onActivateCard={handleActivateCard}
          onStandardProject={handleStandardProject}
          onPass={handlePass}
        />
      </aside>
    </div>
  );
}
