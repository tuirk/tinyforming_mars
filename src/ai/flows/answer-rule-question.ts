'use server';
/**
 * @fileOverview An AI agent that can answer questions about the Tinyformers rulebook.
 *
 * - answerRuleQuestion - A function that takes a question and returns an answer based on the rulebook.
 * - AnswerRuleQuestionInput - The input type for the answerRuleQuestion function.
 * - AnswerRuleQuestionOutput - The return type for the answerRuleQuestion function.
 */

import { ai } from '@/ai/genkit';
import { getRulebookText } from '@/services/rulebook-service';
import { z } from 'genkit';

const AnswerRuleQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the game rules.'),
});
export type AnswerRuleQuestionInput = z.infer<typeof AnswerRuleQuestionInputSchema>;

const AnswerRuleQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based on the rulebook.'),
});
export type AnswerRuleQuestionOutput = z.infer<typeof AnswerRuleQuestionOutputSchema>;


const queryRulebook = ai.defineTool(
  {
    name: 'queryRulebook',
    description: 'Queries the Tinyformers rulebook to find rules and mechanics. Use this tool to answer any questions about how the game is played.',
    inputSchema: z.object({
      query: z.string().describe('The specific topic or question to look up in the rulebook.'),
    }),
    outputSchema: z.string().describe('The relevant section(s) of the rulebook.'),
  },
  async ({ query }) => {
    console.log(`Querying rulebook for: ${query}`);
    // For now, we return the full text. The LLM is powerful enough to search it.
    // A more advanced implementation could involve creating embeddings and doing a vector search.
    return await getRulebookText();
  }
);


const answerRuleQuestionPrompt = ai.definePrompt({
  name: 'answerRuleQuestionPrompt',
  input: { schema: AnswerRuleQuestionInputSchema },
  output: { schema: AnswerRuleQuestionOutputSchema },
  tools: [queryRulebook],
  prompt: `You are a helpful assistant for the game Tinyformers.
  The user has a question about the rules.
  Use the 'queryRulebook' tool to look up the answer in the official rulebook.
  Based on the information from the rulebook, provide a clear and concise answer to the user's question.

  User's question: {{{question}}}
  `,
});


export const answerRuleQuestionFlow = ai.defineFlow(
  {
    name: 'answerRuleQuestionFlow',
    inputSchema: AnswerRuleQuestionInputSchema,
    outputSchema: AnswerRuleQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await answerRuleQuestionPrompt(input);
    return output!;
  }
);

export async function answerRuleQuestion(input: AnswerRuleQuestionInput): Promise<AnswerRuleQuestionOutput> {
    return answerRuleQuestionFlow(input);
}
