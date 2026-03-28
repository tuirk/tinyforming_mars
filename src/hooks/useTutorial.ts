'use client';

import { useContext } from 'react';
import { TutorialContext } from '@/components/tutorial/TutorialProvider';
import type { TutorialContextType } from '@/components/tutorial/TutorialProvider';

export function useTutorial(): TutorialContextType {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return ctx;
}
