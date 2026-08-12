'use client';

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { updateUserDocument } from '@/lib/firebase/user';
import { getStepIndex } from '@/components/tutorial/tutorialSteps';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TutorialState {
  completed: boolean; // true after first game finishes
  skipped: boolean; // true if user clicked "Skip Tutorial" at step 1
  stepsShown: Set<string>; // which steps have been displayed this game
  currentStepId: string | null; // currently visible step
  /** Steps waiting to show after the user dismisses the current tip. */
  pendingStepIds: string[];
}

export interface TutorialContextType {
  state: TutorialState;
  triggerStep: (stepId: string) => void; // show step if not already shown
  dismissStep: () => void; // close current step
  skipAll: () => void; // suppress all remaining steps
  resetTutorial: () => void; // clear localStorage, restart
  isActive: boolean; // is a tutorial step currently showing
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const TutorialContext = createContext<TutorialContextType | null>(null);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'tutorialCompleted';
const FINAL_STEP_ID = 'tutorial_complete';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCompleted(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

/** Keep pending tips in tutorial definition order (earliest first). */
function sortPending(ids: string[]): string[] {
  return [...ids].sort((a, b) => getStepIndex(a) - getStepIndex(b));
}

function initialState(completed: boolean): TutorialState {
  return {
    completed,
    skipped: false,
    stepsShown: new Set<string>(),
    currentStepId: null,
    pendingStepIds: [],
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TutorialProvider({ children, uid, tutorialCompletedFromDB }: { children: ReactNode; uid?: string; tutorialCompletedFromDB?: boolean }) {
  const [state, setState] = useState<TutorialState>(() =>
    initialState(false),
  );

  // Hydrate from Firestore (via prop) or localStorage
  useEffect(() => {
    const completed = tutorialCompletedFromDB || readCompleted();
    if (completed) {
      setState(initialState(true));
    }
  }, [tutorialCompletedFromDB]);

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  const triggerStep = useCallback((stepId: string) => {
    setState((prev) => {
      if (prev.completed || prev.skipped) return prev;
      if (prev.stepsShown.has(stepId)) return prev;
      if (prev.currentStepId === stepId) return prev;
      if (prev.pendingStepIds.includes(stepId)) return prev;

      // Never interrupt: if a tip is open, queue this one for later.
      if (prev.currentStepId !== null) {
        return {
          ...prev,
          pendingStepIds: sortPending([...prev.pendingStepIds, stepId]),
        };
      }

      const nextShown = new Set(prev.stepsShown);
      nextShown.add(stepId);
      return {
        ...prev,
        stepsShown: nextShown,
        currentStepId: stepId,
      };
    });
  }, []);

  const dismissStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepId === null) return prev;

      // Final step → mark tutorial completed.
      if (prev.currentStepId === FINAL_STEP_ID) {
        writeCompleted(true);
        if (uid) {
          updateUserDocument(uid, { tutorialCompleted: true }).catch(() => {});
        }
        return {
          ...prev,
          currentStepId: null,
          pendingStepIds: [],
          completed: true,
        };
      }

      // Show the next queued tip (already sorted by tutorial order).
      const pending = [...prev.pendingStepIds];
      while (pending.length > 0) {
        const nextId = pending.shift()!;
        if (prev.stepsShown.has(nextId)) continue;
        const nextShown = new Set(prev.stepsShown);
        nextShown.add(nextId);
        return {
          ...prev,
          stepsShown: nextShown,
          currentStepId: nextId,
          pendingStepIds: pending,
        };
      }

      return { ...prev, currentStepId: null, pendingStepIds: [] };
    });
  }, [uid]);

  const skipAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      skipped: true,
      currentStepId: null,
      pendingStepIds: [],
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    writeCompleted(false);
    setState(initialState(false));
  }, []);

  const isActive = state.currentStepId !== null;

  return (
    <TutorialContext.Provider
      value={{ state, triggerStep, dismissStep, skipAll, resetTutorial, isActive }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
