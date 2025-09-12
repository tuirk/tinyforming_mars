'use server';

/**
 * @fileOverview A flow to explain the AI's moves in the Tinyformers game.
 *
 * - explainAIMove - A function that takes the AI's move as input and returns an explanation.
 * - ExplainAIMoveInput - The input type for the explainAIMove function.
 * - ExplainAIMoveOutput - The return type for the explainAIMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAIMoveInputSchema = z.object({
  move: z.string().describe('The AI player move to be explained.'),
  gameState: z.string().describe('A description of the current game state.'),
});

export type ExplainAIMoveInput = z.infer<typeof ExplainAIMoveInputSchema>;

const ExplainAIMoveOutputSchema = z.object({
  explanation: z.string().describe('The AI explanation for the move.'),
});

export type ExplainAIMoveOutput = z.infer<typeof ExplainAIMoveOutputSchema>;

export async function explainAIMove(input: ExplainAIMoveInput): Promise<ExplainAIMoveOutput> {
  return explainAIMoveFlow(input);
}

const explainAIMovePrompt = ai.definePrompt({
  name: 'explainAIMovePrompt',
  input: {schema: ExplainAIMoveInputSchema},
  output: {schema: ExplainAIMoveOutputSchema},
  prompt: `You are an expert Tinyformers game strategist. Given the AI's move and the current game state, explain the AI's reasoning behind the move in one sentence.

Game State: {{{gameState}}}
AI Move: {{{move}}}

Explanation:`,
});

const explainAIMoveFlow = ai.defineFlow(
  {
    name: 'explainAIMoveFlow',
    inputSchema: ExplainAIMoveInputSchema,
    outputSchema: ExplainAIMoveOutputSchema,
  },
  async input => {
    const {output} = await explainAIMovePrompt(input);
    return output!;
  }
);
