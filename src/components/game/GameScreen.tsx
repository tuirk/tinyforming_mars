'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  GameState,
  CardId,
  CardSideId,
  HexId,
  StandardProjectId,
  CardEffect,
  ParameterTileType,
  PlacementConstraint,
  PlayerColor,
} from '@/engine/types';
import {
  createInitialState,
  drawCardsForResearch,
  draftCard,
  getDraftingPlayerId,
} from '@/engine/gameState';
import {
  getNextActor,
  processActionPhaseStep,
  startActionPhase,
  determineStartPlayer,
} from '@/engine/generation';
import {
  getLegalActions,
  countPlayerTags,
  checkRequirements,
  checkStandardProjectRequirements,
  calculateEffectiveCost,
  getValidHexesForPlacement,
} from '@/engine/rules';
import { executeAction } from '@/engine/actions';
import { processIncomePhase } from '@/engine/income';
import { checkEndCondition, calculateGameResult } from '@/engine/scoring';
import { STANDARD_PROJECTS } from '@/engine/standardProjects';
import { usePlacementMode } from '@/hooks/usePlacementMode';
import { pickRandomAction, pickRandomCityHex } from '@/ai/placeholderAI';

import { HexGrid } from './HexGrid';
import { PlayerDashboard } from './PlayerDashboard';
import { Supply } from './Supply';
import { ResourceTokenSupply } from './ResourceTokenSupply';
import { BottomPanel } from './BottomPanel';
import { DraftingView } from './DraftingView';
import { IncomeVisualization } from './IncomeVisualization';
import { GameOverScreen } from './GameOverScreen';
import { TopBar } from './TopBar';
import { MapRevealScreen } from './setup/MapRevealScreen';
import { ColorAssignmentScreen } from './setup/ColorAssignmentScreen';

import { Loader2 } from 'lucide-react';

// ============================================================
// Setup step state machine
// ============================================================
type SetupStep = 'loading' | 'map-reveal' | 'color-reveal' | 'draft' | 'city-black' | 'city-white' | 'done';

// ============================================================
// Helpers
// ============================================================

/** Check whether a card effect requires hex placement. */
function needsPlacement(effect: CardEffect): boolean {
  if (
    effect.type === 'place_water' ||
    effect.type === 'place_greenery' ||
    effect.type === 'place_heat_on_map' ||
    effect.type === 'place_or_relocate_city'
  ) {
    return true;
  }
  if (effect.type === 'composite') {
    return effect.effects.some(needsPlacement);
  }
  return false;
}

/** Derive the tile type needed for placement from a card effect. */
function getPlacementTileType(effect: CardEffect): ParameterTileType | 'city' {
  switch (effect.type) {
    case 'place_water':
      return 'water';
    case 'place_greenery':
      return 'greenery';
    case 'place_heat_on_map':
      return 'heat';
    case 'place_or_relocate_city':
      return 'city';
    case 'composite':
      for (const sub of effect.effects) {
        if (needsPlacement(sub)) return getPlacementTileType(sub);
      }
      return 'city'; // fallback, shouldn't happen
    default:
      return 'city';
  }
}

/** Extract the placement constraint from a card effect. */
function getPlacementConstraint(effect: CardEffect): PlacementConstraint | undefined {
  switch (effect.type) {
    case 'place_water':
    case 'place_greenery':
    case 'place_heat_on_map':
      return effect.constraint;
    case 'composite':
      for (const sub of effect.effects) {
        if (needsPlacement(sub)) return getPlacementConstraint(sub);
      }
      return undefined;
    default:
      return undefined;
  }
}

/** Check if a standard project effect type needs hex placement. */
function stdProjectNeedsPlacement(effectType: string): boolean {
  return (
    effectType === 'place_water' ||
    effectType === 'place_greenery' ||
    effectType === 'place_or_relocate_city'
  );
}

/** Derive placement tile type from standard project effect type. */
function stdProjectPlacementType(effectType: string): ParameterTileType | 'city' {
  switch (effectType) {
    case 'place_water':
      return 'water';
    case 'place_greenery':
      return 'greenery';
    case 'place_or_relocate_city':
      return 'city';
    default:
      return 'city';
  }
}

// ============================================================
// Main component
// ============================================================

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>('loading');
  const [drawnCardIds, setDrawnCardIds] = useState<CardId[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showIncome, setShowIncome] = useState(false);

  const placement = usePlacementMode(gameState);

  // ----------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------
  const humanPlayer = gameState?.players.human ?? null;
  const aiPlayer = gameState?.players.ai ?? null;

  const playerColorMap = useMemo<Record<string, PlayerColor>>(() => {
    if (!gameState) return {} as Record<string, PlayerColor>;
    return {
      human: gameState.players.human.color,
      ai: gameState.players.ai.color,
    };
  }, [gameState]);

  const humanTags = useMemo(
    () => (humanPlayer && gameState ? countPlayerTags(humanPlayer, gameState) : null),
    [humanPlayer, gameState],
  );

  const aiTags = useMemo(
    () => (aiPlayer && gameState ? countPlayerTags(aiPlayer, gameState) : null),
    [aiPlayer, gameState],
  );

  const isHumanTurn = useMemo(() => {
    if (!gameState || gameState.phase !== 'action') return false;
    return getNextActor(gameState) === 'human';
  }, [gameState]);

  // Bottom panel computations
  const effectiveCosts = useMemo(() => {
    if (!humanPlayer || !gameState) return [];
    return humanPlayer.projectCardsFacing.map((card) =>
      calculateEffectiveCost(card, humanPlayer, gameState),
    );
  }, [humanPlayer, gameState]);

  const canActivateCards = useMemo(() => {
    if (!humanPlayer || !gameState) return [];
    return humanPlayer.projectCardsFacing.map(
      (card) => checkRequirements(humanPlayer, gameState, card).canActivate,
    );
  }, [humanPlayer, gameState]);

  const stdProjectCanActivate = useMemo(() => {
    if (!humanPlayer || !gameState) return {} as Record<StandardProjectId, boolean>;
    return Object.fromEntries(
      STANDARD_PROJECTS.map((p) => [
        p.id,
        checkStandardProjectRequirements(humanPlayer, gameState, p).canActivate,
      ]),
    ) as Record<StandardProjectId, boolean>;
  }, [humanPlayer, gameState]);

  // ----------------------------------------------------------
  // Setup Flow: Step 1 — Loading
  // ----------------------------------------------------------
  useEffect(() => {
    if (setupStep !== 'loading') return;
    const timer = setTimeout(() => {
      const state = createInitialState();
      setGameState(state);
      setSetupStep('map-reveal');
    }, 1500);
    return () => clearTimeout(timer);
  }, [setupStep]);

  // ----------------------------------------------------------
  // Setup Flow: Step 4/5 — AI city placement
  // ----------------------------------------------------------
  useEffect(() => {
    if (!gameState) return;
    if (setupStep !== 'city-black' && setupStep !== 'city-white') return;

    const blackPlayerId = gameState.players.human.color === 'black' ? 'human' : 'ai';
    const whitePlayerId = blackPlayerId === 'human' ? 'ai' : 'human';

    const currentPlayerId = setupStep === 'city-black' ? blackPlayerId : whitePlayerId;
    if (currentPlayerId !== 'ai') return;

    // AI places city with delay
    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const hexId = pickRandomCityHex(gameState);
      if (hexId !== null) {
        setGameState((prev) => {
          if (!prev) return prev;
          const next = structuredClone(prev);
          const hex = next.board.find((h) => h.id === hexId);
          if (hex) {
            hex.city = { playerId: 'ai' };
            next.players.ai.cities.push(hexId);
          }
          return next;
        });
      }
      setIsAIThinking(false);

      if (setupStep === 'city-black') {
        setSetupStep('city-white');
      } else {
        // White has placed, transition to first research phase
        transitionToFirstResearch();
      }
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupStep, gameState?.players.human.color]);

  // ----------------------------------------------------------
  // Setup: human city placement handler
  // ----------------------------------------------------------
  const handleHumanCityPlacement = useCallback(
    (hexId: HexId) => {
      if (!gameState) return;

      const validHexes = getValidHexesForPlacement(gameState, 'city', 'human');
      if (!validHexes.includes(hexId)) return;

      const next = structuredClone(gameState);
      const hex = next.board.find((h) => h.id === hexId);
      if (hex) {
        hex.city = { playerId: 'human' };
        next.players.human.cities.push(hexId);
      }
      setGameState(next);

      if (setupStep === 'city-black') {
        setSetupStep('city-white');
      } else {
        // White has placed, transition to first research phase
        transitionToFirstResearchFromState(next);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameState, setupStep],
  );

  // ----------------------------------------------------------
  // Transition to first research phase (after both cities placed)
  // ----------------------------------------------------------
  const transitionToFirstResearch = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return doTransitionToResearch(prev);
    });
    setSetupStep('done');
  }, []);

  const transitionToFirstResearchFromState = useCallback((state: GameState) => {
    const next = doTransitionToResearch(state);
    setGameState(next);
    setSetupStep('done');
  }, []);

  /** Shared logic: draw 3 cards and set phase to research. */
  function doTransitionToResearch(state: GameState): GameState {
    // Manually set phase to research and clear per-gen flags (same as beginResearchPhase but we
    // keep drawnCardIds separate for the DraftingView)
    const cleared: GameState = {
      ...state,
      phase: 'research' as const,
      currentCards: [],
      passedPlayers: [],
      players: {
        human: {
          ...state.players.human,
          projectCardsFacing: [],
          usedProjectThisGen: [],
          usedStandardProjectThisGen: false,
          hasPassed: false,
          creditsOnCards: 0,
        },
        ai: {
          ...state.players.ai,
          projectCardsFacing: [],
          usedProjectThisGen: [],
          usedStandardProjectThisGen: false,
          hasPassed: false,
          creditsOnCards: 0,
        },
      },
    };
    const { newState, drawnCardIds: drawn } = drawCardsForResearch(cleared);
    setDrawnCardIds(drawn);
    return newState;
  }

  // ----------------------------------------------------------
  // Draft complete handler
  // ----------------------------------------------------------
  const handleDraftComplete = useCallback((newState: GameState) => {
    setGameState(startActionPhase(newState));
  }, []);

  // ----------------------------------------------------------
  // Action phase: card activation
  // ----------------------------------------------------------
  const handleActivateCard = useCallback(
    (index: number) => {
      if (!gameState || !humanPlayer) return;
      const cardSide = humanPlayer.projectCardsFacing[index];
      if (!cardSide) return;

      if (needsPlacement(cardSide.effect)) {
        placement.startPlacement({
          type: getPlacementTileType(cardSide.effect),
          playerId: 'human',
          constraint: getPlacementConstraint(cardSide.effect),
          onComplete: (hexId: HexId) => {
            const action = {
              type: 'activate_project' as const,
              cardId: cardSide.cardId,
              side: cardSide.side,
              targetHexId: hexId,
            };
            setGameState((prev) => {
              if (!prev) return prev;
              return processActionPhaseStep(prev, action, 'human');
            });
          },
        });
      } else {
        const action = {
          type: 'activate_project' as const,
          cardId: cardSide.cardId,
          side: cardSide.side,
        };
        setGameState((prev) => {
          if (!prev) return prev;
          return processActionPhaseStep(prev, action, 'human');
        });
      }
    },
    [gameState, humanPlayer, placement],
  );

  // ----------------------------------------------------------
  // Action phase: standard project
  // ----------------------------------------------------------
  const handleStandardProject = useCallback(
    (projectId: StandardProjectId) => {
      if (!gameState) return;
      const project = STANDARD_PROJECTS.find((p) => p.id === projectId);
      if (!project) return;

      if (stdProjectNeedsPlacement(project.effectType)) {
        placement.startPlacement({
          type: stdProjectPlacementType(project.effectType),
          playerId: 'human',
          onComplete: (hexId: HexId) => {
            const action = {
              type: 'standard_project' as const,
              projectId,
              targetHexId: hexId,
            };
            setGameState((prev) => {
              if (!prev) return prev;
              return processActionPhaseStep(prev, action, 'human');
            });
          },
        });
      } else {
        const action = { type: 'standard_project' as const, projectId };
        setGameState((prev) => {
          if (!prev) return prev;
          return processActionPhaseStep(prev, action, 'human');
        });
      }
    },
    [gameState, placement],
  );

  // ----------------------------------------------------------
  // Action phase: pass
  // ----------------------------------------------------------
  const handlePass = useCallback(() => {
    if (!gameState) return;

    // processActionPhaseStep handles the "both passed" transition internally
    // (it auto-triggers postIncomePhase). But we need to intercept to show the
    // income visualization instead.
    if (gameState.players.ai.hasPassed) {
      // Both will be passed after this — show income visualization
      const passedState = executeAction(gameState, { type: 'pass' }, 'human');
      setGameState({ ...passedState, phase: 'income' as const });
      setShowIncome(true);
    } else {
      const newState = processActionPhaseStep(gameState, { type: 'pass' }, 'human');
      setGameState(newState);
    }
  }, [gameState]);

  // ----------------------------------------------------------
  // AI turn during action phase
  // ----------------------------------------------------------
  useEffect(() => {
    if (!gameState || gameState.phase !== 'action') return;
    const actor = getNextActor(gameState);
    if (actor !== 'ai' || isAIThinking) return;

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const action = pickRandomAction(prev);

        // Check if both will be passed after AI passes
        if (action.type === 'pass' && prev.players.human.hasPassed) {
          const passedState = executeAction(prev, action, 'ai');
          setShowIncome(true);
          return { ...passedState, phase: 'income' as const };
        }

        return processActionPhaseStep(prev, action, 'ai');
      });
      setIsAIThinking(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [gameState, isAIThinking]);

  // ----------------------------------------------------------
  // Income phase complete handler
  // ----------------------------------------------------------
  const handleIncomeComplete = useCallback(() => {
    if (!gameState) return;

    // Step 1: Process income
    const afterIncome = processIncomePhase(gameState);

    // Step 2: Check end condition
    const endCondition = checkEndCondition(afterIncome);
    if (endCondition) {
      const result = calculateGameResult(afterIncome);
      setGameState({
        ...afterIncome,
        phase: 'game_over' as const,
        endCondition,
        winner: result.winner,
      });
      setShowIncome(false);
      return;
    }

    // Step 3: Advance generation
    const nextGeneration = afterIncome.generation + 1;
    const nextStartPlayer = determineStartPlayer(afterIncome, nextGeneration);
    const advanced: GameState = {
      ...afterIncome,
      generation: nextGeneration,
      startPlayerId: nextStartPlayer,
    };

    // Step 4: Begin research phase (draw cards, extract drawnCardIds)
    const cleared: GameState = {
      ...advanced,
      phase: 'research' as const,
      currentCards: [],
      passedPlayers: [],
      players: {
        human: {
          ...advanced.players.human,
          projectCardsFacing: [],
          usedProjectThisGen: [],
          usedStandardProjectThisGen: false,
          hasPassed: false,
          creditsOnCards: 0,
        },
        ai: {
          ...advanced.players.ai,
          projectCardsFacing: [],
          usedProjectThisGen: [],
          usedStandardProjectThisGen: false,
          hasPassed: false,
          creditsOnCards: 0,
        },
      },
    };
    const { newState: researchState, drawnCardIds: drawn } = drawCardsForResearch(cleared);
    setDrawnCardIds(drawn);
    setGameState(researchState);
    setShowIncome(false);
  }, [gameState]);

  // ----------------------------------------------------------
  // Play again handler
  // ----------------------------------------------------------
  const handlePlayAgain = useCallback(() => {
    setGameState(null);
    setSetupStep('loading');
    setDrawnCardIds([]);
    setShowIncome(false);
    setIsAIThinking(false);
  }, []);

  // ----------------------------------------------------------
  // Hex click handler (delegates to placement mode)
  // ----------------------------------------------------------
  const handleHexClick = useCallback(
    (hexId: HexId) => {
      if (placement.isActive) {
        placement.selectHex(hexId);
      }
    },
    [placement],
  );

  // ============================================================
  // RENDER
  // ============================================================

  // --- Loading ---
  if (setupStep === 'loading' || !gameState) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-2xl font-bold">Preparing Mars...</p>
      </div>
    );
  }

  // --- Map reveal ---
  if (setupStep === 'map-reveal') {
    return (
      <MapRevealScreen
        state={gameState}
        onContinue={() => setSetupStep('color-reveal')}
      />
    );
  }

  // --- Color assignment ---
  if (setupStep === 'color-reveal') {
    return (
      <ColorAssignmentScreen
        humanColor={gameState.players.human.color}
        onContinue={() => setSetupStep('city-black')}
      />
    );
  }

  // --- City placement (black) ---
  if (setupStep === 'city-black') {
    const blackPlayerId = gameState.players.human.color === 'black' ? 'human' : 'ai';
    const isHumanPlacing = blackPlayerId === 'human';
    const validCityHexes = isHumanPlacing
      ? getValidHexesForPlacement(gameState, 'city', 'human')
      : [];

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">
          {isHumanPlacing ? 'Place your first city (Black goes first)' : 'AI is placing a city...'}
        </h1>
        {isAIThinking && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div className="w-full max-w-xl">
          <HexGrid
            board={gameState.board}
            mapId={gameState.map}
            validHexIds={validCityHexes}
            isPlacementActive={isHumanPlacing}
            onHexClick={isHumanPlacing ? handleHumanCityPlacement : undefined}
            playerColorMap={playerColorMap}
          />
        </div>
      </div>
    );
  }

  // --- City placement (white) ---
  if (setupStep === 'city-white') {
    const whitePlayerId = gameState.players.human.color === 'white' ? 'human' : 'ai';
    const isHumanPlacing = whitePlayerId === 'human';
    const validCityHexes = isHumanPlacing
      ? getValidHexesForPlacement(gameState, 'city', 'human')
      : [];

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">
          {isHumanPlacing ? 'Place your first city (White goes second)' : 'AI is placing a city...'}
        </h1>
        {isAIThinking && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div className="w-full max-w-xl">
          <HexGrid
            board={gameState.board}
            mapId={gameState.map}
            validHexIds={validCityHexes}
            isPlacementActive={isHumanPlacing}
            onHexClick={isHumanPlacing ? handleHumanCityPlacement : undefined}
            playerColorMap={playerColorMap}
          />
        </div>
      </div>
    );
  }

  // --- Game Over ---
  if (gameState.phase === 'game_over') {
    return <GameOverScreen state={gameState} onPlayAgain={handlePlayAgain} />;
  }

  // --- Income visualization ---
  if (showIncome) {
    return <IncomeVisualization state={gameState} onComplete={handleIncomeComplete} />;
  }

  // --- Research / Drafting ---
  if (gameState.phase === 'research') {
    return (
      <DraftingView
        state={gameState}
        drawnCardIds={drawnCardIds}
        onDraftComplete={handleDraftComplete}
      />
    );
  }

  // --- Action Phase (main game view) ---
  if (gameState.phase === 'action' && humanPlayer && aiPlayer && humanTags && aiTags) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-40">
        <TopBar
          generation={gameState.generation}
          phase={gameState.phase}
          humanPlayer={humanPlayer}
          isAIThinking={isAIThinking}
        />

        <div className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
          {/* Main area: supplies + board */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Supply parameterSupply={gameState.parameterSupply} creditSupply={gameState.creditSupply} />
              <ResourceTokenSupply resourceTokenSupply={gameState.resourceTokenSupply} />
            </div>

            <HexGrid
              board={gameState.board}
              mapId={gameState.map}
              validHexIds={placement.validHexIds}
              isPlacementActive={placement.isActive}
              onHexClick={handleHexClick}
              playerColorMap={playerColorMap}
            />

            {placement.isActive && (
              <div className="text-center">
                <button
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                  onClick={placement.cancelPlacement}
                >
                  Cancel placement
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: player dashboards */}
          <div className="flex flex-col gap-4">
            <PlayerDashboard
              player={humanPlayer}
              tagCounts={humanTags}
              isCurrentTurn={isHumanTurn}
              generation={gameState.generation}
              phase={gameState.phase}
            />
            <PlayerDashboard
              player={aiPlayer}
              tagCounts={aiTags}
              isCurrentTurn={!isHumanTurn && !aiPlayer.hasPassed}
              generation={gameState.generation}
              phase={gameState.phase}
            />
          </div>
        </div>

        <BottomPanel
          cardSides={humanPlayer.projectCardsFacing}
          effectiveCosts={effectiveCosts}
          canActivateCards={canActivateCards}
          usedCardIds={humanPlayer.usedProjectThisGen}
          standardProjectCanActivate={stdProjectCanActivate}
          alreadyUsedStdProject={humanPlayer.usedStandardProjectThisGen}
          isHumanTurn={isHumanTurn}
          hasPassed={humanPlayer.hasPassed}
          onActivateCard={handleActivateCard}
          onStandardProject={handleStandardProject}
          onPass={handlePass}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
