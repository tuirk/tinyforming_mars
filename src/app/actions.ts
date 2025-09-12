'use server';

import { explainAIMove, ExplainAIMoveInput } from '@/ai/flows/explain-ai-moves';
import { suggestProjectCard, SuggestProjectCardInput } from '@/ai/flows/suggest-project-card';

export async function getAISuggestion(input: SuggestProjectCardInput): Promise<{suggestedCard: string, reason: string}> {
  try {
    return await suggestProjectCard(input);
  } catch (error) {
    console.error("Error in getAISuggestion:", error);
    // Fallback or error handling
    return { suggestedCard: 'Pass', reason: 'An error occurred while thinking.' };
  }
}

export async function getAIExplanation(input: ExplainAIMoveInput): Promise<{explanation: string}> {
  try {
    return await explainAIMove(input);
  } catch (error) {
    console.error("Error in getAIExplanation:", error);
    // Fallback or error handling
    return { explanation: 'I chose this move based on my internal calculations.' };
  }
}
