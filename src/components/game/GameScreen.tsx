'use client';

import { useState, useEffect, useCallback } from 'react';
import { getInitialGameState, MAPS } from '@/lib/game/constants';
import type { GameState, Player, Hex, ProjectEffect, StandardProject, MapId } from '@/lib/game/types';
import { HexGrid } from './HexGrid';
import { PlayerDashboard } from './PlayerDashboard';
import { ActionPanel } from './ActionPanel';
import { GameStatus } from './GameStatus';
import { getAISuggestion, getAIExplanation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { MapSelection } from './MapSelection';
import { Supply } from './Supply';
import { produce } from 'immer';
import { ResourceTokenSupply } from './ResourceTokenSupply';

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

  useEffect(() => {
    if (gameState && gameState.generation > 1) {
      toast({ title: `Generation ${gameState.generation} starting!`});
    }
  }, [gameState?.generation, toast]);

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

  const advanceTurn = () => {
    setGameState(prev => {
        if (!prev) return null;
        return { ...prev, passCount: 0, currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length };
    });
  }

  const handlePlayerAction = (action: (p: Player) => Player) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    setGameState(produce(draft => {
      if (!draft) return;
      const playerIndex = draft.players.findIndex(p => p.id === currentPlayer.id);
      if (playerIndex !== -1) {
        draft.players[playerIndex] = action(draft.players[playerIndex]);
      }
    }));

    advanceTurn();
  };
  
  const handlePass = () => {
    if (!gameState) return;
    const newPassCount = gameState.passCount + 1;

    if (newPassCount >= gameState.players.length) {
        // End of generation
        setGameState(produce(draft => {
            if (!draft) return;
            draft.generation += 1;
            draft.passCount = 0;
            draft.players.forEach(p => {
                p.standardProjectUsed = false;
                // Add income, reset cards, etc. here in the future
            });
            draft.startingPlayerIndex = (draft.startingPlayerIndex + 1) % draft.players.length;
            draft.currentPlayerIndex = draft.startingPlayerIndex;
        }));
    } else {
        setGameState(produce(draft => {
            if (!draft) return;
            draft.passCount = newPassCount;
            draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
        }));
    }
  }

  const handleActivateCard = (card: ProjectEffect) => {
    handlePlayerAction((player) => {
        console.log('Activating card:', card.name);
        toast({
        title: 'Action',
        description: `Activated card: ${card.name}. Effect logic to be implemented.`,
        });
        // This is where you'd implement the card's effect on the player state
        return player;
    });
  };

  const handleStandardProject = (project: StandardProject) => {
    handlePlayerAction((player) => {
        console.log('Completing project:', project.title);
        toast({
        title: 'Action',
        description: `Completed project: ${project.title}. Effect logic to be implemented.`,
        });
        return {...player, standardProjectUsed: true };
    });
  };
  
  const processAIMove = useCallback(async (currentState: GameState) => {
    setIsAIThinking(true);
    const aiPlayer = currentState.players.find(p => p.isAI);
    if (!aiPlayer) return;
    
    // Simulate AI passing if it has no actions
    const shouldPass = Math.random() > 0.2; // AI will pass 20% of the time for now
    if (shouldPass) {
        toast({ title: "AI passes."});
        handlePass();
        setIsAIThinking(false);
        return;
    }


    const suggestion = await getAISuggestion({
      projectCards: aiPlayer.projectCards.map(c => c.name),
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
    
    setGameState(produce(draft => {
        if (!draft) return;
        // Here you would update the game state based on the AI's move.
        // For now, we just pass the turn back to the player.
        draft.passCount = 0;
        draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
    }));

    setIsAIThinking(false);
  }, [toast]);


  useEffect(() => {
    if (gameState) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.isAI && !isAIThinking) {
        const timer = setTimeout(() => processAIMove(gameState), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, processAIMove, isAIThinking]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Supply gameState={gameState} />
            <ResourceTokenSupply gameState={gameState} />
        </div>
        
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
              <div className="lg-w-[30%] w-full">
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
