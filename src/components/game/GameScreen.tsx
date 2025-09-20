
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
        return produce(prev, draft => {
            draft.passCount = 0;
            draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
        });
    });
  }
  
  const endGeneration = useCallback(() => {
    setGameState(produce(draft => {
        if (!draft) return;
        
        // Income Phase Placeholder
        draft.players.forEach(p => {
            // Actual income logic to be implemented
            p.credits = 5; // Reset to 5 as per spec for now
        });
        toast({ title: "Income Phase", description: "Players collect income. (Placeholder: all credits reset to 5)"});

        // New Generation
        draft.generation += 1;
        draft.passCount = 0;
        draft.players.forEach(p => {
            p.standardProjectUsed = false;
            p.projectCards.forEach(c => c.usedThisGeneration = false);
        });
        draft.startingPlayerIndex = (draft.startingPlayerIndex + 1) % draft.players.length;
        draft.currentPlayerIndex = draft.startingPlayerIndex;
    }));
  }, [toast]);

  const handlePass = () => {
    if (!gameState) return;
    const newPassCount = gameState.passCount + 1;

    if (newPassCount >= gameState.players.length) {
        endGeneration();
    } else {
        setGameState(produce(draft => {
            if (!draft) return;
            draft.passCount = newPassCount;
            draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
        }));
    }
  }

  const handleActivateCard = (card: PlayerProjectCard) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    setGameState(produce(draft => {
      if (!draft) return;
      
      const playerIndex = draft.players.findIndex(p => p.id === currentPlayer.id);
      if (playerIndex === -1) return;
      
      const player = draft.players[playerIndex];
      const cost = card.effect.cost.credits;
      
      if (player.credits < cost) {
        toast({ title: "Not enough credits!", variant: 'destructive' });
        return;
      }
      
      toast({
        title: 'Action',
        description: `Activated card: ${card.effect.name}.`,
      });

      player.credits -= cost;
      const cardInHand = player.projectCards.find(c => c.effect.id === card.effect.id);
      if (cardInHand) {
          cardInHand.usedThisGeneration = true;
      }

      draft.passCount = 0;
      draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
    }));
  };

  const handleStandardProject = (project: StandardProject) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;
    
    setGameState(produce(draft => {
        if (!draft) return;

        const playerIndex = draft.players.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex === -1) return;

        const player = draft.players[playerIndex];

        if(player.standardProjectUsed) {
          toast({ title: "Standard Project already used this generation.", variant: 'destructive' });
          return;
        }

        console.log('Completing project:', project.title);
        toast({
          title: 'Action',
          description: `Completed project: ${project.title}. Effect logic to be implemented.`,
        });

        player.standardProjectUsed = true;
        draft.passCount = 0;
        draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
    }));
  };
  
  const processAIMove = useCallback(async (currentState: GameState) => {
    setIsAIThinking(true);
    const aiPlayer = currentState.players.find(p => p.isAI);
    if (!aiPlayer) return;

    try {
        const affordableCards = aiPlayer.projectCards.filter(c => c.effect.cost.credits <= aiPlayer.credits && !c.usedThisGeneration);

        const suggestion = await getAISuggestion({
          projectCards: affordableCards.map(c => c.effect.name),
          gameState: `Generation ${currentState.generation}. AI has ${aiPlayer.credits} credits.`,
        });

        if (suggestion.suggestedCard === 'Pass') {
            toast({ title: "AI passes.", description: suggestion.reason });
            handlePass();
            setIsAIThinking(false);
            return;
        }

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
            const aiPlayerIndex = draft.players.findIndex(p => p.isAI);
            if (aiPlayerIndex !== -1) {
              // Placeholder for AI action logic (e.g. deduct cost)
              const playedCard = draft.players[aiPlayerIndex].projectCards.find(c => c.effect.name === suggestion.suggestedCard);
              if (playedCard) {
                draft.players[aiPlayerIndex].credits -= playedCard.effect.cost.credits;
                playedCard.usedThisGeneration = true;
              }
            }
            draft.passCount = 0;
            draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % draft.players.length;
        }));
    } catch(error) {
        console.error("AI Action failed:", error);
        toast({ title: "AI action failed. Passing.", variant: 'destructive' });
        handlePass();
    } finally {
      setIsAIThinking(false);
    }
  }, [toast, endGeneration]);


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
          currentPlayerIndex={gameState.currentPlayerIndex}
          players={gameState.players}
          isAIThinking={isAIThinking}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Supply gameState={gameState} />
            <ResourceTokenSupply gameState={gameState} />
        </div>
        
        <div className="flex flex-col gap-8">
            {/* AI Player Section */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="flex-grow">
                  <h2 className="text-lg font-headline text-center mb-2">AI's Board ({aiPlayer.map.name})</h2>
                  <HexGrid map={aiPlayer.map} onHexClick={(hex) => handleHexClick(hex, aiPlayer)} />
              </div>
              <div className="lg:w-[280px] w-full flex-shrink-0">
                  <PlayerDashboard player={aiPlayer} currentPlayerId={currentPlayer.id} />
              </div>
            </div>

            {/* Human Player Section */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="flex-grow">
                  <h2 className="text-lg font-headline text-center mb-2">Your Board ({humanPlayer.map.name})</h2>
                  <HexGrid map={humanPlayer.map} onHexClick={(hex) => handleHexClick(hex, humanPlayer)} />
              </div>
              <div className="lg:w-[280px] w-full flex-shrink-0">
                  <PlayerDashboard player={humanPlayer} currentPlayerId={currentPlayer.id} />
              </div>
            </div>
        </div>
      </div>

      <aside className="xl:col-span-1 bg-card p-4 rounded-lg">
        <ActionPanel
          player={humanPlayer}
          currentPlayerId={currentPlayer.id}
          onActivateCard={handleActivateCard}
          onStandardProject={handleStandardProject}
          onPass={handlePass}
        />
      </aside>
    </div>
  );
}
