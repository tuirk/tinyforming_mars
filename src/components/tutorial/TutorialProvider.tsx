'use client';

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { updateUserDocument } from '@/lib/firebase/user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TutorialState {
  completed: boolean; // true after first game finishes
  skipped: boolean; // true if user clicked "Skip Tutorial" at step 1
  stepsShown: Set<string>; // which steps have been displayed this game
  currentStepId: string | null; // currently visible step
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
const FINAL_STEP_ID = '21';

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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

function initialState(completed: boolean): TutorialState {
  return {
    completed,
    skipped: false,
    stepsShown: new Set<string>(),
    currentStepId: null,
  };
}

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
      if (prev.completed || prev.skipped || prev.stepsShown.has(stepId)) {
        return prev;
      }
      const nextShown = new Set(prev.stepsShown);
      nextShown.add(stepId);
      return { ...prev, stepsShown: nextShown, currentStepId: stepId };
    });
  }, []);

  const dismissStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepId === null) return prev;

      // If the final step is being dismissed, mark the tutorial completed.
      if (prev.currentStepId === FINAL_STEP_ID) {
        writeCompleted(true);
        // Also persist to Firestore if user is logged in
        if (uid) {
          updateUserDocument(uid, { tutorialCompleted: true }).catch(() => {});
        }
        return { ...prev, currentStepId: null, completed: true };
      }

      return { ...prev, currentStepId: null };
    });
  }, [uid]);

  const skipAll = useCallback(() => {
    setState((prev) => ({ ...prev, skipped: true, currentStepId: null }));
  }, []);

  const resetTutorial = useCallback(() => {
    writeCompleted(false);
    setState(initialState(false));
  }, []);

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------

  const isActive = state.currentStepId !== null;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <TutorialContext.Provider
      value={{ state, triggerStep, dismissStep, skipAll, resetTutorial, isActive }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
