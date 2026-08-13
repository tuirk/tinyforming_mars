'use server';

/**
 * Gemini-powered strategic decision flow.
 * Takes top N candidate actions (pre-scored by minimax/heuristic) and the game
 * state, then asks Gemini to pick the best one with strategic reasoning.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { requireFirebaseUser } from '@/lib/firebase/requireAuth';

const GeminiDecisionInputSchema = z.object({
  gameContext: z.string().describe('Serialized game state summary.'),
  candidates: z.string().describe('Numbered list of candidate actions with heuristic scores.'),
  candidateCount: z.number().describe('Number of candidate actions.'),
});

export type GeminiDecisionInput = z.infer<typeof GeminiDecisionInputSchema>;

const GeminiDecisionOutputSchema = z.object({
  chosenIndex: z.number().describe('0-based index of the chosen action from the candidates list.'),
  reasoning: z.string().describe('One or two sentences explaining the strategic reasoning.'),
});

export type GeminiDecisionOutput = z.infer<typeof GeminiDecisionOutputSchema>;

export async function geminiDecision(
  input: GeminiDecisionInput & { idToken: string },
): Promise<GeminiDecisionOutput> {
  await requireFirebaseUser(input.idToken);
  const { idToken: _idToken, ...promptInput } = input;
  void _idToken;
  return geminiDecisionFlow(promptInput);
}

const geminiDecisionPrompt = ai.definePrompt({
  name: 'geminiDecisionPrompt',
  input: { schema: GeminiDecisionInputSchema },
  output: { schema: GeminiDecisionOutputSchema },
  prompt: `You are an expert strategist for TINYforming Mars, a 2-player board game about terraforming Mars.

## Key Rules
- Game lasts up to 12 generations. Game ends when 2 of 3 parameter supplies (Heat/Greenery/Water) are exhausted, or all hexes are full.
- Heat tiles in personal supply = +1 VP each. Heat tiles ON THE MAP = -1 VP per adjacent city.
- Greenery tiles adjacent to a city = +1 VP to that city's owner. Exclusive adjacency (only your city nearby) = bonus +1 VP.
- Water tiles adjacent to only one player's city = +1 VP. Water placed adjacent to other water = instant credit bonus. Water generates income for adjacent cities.
- Cities cannot be adjacent to each other. City on a bonus hex = free tag.
- Credits cap at 5 between generations (excess taxed away during income).

## Scoring Strategy
- Early game: focus on positioning (city placement, securing bonus hexes, building resource engine)
- Mid game: place tiles near your cities for VP, deny opponent adjacency
- Late game: maximize VP tiles, consider end-game timing (triggering or delaying end)

## Your Task
You are the AI player. Given the game state and a list of candidate actions (pre-scored by a heuristic), pick the BEST action.

The heuristic scores are initial estimates — they value immediate tactical gain. You should also consider:
1. **Long-term positioning** — will this set up future turns?
2. **Opponent denial** — does this block the opponent's best moves?
3. **End-game timing** — should you rush or delay the end?
4. **Resource efficiency** — are you spending credits wisely given the 5-credit tax cap?
5. **Tile adjacency** — place tiles where they score for YOUR cities, not the opponent's

## Game State
{{{gameContext}}}

## Candidate Actions (0-indexed)
{{{candidates}}}

Pick the best action. Return its 0-based index (0 to {{candidateCount}} - 1) and a brief strategic explanation.`,
});

const geminiDecisionFlow = ai.defineFlow(
  {
    name: 'geminiDecisionFlow',
    inputSchema: GeminiDecisionInputSchema,
    outputSchema: GeminiDecisionOutputSchema,
  },
  async (input) => {
    const { output } = await geminiDecisionPrompt(input);
    // Clamp index to valid range
    const result = output!;
    result.chosenIndex = Math.max(0, Math.min(result.chosenIndex, input.candidateCount - 1));
    return result;
  },
);
