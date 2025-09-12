'use client';

import { useState, useEffect, useCallback } from 'react';
import { getInitialGameState, STANDARD_PROJECTS } from '@/lib/game/constants';
import type { GameState, Player, Hex, ProjectCardData, StandardProject, PlayerColor } from '@/lib/game/types';
import { HexGrid } from './HexGrid';
import { PlayerDashboard } from './PlayerDashboard';
import { ActionPanel } from './ActionPanel';
import { GameStatus } from './GameStatus';
import { getAISuggestion, getAIExplanation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setGameState(getInitialGameState());
  }, []);

  const handleHexClick = (hex: Hex, player: PlayerColor) => {
    if (!gameState || gameState.currentPlayer !== player || player !== 'White') return;
    console.log(`Hex clicked on ${player}'s board:`, hex.id);
    // Placeholder for cube placement logic
    toast({
      title: 'Action',
      description: `You clicked on hex #${hex.id} on your board. Cube placement logic to be implemented.`,
    });
  };

  const handlePlayerAction = (action: () => void) => {
    if (!gameState || gameState.currentPlayer !== 'White') return;

    action();

    setGameState(prev => {
        if (!prev) return null;
        return { ...prev, currentPlayer: 'Black' };
    });
  };
  
  const handlePass = () => {
    handlePlayerAction(() => {
        toast({ title: 'Player passes turn.' });
    });
  }

  const handleActivateCard = (card: ProjectCardData) => {
    handlePlayerAction(() => {
        console.log('Activating card:', card.title);
        toast({
        title: 'Action',
        description: `Activated card: ${card.title}. Effect logic to be implemented.`,
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
    const aiPlayer = currentState.players.Black;
    
    const suggestion = await getAISuggestion({
      projectCards: aiPlayer.projectCards.map(c => c.title),
      gameState: `Generation ${currentState.generation}. AI has ${aiPlayer.credits} credits.`,
    });

    // In a real game, you'd find the card/action and apply its effects
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
        return { ...prev, currentPlayer: 'White', passCount: 0 };
    });

    setIsAIThinking(false);
  }, [toast]);


  useEffect(() => {
    if (gameState && gameState.currentPlayer === 'Black') {
      const timer = setTimeout(() => processAIMove(gameState), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, processAIMove]);

  if (!isClient || !gameState) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-2xl font-headline">Loading Game...</p>
      </div>
    );
  }

  const humanPlayer = gameState.players.White;
  const aiPlayer = gameState.players.Black;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col xl:flex-row gap-4 overflow-hidden">
      <div className="flex-grow flex flex-col gap-4 items-center justify-center xl:w-3/5">
        <GameStatus
          generation={gameState.generation}
          currentPlayer={gameState.currentPlayer}
          isAIThinking={isAIThinking}
        />
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-headline mb-2">Your Board (Player White)</h2>
            <HexGrid map={humanPlayer.map} onHexClick={(hex) => handleHexClick(hex, 'White')} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-headline mb-2">AI's Board (Player Black)</h2>
            <HexGrid map={aiPlayer.map} onHexClick={(hex) => handleHexClick(hex, 'Black')} />
          </div>
        </div>
      </div>

      <aside className="w-full xl:w-2/5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <PlayerDashboard player={humanPlayer} isCurrentPlayer={gameState.currentPlayer === humanPlayer.id} />
            <PlayerDashboard player={aiPlayer} isCurrentPlayer={gameState.currentPlayer === aiPlayer.id} />
        </div>
        <div className="bg-card p-4 rounded-lg flex-grow">
            <ActionPanel
            player={humanPlayer}
            isCurrentPlayer={gameState.currentPlayer === humanPlayer.id}
            onActivateCard={handleActivateCard}
            onStandardProject={handleStandardProject}
            onPass={handlePass}
            standardProjects={STANDARD_PROJECTS}
            />
        </div>
      </aside>
    </div>
  );
}
