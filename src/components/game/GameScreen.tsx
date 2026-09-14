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
  ResourceType,
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
import { useDemoBridge } from '@/dev/demoBridge';
import { pickHumanAction, pickHumanCityHex } from '@/dev/autoHumanBrain';

import { MarsBoard } from './MarsBoard';
import { PlayerDashboard } from './PlayerDashboard';
import { Supply } from './Supply';
import { ResourceTokenSupply } from './ResourceTokenSupply';
import { ResourceTokenPicker } from './ResourceTokenPicker';
import { OptionalConfirmDialog } from './OptionalConfirmDialog';
import { StandardProjects } from './StandardProjects';
import { CardPanel } from './CardPanel';
import { DraftingView } from './DraftingView';
import { IncomeVisualization } from './IncomeVisualization';
import { GameOverScreen } from './GameOverScreen';
import { TopBar } from './TopBar';
import { MapRevealScreen } from './setup/MapRevealScreen';
import { ColorAssignmentScreen } from './setup/ColorAssignmentScreen';

import { AILogDrawer } from './AILogDrawer';
import { RulesDrawer } from './RulesDrawer';
import { GameFooter } from '@/components/shared/GameFooter';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { getStepById, getStepIndex, TUTORIAL_STEPS } from '@/components/tutorial/tutorialSteps';

import { Loader2, Brain, HelpCircle, ChevronLeft } from 'lucide-react';

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

/** True if the effect (or a composite sub-effect / city bonus) lets the player choose a resource token. */
function effectNeedsTokenChoice(effect: CardEffect): boolean {
  if (effect.type === 'gain_resource_token' && effect.choice) return true;
  if (effect.type === 'composite') return effect.effects.some(effectNeedsTokenChoice);
  if (
    effect.type === 'place_or_relocate_city' &&
    effect.bonusCondition?.bonus.type === 'gain_resource_token'
  ) {
    return true;
  }
  return false;
}

/** Research Outpost-style bonus: only if the target hex has no adjacent parameter tiles (cubes). */
function cityBonusEligible(state: GameState, hexId: HexId): boolean {
  const hex = state.board.find((h) => h.id === hexId);
  if (!hex) return false;
  return !hex.adjacentHexIds.some((adjId) => {
    const adj = state.board.find((h) => h.id === adjId);
    return adj != null && adj.tile !== null;
  });
}

function availableResourceTokens(state: GameState): ResourceType[] {
  const types: ResourceType[] = [];
  if (state.resourceTokenSupply.nature > 0) types.push('nature');
  if (state.resourceTokenSupply.production > 0) types.push('production');
  if (state.resourceTokenSupply.science > 0) types.push('science');
  return types;
}

function allGreeneryHexIds(state: GameState): HexId[] {
  return state.board.filter((h) => h.tile === 'greenery').map((h) => h.id);
}

function adjacentGreeneryHexIds(state: GameState, hexId: HexId): HexId[] {
  const hex = state.board.find((h) => h.id === hexId);
  if (!hex) return [];
  return hex.adjacentHexIds.filter((adjId) => {
    const adj = state.board.find((h) => h.id === adjId);
    return adj?.tile === 'greenery';
  });
}

function effectPlacesCity(effect: CardEffect): boolean {
  if (effect.type === 'place_or_relocate_city') return true;
  if (effect.type === 'composite') return effect.effects.some(effectPlacesCity);
  return false;
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

export function GameScreen({ uid, tutorialCompleted, onBackToDashboard }: { uid?: string; tutorialCompleted?: boolean; onBackToDashboard?: () => void }) {
  return (
    <TutorialProvider uid={uid} tutorialCompletedFromDB={tutorialCompleted}>
      <GameScreenInner onBackToDashboard={onBackToDashboard} />
    </TutorialProvider>
  );
}

// ============================================================
// Inner component (has access to TutorialContext)
// ============================================================

function GameScreenInner({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>('loading');
  const [drawnCardIds, setDrawnCardIds] = useState<CardId[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [aiLogEntries, setAiLogEntries] = useState<AILogEntry[]>([]);
  const [isAILogOpen, setIsAILogOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [tokenPicker, setTokenPicker] = useState<{
    available: ResourceType[];
    pending: {
      cardId: number;
      side: CardSideId;
      targetHexId?: HexId;
      fromHexId?: HexId;
      optionalSpend?: boolean;
      secondaryTargetHexId?: HexId;
    };
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);
  const [aiMode, setAIMode] = useState<AIMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aiMode') as AIMode | null;
      // Gemini is cloud-disabled for now
      if (stored === 'gemini' || !stored) return 'minimax';
      return stored;
    }
    return 'minimax';
  });
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placement = usePlacementMode(gameState);
  const tutorial = useTutorial();

  // Demo recorder bridge — inert unless localStorage.__tfDemo === '1'
  useDemoBridge(
    'game',
    useMemo(
      () =>
        gameState
          ? {
              setupStep,
              phase: gameState.phase,
              generation: gameState.generation,
              humanColor: gameState.players.human.color,
              humanPassed: gameState.players.human.hasPassed,
              aiPassed: gameState.players.ai.hasPassed,
              endCondition: gameState.endCondition,
              winner: gameState.winner,
              // Several placements (the standard projects) start without a
              // prompt string, so the prompt element is not a reliable signal
              // that the board is waiting for a hex click.
              placementActive: placement.isActive,
              placementPrompt: placement.prompt,
              placementValidHexIds: placement.validHexIds,
              // Lets the recorder log AI turns too, so the turn log shows both
              // sides rather than only the moves it makes itself.
              aiTurnCount: aiLogEntries.length,
              lastAiDecision: aiLogEntries.length
                ? aiLogEntries[aiLogEntries.length - 1].decision
                : null,
              suggestAction: () => pickHumanAction(gameState),
              suggestCityHex: () => pickHumanCityHex(gameState),
            }
          : null,
      [
        gameState,
        setupStep,
        placement.isActive,
        placement.prompt,
        placement.validHexIds,
        aiLogEntries,
      ],
    ),
  );

  // Persist AI mode on change
  const handleAIModeChange = useCallback((mode: AIMode) => {
    if (mode === 'gemini') return; // not enabled for cloud
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

  const humanLegalActions = useMemo(() => {
    if (!humanPlayer || !gameState) return [];
    return getLegalActions(gameState, 'human');
  }, [humanPlayer, gameState]);

  const canActivateCards = useMemo(() => {
    if (!humanPlayer) return [];
    // Prefer getLegalActions so placement-impossible cards stay disabled
    return humanPlayer.projectCardsFacing.map((card) =>
      humanLegalActions.some((a) => a.type === 'activate_project' && a.cardId === card.cardId),
    );
  }, [humanPlayer, humanLegalActions]);

  const stdProjectCanActivate = useMemo(() => {
    if (!humanPlayer) return {} as Record<StandardProjectId, boolean>;
    return Object.fromEntries(
      STANDARD_PROJECTS.map((p) => [
        p.id,
        humanLegalActions.some((a) => a.type === 'standard_project' && a.projectId === p.id),
      ]),
    ) as Record<StandardProjectId, boolean>;
  }, [humanPlayer, humanLegalActions]);

  const highlightPass = isHumanTurn && !humanPlayer?.hasPassed
    && humanLegalActions.length > 0
    && humanLegalActions.every((a) => a.type === 'pass');

  // ----------------------------------------------------------
  // Tutorial triggers — setup steps
  // ----------------------------------------------------------
  useEffect(() => {
    if (setupStep === 'loading') tutorial.triggerStep('welcome');
    if (setupStep === 'map-reveal') tutorial.triggerStep('map_reveal');
    if (setupStep === 'color-reveal') {
      tutorial.triggerStep('color_assignment');
    }
    if (setupStep === 'city-black' || setupStep === 'city-white') {
      tutorial.triggerStep('first_city');
      tutorial.triggerStep('bonus_hex_tip');
    }
  }, [setupStep, tutorial.triggerStep]);

  // ----------------------------------------------------------
  // Tutorial triggers — phase transitions
  // ----------------------------------------------------------
  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase === 'research' && gameState.generation === 1) {
      // Credits live on the player dashboard — only tip them once that UI exists
      tutorial.triggerStep('starting_credits');
      tutorial.triggerStep('card_draft_intro');
      tutorial.triggerStep('reading_a_card');
      tutorial.triggerStep('tags_explained');
    }
    if (gameState.phase === 'action') {
      tutorial.triggerStep('action_phase_start');
      // Queue follow-ups in guide order — shown after Got it, not on hover/click
      tutorial.triggerStep('standard_projects');
      tutorial.triggerStep('passing');
    }
    if (gameState.phase === 'income') {
      tutorial.triggerStep('income_phase');
    }
    if (gameState.phase === 'game_over') {
      tutorial.triggerStep('end_game_trigger');
      tutorial.triggerStep('scoring_breakdown');
      tutorial.triggerStep('tutorial_complete');
    }
  }, [gameState?.phase, gameState?.generation, tutorial.triggerStep]);

  // ----------------------------------------------------------
  // Tutorial triggers — AI thinking
  // ----------------------------------------------------------
  useEffect(() => {
    if (isAIThinking) tutorial.triggerStep('ai_turn');
  }, [isAIThinking, tutorial.triggerStep]);

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

      type ActionFields = {
        hexId?: HexId;
        fromHexId?: HexId;
        optionalSpend?: boolean;
        secondaryTargetHexId?: HexId;
        chosenResourceToken?: ResourceType;
      };

      const commitAction = (fields: ActionFields = {}) => {
        const action = {
          type: 'activate_project' as const,
          cardId: cardSide.cardId,
          side: cardSide.side,
          targetHexId: fields.hexId,
          fromHexId: fields.fromHexId,
          optionalSpend: fields.optionalSpend,
          secondaryTargetHexId: fields.secondaryTargetHexId,
          chosenResourceToken: fields.chosenResourceToken,
        };
        setGameState((prev) => {
          if (!prev || getNextActor(prev) !== 'human') return prev; // turn guard
          const after = executeAction(prev, action, 'human');
          const aiPassed = after.players.ai.hasPassed;
          return { ...after, turnOrder: aiPassed ? ['human', 'ai'] : ['ai', 'human'] };
        });
      };

      const maybeAskTokenThenCommit = (fields: ActionFields = {}) => {
        const wantsChoice = effectNeedsTokenChoice(cardSide.effect);
        const isCityBonus =
          cardSide.effect.type === 'place_or_relocate_city' &&
          cardSide.effect.bonusCondition?.bonus.type === 'gain_resource_token';

        const shouldAsk =
          wantsChoice &&
          (!isCityBonus || (fields.hexId !== undefined && cityBonusEligible(gameState, fields.hexId)));

        if (shouldAsk) {
          const available = availableResourceTokens(gameState);
          if (available.length > 0) {
            setTokenPicker({
              available,
              pending: {
                cardId: cardSide.cardId,
                side: cardSide.side,
                targetHexId: fields.hexId,
                fromHexId: fields.fromHexId,
                optionalSpend: fields.optionalSpend,
                secondaryTargetHexId: fields.secondaryTargetHexId,
              },
            });
            return;
          }
        }
        commitAction(fields);
      };

      // --- Comet (10B): optional water after heat ---
      if (cardSide.cardId === 10 && cardSide.side === 'B') {
        const heatAfter = humanPlayer.heatTilesPersonal + 1;
        const waterHexes = getValidHexesForPlacement(gameState, 'water', 'human');
        const canWater =
          heatAfter >= 5 && gameState.parameterSupply.water > 0 && waterHexes.length > 0;

        if (!canWater) {
          commitAction();
          return;
        }

        setConfirmDialog({
          title: 'Place water?',
          description:
            'After gaining heat you will have 5+ heat. Also place a water tile?',
          confirmLabel: 'Place water',
          cancelLabel: 'Heat only',
          onConfirm: () => {
            setConfirmDialog(null);
            placement.startPlacement({
              type: 'water',
              playerId: 'human',
              prompt: 'Select a water hex',
              onComplete: (hexId) => commitAction({ hexId }),
            });
          },
          onCancel: () => {
            setConfirmDialog(null);
            commitAction();
          },
        });
        return;
      }

      // --- Methane from Titan (12B): optional extra spend ---
      if (cardSide.cardId === 12 && cardSide.side === 'B') {
        const effectiveCost = calculateEffectiveCost(cardSide, humanPlayer, gameState);
        const creditsAfterCost = humanPlayer.credits - effectiveCost;
        const tags = countPlayerTags(humanPlayer, gameState);
        const canOptional = creditsAfterCost >= 2 && tags.space >= 2;

        if (!canOptional) {
          commitAction();
          return;
        }

        setConfirmDialog({
          title: 'Extra heat?',
          description: 'Spend 2 more credits for a second heat? (Requires 2 Space tags.)',
          confirmLabel: 'Spend 2 credits',
          cancelLabel: 'Just 1 heat',
          onConfirm: () => {
            setConfirmDialog(null);
            commitAction({ optionalSpend: true });
          },
          onCancel: () => {
            setConfirmDialog(null);
            commitAction();
          },
        });
        return;
      }

      // --- Asteroid (13B): optional return any greenery ---
      if (cardSide.cardId === 13 && cardSide.side === 'B') {
        const greeneryHexes = allGreeneryHexIds(gameState);
        if (greeneryHexes.length === 0) {
          commitAction();
          return;
        }

        setConfirmDialog({
          title: 'Return greenery?',
          description: 'Optionally return 1 greenery tile from the board to supply.',
          confirmLabel: 'Choose greenery',
          cancelLabel: 'Skip',
          onConfirm: () => {
            setConfirmDialog(null);
            placement.startPlacement({
              type: 'custom',
              playerId: 'human',
              validHexIds: greeneryHexes,
              prompt: 'Select a greenery to return',
              onComplete: (hexId) => commitAction({ secondaryTargetHexId: hexId }),
            });
          },
          onCancel: () => {
            setConfirmDialog(null);
            commitAction();
          },
        });
        return;
      }

      // --- Ice Asteroid (4A): water then mandatory adjacent greenery pick ---
      if (cardSide.cardId === 4 && cardSide.side === 'A') {
        placement.startPlacement({
          type: 'water',
          playerId: 'human',
          constraint: getPlacementConstraint(cardSide.effect),
          prompt: 'Place water tile',
          onComplete: (hexId) => {
            const adj = adjacentGreeneryHexIds(gameState, hexId);
            if (adj.length === 0) {
              commitAction({ hexId });
              return;
            }
            placement.startPlacement({
              type: 'custom',
              playerId: 'human',
              validHexIds: adj,
              prompt: 'Select adjacent greenery to return',
              onComplete: (secondary) =>
                commitAction({ hexId, secondaryTargetHexId: secondary }),
            });
          },
        });
        return;
      }

      // --- City place / relocate (Research Outpost) ---
      if (effectPlacesCity(cardSide.effect)) {
        const startCityDestination = (fromHexId?: HexId) => {
          placement.startPlacement({
            type: 'city',
            playerId: 'human',
            ignoreCityHexId: fromHexId,
            prompt: fromHexId != null ? 'Select destination hex' : 'Select hex for city',
            onComplete: (hexId) => maybeAskTokenThenCommit({ hexId, fromHexId }),
          });
        };

        if (humanPlayer.cities.length >= 2) {
          placement.startPlacement({
            type: 'custom',
            playerId: 'human',
            validHexIds: [...humanPlayer.cities],
            prompt: 'Select a city to relocate',
            onComplete: (fromHexId) => startCityDestination(fromHexId),
          });
        } else {
          startCityDestination();
        }
        return;
      }

      if (needsPlacement(cardSide.effect)) {
        const tileType = getPlacementTileType(cardSide.effect);
        placement.startPlacement({
          type: tileType,
          playerId: 'human',
          constraint: getPlacementConstraint(cardSide.effect),
          prompt:
            tileType === 'heat'
              ? 'Place heat on an unoccupied land hex (Lava Flows — map heat hurts adjacent cities)'
              : tileType === 'water'
                ? 'Place water tile'
                : tileType === 'greenery'
                  ? 'Place greenery tile'
                  : 'Select a hex',
          onComplete: (hexId: HexId) => maybeAskTokenThenCommit({ hexId }),
        });
      } else {
        maybeAskTokenThenCommit();
      }
    },
    [gameState, humanPlayer, placement, tutorial],
  );

  const handleTokenPick = useCallback(
    (token: ResourceType) => {
      if (!tokenPicker) return;
      const { pending } = tokenPicker;
      setTokenPicker(null);
      const action = {
        type: 'activate_project' as const,
        cardId: pending.cardId,
        side: pending.side,
        targetHexId: pending.targetHexId,
        fromHexId: pending.fromHexId,
        optionalSpend: pending.optionalSpend,
        secondaryTargetHexId: pending.secondaryTargetHexId,
        chosenResourceToken: token,
      };
      setGameState((prev) => {
        if (!prev || getNextActor(prev) !== 'human') return prev;
        const after = executeAction(prev, action, 'human');
        const aiPassed = after.players.ai.hasPassed;
        return { ...after, turnOrder: aiPassed ? ['human', 'ai'] : ['ai', 'human'] };
      });
    },
    [tokenPicker],
  );

  // ----------------------------------------------------------
  // Action phase: standard project
  // ----------------------------------------------------------
  const handleStandardProject = useCallback(
    (projectId: StandardProjectId) => {
      if (!gameState || !humanPlayer) return;
      const project = STANDARD_PROJECTS.find((p) => p.id === projectId);
      if (!project) return;

      const executeStdAction = (hexId?: HexId, fromHexId?: HexId) => {
        const action = {
          type: 'standard_project' as const,
          projectId,
          targetHexId: hexId,
          fromHexId,
        };
        setGameState((prev) => {
          if (!prev || getNextActor(prev) !== 'human') return prev; // turn guard
          const after = executeAction(prev, action, 'human');
          const aiPassed = after.players.ai.hasPassed;
          return { ...after, turnOrder: aiPassed ? ['human', 'ai'] : ['ai', 'human'] };
        });
      };

      if (project.effectType === 'place_or_relocate_city') {
        const startCityDestination = (fromHexId?: HexId) => {
          placement.startPlacement({
            type: 'city',
            playerId: 'human',
            ignoreCityHexId: fromHexId,
            prompt: fromHexId != null ? 'Select destination hex' : 'Select hex for city',
            onComplete: (hexId: HexId) => executeStdAction(hexId, fromHexId),
          });
        };

        if (humanPlayer.cities.length >= 2) {
          placement.startPlacement({
            type: 'custom',
            playerId: 'human',
            validHexIds: [...humanPlayer.cities],
            prompt: 'Select a city to relocate',
            onComplete: (fromHexId) => startCityDestination(fromHexId),
          });
        } else {
          startCityDestination();
        }
        return;
      }

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
    [gameState, humanPlayer, placement, tutorial],
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

    aiTimerRef.current = setTimeout(async () => {
      aiTimerRef.current = null;
      try {
        const result = await pickActionByMode(currentState, aiMode);
        const action = result.action;
        console.log('[AI] Picked action:', action.type, 'score:', result.score, 'mode:', result.decisionSource, action.type === 'activate_project' ? `card ${action.cardId}${action.side}` : action.type === 'standard_project' ? action.projectId : '', result.geminiReasoning ? `reason: ${result.geminiReasoning}` : '');

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
          geminiReasoning: result.geminiReasoning,
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
    setIsAILogOpen(false);
    setIsRulesOpen(false);
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
    const colorLabel = gameState?.players.human.color === 'black' ? 'Black' : 'White';
    const content = step.content.replace('{color}', colorLabel);
    return (
      <TutorialOverlay
        stepId={step.id}
        title={step.title}
        content={content}
        stepNumber={getStepIndex(step.id) + 1}
        totalSteps={TUTORIAL_STEPS.length}
        position={step.position}
        highlightSelector={step.highlightSelector}
        learnMoreSection={step.learnMoreSection}
        onDismiss={() => tutorial.dismissStep()}
        onSkipAll={() => tutorial.skipAll()}
        onNeverShow={() => tutorial.neverShow()}
        onLearnMore={() => {
          setIsRulesOpen(true);
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
        <div className="w-full max-w-[min(92vw,520px)]">
          <MarsBoard
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
        <div className="w-full max-w-[min(92vw,520px)]">
          <MarsBoard
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
    return <GameOverScreen state={gameState} onPlayAgain={handlePlayAgain} onBackToDashboard={onBackToDashboard} />;
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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopBar
          generation={gameState.generation}
          phase={gameState.phase}
          humanPlayer={humanPlayer}
          isAIThinking={isAIThinking}
          onBack={onBackToDashboard ? () => setShowLeaveConfirm(true) : undefined}
        />

        {/* Leave confirmation dialog */}
        {showLeaveConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
               onClick={() => setShowLeaveConfirm(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#151525', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '24px', maxWidth: '360px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 600, color: '#e0e0e0', marginBottom: '8px' }}>Leave Game?</p>
              <p style={{ fontSize: '12px', color: '#5a5a7a', marginBottom: '20px', fontFamily: "'Inter', system-ui, sans-serif" }}>Your game progress will be lost. This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowLeaveConfirm(false)} style={{ padding: '8px 20px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '6px', color: '#8a8aaa', fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Stay
                </button>
                <button onClick={onBackToDashboard} style={{ padding: '8px 20px', background: '#E8872D', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: "'Orbitron', monospace", fontWeight: 500, letterSpacing: '1px' }}>
                  LEAVE
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-1.5 md:p-2 xl:p-3 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-1.5 md:gap-2 xl:gap-3">
            {/* Left 60%: Mars board centered */}
            <div className="flex flex-col items-center justify-center gap-2">
              <MarsBoard
                board={gameState.board}
                mapId={gameState.map}
                validHexIds={placement.validHexIds}
                isPlacementActive={placement.isActive}
                onHexClick={handleHexClick}
                playerColorMap={playerColorMap}
              />
              {placement.isActive && (
                <div className="flex flex-col items-center gap-1">
                  {placement.prompt && (
                    <p data-testid="placement-prompt" className="text-sm text-foreground font-medium">{placement.prompt}</p>
                  )}
                  <button
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                    onClick={placement.cancelPlacement}
                  >
                    Cancel placement
                  </button>
                </div>
              )}
            </div>

            {/* Right 40%: supply + dashboards + standard projects + cards */}
            <div className="flex flex-col gap-1.5 md:gap-2 min-w-0 overflow-y-auto justify-start py-0.5">
              {/* Compact supply bar — Supply (credits + params) | Tokens (spendable as tags) */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg bg-card/60 border border-border px-2 py-1 md:px-3 md:py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                    Supply
                  </span>
                  <Supply parameterSupply={gameState.parameterSupply} creditSupply={gameState.creditSupply} compact />
                </div>
                <div className="w-0.5 h-6 shrink-0 self-center rounded-full bg-muted-foreground/55" aria-hidden />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0" title="Resource tokens — spend as tags">
                    Tokens
                  </span>
                  <ResourceTokenSupply resourceTokenSupply={gameState.resourceTokenSupply} compact />
                </div>
              </div>

              {/* Scoreboard: side by side */}
              <div className="rounded-lg border border-border bg-card/40 p-1.5 md:p-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Scoreboard</p>
                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  <PlayerDashboard
                    player={humanPlayer}
                    tagCounts={humanTags}
                    isCurrentTurn={isHumanTurn}
                  />
                  <PlayerDashboard
                    player={aiPlayer}
                    tagCounts={aiTags}
                    isCurrentTurn={!isHumanTurn && !aiPlayer.hasPassed}
                  />
                </div>
              </div>

              {/* Actions: standard projects + pass */}
              <div className="rounded-lg border border-border bg-card/40 p-1.5 md:p-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 text-center">Actions</p>
                <StandardProjects
                  canActivate={stdProjectCanActivate}
                  alreadyUsedThisGen={humanPlayer.usedStandardProjectThisGen}
                  isHumanTurn={isHumanTurn}
                  hasPassed={humanPlayer.hasPassed}
                  highlightPass={highlightPass}
                  onStandardProject={handleStandardProject}
                  onPass={handlePass}
                />
              </div>

              {/* Project cards */}
              <div data-tutorial="bottom-panel" className="rounded-lg border border-border bg-card/40 p-1.5 md:p-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 text-center">Project Cards</p>
                <CardPanel
                  cardSides={humanPlayer.projectCardsFacing}
                  effectiveCosts={effectiveCosts}
                  canActivate={canActivateCards}
                  usedCardIds={humanPlayer.usedProjectThisGen}
                  isHumanTurn={isHumanTurn}
                  onActivateCard={handleActivateCard}
                />
              </div>
            </div>
          </div>

          <div data-tutorial="ai-log" className="flex shrink-0 h-full">
            {/* Expanded drawers */}
            {isAILogOpen && (
              <AILogDrawer
                entries={aiLogEntries}
                isOpen
                onToggle={() => setIsAILogOpen(false)}
                aiMode={aiMode}
                onAIModeChange={handleAIModeChange}
              />
            )}
            {isRulesOpen && (
              <RulesDrawer
                isOpen
                onToggle={() => setIsRulesOpen(false)}
                currentPhase={gameState.phase}
              />
            )}
            {/* Collapsed tab strip — always visible */}
            <div className="flex flex-col border-l border-border bg-card/50">
              {!isAILogOpen && (
                <button
                  onClick={() => setIsAILogOpen(true)}
                  className="flex flex-col items-center gap-2 px-2 py-4 hover:bg-card transition-colors cursor-pointer flex-1"
                  title="Open AI Log"
                >
                  <Brain className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    AI Log
                  </span>
                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              {!isRulesOpen && (
                <button
                  onClick={() => setIsRulesOpen(true)}
                  className="flex flex-col items-center gap-2 px-2 py-4 hover:bg-card transition-colors cursor-pointer flex-1 border-t border-border"
                  title="Open Rules"
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    Rules
                  </span>
                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resource token choice (Fusion Power, Research Outpost bonus, etc.) */}
        <ResourceTokenPicker
          open={tokenPicker !== null}
          available={tokenPicker?.available ?? []}
          onPick={handleTokenPick}
          onCancel={() => setTokenPicker(null)}
        />

        <OptionalConfirmDialog
          open={confirmDialog !== null}
          title={confirmDialog?.title ?? ''}
          description={confirmDialog?.description ?? ''}
          confirmLabel={confirmDialog?.confirmLabel}
          cancelLabel={confirmDialog?.cancelLabel}
          onConfirm={() => confirmDialog?.onConfirm()}
          onCancel={() => confirmDialog?.onCancel()}
        />

        {/* Tutorial overlay */}
        {renderTutorialOverlay()}

        {/* Footer */}
        <GameFooter />
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

