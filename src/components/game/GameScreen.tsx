'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  AILogEntry,
  AIMode,
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
import { useTutorial } from '@/hooks/useTutorial';
import { pickActionByMode, pickDraftByMode, pickCityByMode } from '@/ai/aiController';

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

import { AILogDrawer } from './AILogDrawer';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { getStepById, getStepIndex, TUTORIAL_STEPS } from '@/components/tutorial/tutorialSteps';

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
// Main component (outer wrapper with TutorialProvider)
// ============================================================

export function GameScreen() {
  return (
    <TutorialProvider>
      <GameScreenInner />
    </TutorialProvider>
  );
}

// ============================================================
// Inner component (has access to TutorialContext)
// ============================================================

function GameScreenInner() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>('loading');
  const [drawnCardIds, setDrawnCardIds] = useState<CardId[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [aiLogEntries, setAiLogEntries] = useState<AILogEntry[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [drawerDefaultTab, setDrawerDefaultTab] = useState<'ai' | 'rules'>('ai');
  const [aiMode, setAIMode] = useState<AIMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aiMode') as AIMode) || 'heuristic';
    }
    return 'heuristic';
  });
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placement = usePlacementMode(gameState);
  const tutorial = useTutorial();

  // Persist AI mode on change
  const handleAIModeChange = useCallback((mode: AIMode) => {
    setAIMode(mode);
    if (typeof window !== 'undefined') localStorage.setItem('aiMode', mode);
  }, []);

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
  // Tutorial triggers — setup steps
  // ----------------------------------------------------------
  useEffect(() => {
    if (setupStep === 'loading') tutorial.triggerStep('welcome');
    if (setupStep === 'map-reveal') tutorial.triggerStep('map_reveal');
    if (setupStep === 'color-reveal') tutorial.triggerStep('color_assignment');
    if (setupStep === 'city-black' || setupStep === 'city-white') tutorial.triggerStep('first_city');
  }, [setupStep, tutorial]);

  // ----------------------------------------------------------
  // Tutorial triggers — phase transitions
  // ----------------------------------------------------------
  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase === 'research' && gameState.generation === 1) {
      tutorial.triggerStep('card_draft_intro');
    }
    if (gameState.phase === 'action') {
      tutorial.triggerStep('action_phase_start');
    }
    if (gameState.phase === 'income') {
      tutorial.triggerStep('income_phase');
    }
    if (gameState.phase === 'game_over') {
      tutorial.triggerStep('end_game_trigger');
    }
  }, [gameState?.phase, gameState?.generation, tutorial]);

  // ----------------------------------------------------------
  // Tutorial triggers — AI thinking
  // ----------------------------------------------------------
  useEffect(() => {
    if (isAIThinking) tutorial.triggerStep('ai_turn');
  }, [isAIThinking, tutorial]);

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
      const hexId = pickCityByMode(gameState, aiMode);
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

      tutorial.triggerStep('activating_project');

      const executeCardAction = (hexId?: HexId) => {
        const action = {
          type: 'activate_project' as const,
          cardId: cardSide.cardId,
          side: cardSide.side,
          targetHexId: hexId,
        };
        setGameState((prev) => {
          if (!prev || getNextActor(prev) !== 'human') return prev; // turn guard
          const after = executeAction(prev, action, 'human');
          const aiPassed = after.players.ai.hasPassed;
          return { ...after, turnOrder: aiPassed ? ['human', 'ai'] : ['ai', 'human'] };
        });
      };

      if (needsPlacement(cardSide.effect)) {
        placement.startPlacement({
          type: getPlacementTileType(cardSide.effect),
          playerId: 'human',
          constraint: getPlacementConstraint(cardSide.effect),
          onComplete: (hexId: HexId) => executeCardAction(hexId),
        });
      } else {
        executeCardAction();
      }
    },
    [gameState, humanPlayer, placement, tutorial],
  );

  // ----------------------------------------------------------
  // Action phase: standard project
  // ----------------------------------------------------------
  const handleStandardProject = useCallback(
    (projectId: StandardProjectId) => {
      if (!gameState) return;
      const project = STANDARD_PROJECTS.find((p) => p.id === projectId);
      if (!project) return;

      tutorial.triggerStep('standard_projects');

      const executeStdAction = (hexId?: HexId) => {
        const action = {
          type: 'standard_project' as const,
          projectId,
          targetHexId: hexId,
        };
        setGameState((prev) => {
          if (!prev || getNextActor(prev) !== 'human') return prev; // turn guard
          const after = executeAction(prev, action, 'human');
          const aiPassed = after.players.ai.hasPassed;
          return { ...after, turnOrder: aiPassed ? ['human', 'ai'] : ['ai', 'human'] };
        });
      };

      if (stdProjectNeedsPlacement(project.effectType)) {
        placement.startPlacement({
          type: stdProjectPlacementType(project.effectType),
          playerId: 'human',
          onComplete: (hexId: HexId) => executeStdAction(hexId),
        });
      } else {
        executeStdAction();
      }
    },
    [gameState, placement, tutorial],
  );

  // ----------------------------------------------------------
  // Action phase: pass
  // ----------------------------------------------------------
  const handlePass = useCallback(() => {
    setGameState((prev) => {
      if (!prev || getNextActor(prev) !== 'human') return prev; // turn guard

      const aiPassed = prev.players.ai.hasPassed;
      if (aiPassed) {
        // Both will be passed — show income
        const passedState = executeAction(prev, { type: 'pass' }, 'human');
        setIsAIThinking(false);
        setShowIncome(true);
        return { ...passedState, phase: 'income' as const };
      } else {
        const passedState = executeAction(prev, { type: 'pass' }, 'human');
        return { ...passedState, turnOrder: ['ai', 'human'] };
      }
    });
  }, []); // no dependencies needed with functional updater

  // ----------------------------------------------------------
  // AI turn during action phase
  // ----------------------------------------------------------
  useEffect(() => {
    if (!gameState || gameState.phase !== 'action') return;
    if (aiTimerRef.current !== null) return; // timer already pending

    const actor = getNextActor(gameState);
    if (actor !== 'ai') return;

    setIsAIThinking(true);
    const currentState = gameState;

    aiTimerRef.current = setTimeout(() => {
      aiTimerRef.current = null;
      try {
        const result = pickActionByMode(currentState, aiMode);
        const action = result.action;
        console.log('[AI] Picked action:', action.type, 'score:', result.score, 'mode:', result.decisionSource, action.type === 'activate_project' ? `card ${action.cardId}${action.side}` : action.type === 'standard_project' ? action.projectId : '');

        // Log the AI decision with enriched data
        setAiLogEntries(prev => [...prev, {
          generation: currentState.generation,
          phase: currentState.phase,
          decision: result.action,
          decisionSource: result.decisionSource,
          timestamp: Date.now(),
          thinkingTimeMs: result.thinkingTimeMs,
          actionsEvaluated: result.actionsEvaluated,
          searchDepth: result.searchDepth,
          evaluatedActions: result.topActions,
          minimaxAdjustment: result.minimaxAdjustments?.map(adj => ({
            action: adj.action,
            originalScore: adj.heuristicScore,
            adjustedScore: adj.minimaxScore,
          })),
        }]);

        // Will both be passed after this action?
        const willBothPass =
          (action.type === 'pass' && currentState.players.human.hasPassed);

        if (willBothPass) {
          // Intercept: execute pass only, show income visualization, don't let
          // processActionPhaseStep auto-transition through postIncomePhase
          const passedState = executeAction(currentState, action, 'ai');
          setGameState({ ...passedState, phase: 'income' as const });
          setIsAIThinking(false);
          setShowIncome(true);
        } else {
          // Use executeAction + manual turn rotation to avoid processActionPhaseStep
          // auto-calling postIncomePhase if this action somehow causes both to pass
          const afterAction = executeAction(currentState, action, 'ai');

          // Check if both passed after this action (shouldn't happen for non-pass, but safety)
          if (afterAction.players.human.hasPassed && afterAction.players.ai.hasPassed) {
            setGameState({ ...afterAction, phase: 'income' as const });
            setIsAIThinking(false);
            setShowIncome(true);
          } else {
            // Rotate turn order manually
            const otherPlayer = 'human';
            const humanPassed = afterAction.players.human.hasPassed;
            const turnOrder = humanPassed
              ? ['ai', 'human']
              : ['human', 'ai'];
            setGameState({ ...afterAction, turnOrder });
            setIsAIThinking(false);
          }
        }
      } catch (err) {
        console.error('[AI] Error executing action:', err);
        try {
          const passedState = executeAction(currentState, { type: 'pass' }, 'ai');
          if (currentState.players.human.hasPassed) {
            setGameState({ ...passedState, phase: 'income' as const });
            setShowIncome(true);
          } else {
            setGameState({ ...passedState, turnOrder: ['human', 'ai'] });
          }
        } catch (e2) {
          console.error('[AI] Fallback pass also failed:', e2);
        }
        setIsAIThinking(false);
      }
    }, 1500);

    return () => {
      if (aiTimerRef.current !== null) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
        setIsAIThinking(false); // reset on cleanup so it retries on remount
      }
    };
  }, [gameState, aiMode]);

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
    setAiLogEntries([]);
    setIsLogOpen(false);
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
  // Tutorial overlay helper (shared across render paths)
  // ============================================================
  const renderTutorialOverlay = () => {
    if (!tutorial.isActive || !tutorial.state.currentStepId) return null;
    const step = getStepById(tutorial.state.currentStepId);
    if (!step) return null;
    return (
      <TutorialOverlay
        stepId={step.id}
        title={step.title}
        content={step.content}
        stepNumber={getStepIndex(step.id) + 1}
        totalSteps={TUTORIAL_STEPS.length}
        position={step.position}
        highlightSelector={step.highlightSelector}
        learnMoreSection={step.learnMoreSection}
        onDismiss={() => tutorial.dismissStep()}
        onSkipAll={() => tutorial.skipAll()}
        onLearnMore={(section) => {
          setDrawerDefaultTab('rules');
          setIsLogOpen(true);
        }}
      />
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  // --- Loading ---
  if (setupStep === 'loading' || !gameState) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-2xl font-bold">Preparing Mars...</p>
        {renderTutorialOverlay()}
      </div>
    );
  }

  // --- Map reveal ---
  if (setupStep === 'map-reveal') {
    return (
      <>
        <MapRevealScreen
          state={gameState}
          onContinue={() => setSetupStep('color-reveal')}
        />
        {renderTutorialOverlay()}
      </>
    );
  }

  // --- Color assignment ---
  if (setupStep === 'color-reveal') {
    return (
      <>
        <ColorAssignmentScreen
          humanColor={gameState.players.human.color}
          onContinue={() => setSetupStep('city-black')}
        />
        {renderTutorialOverlay()}
      </>
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
        {renderTutorialOverlay()}
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
        {renderTutorialOverlay()}
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
          aiMode={aiMode}
          onAIModeChange={handleAIModeChange}
          onHelpClick={() => {
            setDrawerDefaultTab('rules');
            setIsLogOpen(true);
          }}
        />

        <div className="flex flex-1">
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

          <div data-tutorial="ai-log">
            <AILogDrawer
              entries={aiLogEntries}
              isOpen={isLogOpen}
              onToggle={() => {
                setDrawerDefaultTab('ai');
                setIsLogOpen(!isLogOpen);
              }}
              defaultTab={drawerDefaultTab}
              currentPhase={gameState.phase}
            />
          </div>
        </div>

        <div data-tutorial="bottom-panel">
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
            onPassMouseEnter={() => tutorial.triggerStep('passing')}
          />
        </div>

        {/* Tutorial overlay */}
        {renderTutorialOverlay()}
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
