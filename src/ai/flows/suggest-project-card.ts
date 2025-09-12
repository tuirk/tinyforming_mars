'use server';

/**
 * @fileOverview An AI agent that suggests a project card to activate.
 *
 * - suggestProjectCard - A function that suggests a project card to activate.
 * - SuggestProjectCardInput - The input type for the suggestProjectCard function.
 * - SuggestProjectCardOutput - The return type for the suggestProjectCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectCardInputSchema = z.object({
  projectCards: z
    .string()
    .array()
    .describe('The project cards available to the player.'),
  gameState: z.string().describe('The current game state.'),
});
export type SuggestProjectCardInput = z.infer<typeof SuggestProjectCardInputSchema>;

const SuggestProjectCardOutputSchema = z.object({
  suggestedCard: z.string().describe('The project card that the AI suggests to activate.'),
  reason: z.string().describe('The reason why the AI suggests this card.'),
});
export type SuggestProjectCardOutput = z.infer<typeof SuggestProjectCardOutputSchema>;

export async function suggestProjectCard(input: SuggestProjectCardInput): Promise<SuggestProjectCardOutput> {
  return suggestProjectCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProjectCardPrompt',
  input: {schema: SuggestProjectCardInputSchema},
  output: {schema: SuggestProjectCardOutputSchema},
  prompt: `You are an expert Tinyformers player. Given the current game state and the available project cards, suggest the best project card to activate and explain why.\n\nCurrent Game State: {{{gameState}}}\n\nAvailable Project Cards: {{#each projectCards}}- {{{this}}}\n{{/each}}\n\nSuggest the best card to activate and explain your reasoning. Return the name of the card in suggestedCard field and the explanation in reason field.
`,
});

const suggestProjectCardFlow = ai.defineFlow(
  {
    name: 'suggestProjectCardFlow',
    inputSchema: SuggestProjectCardInputSchema,
    outputSchema: SuggestProjectCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
