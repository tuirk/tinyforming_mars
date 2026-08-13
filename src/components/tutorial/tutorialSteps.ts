// ---------------------------------------------------------------------------
// Tutorial Step Definitions – TINYforming Mars
// ---------------------------------------------------------------------------

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightSelector?: string;
  learnMoreSection?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // 1
  {
    id: 'welcome',
    title: 'Welcome!',
    content:
      "Welcome to TINYforming Mars! You'll compete against an AI to terraform Mars. Follow these tips in order — tap Got it to continue, Skip for this game, or Never show to turn the guide off permanently.",
    position: 'center',
  },
  // 2
  {
    id: 'map_reveal',
    title: 'The Mars Map',
    content:
      'This is your Mars map. It has 19 hexes: 14 land hexes for cities and greenery, and 5 blue water hexes. The hexes with colored borders are Bonus Hexes \u2014 place a city there to gain that tag.',
    position: 'center',
    learnMoreSection: 'map_hexes',
  },
  // 3
  {
    id: 'color_assignment',
    title: 'Your Color',
    content:
      "You're playing as {color}. White goes first in odd generations (1, 3, 5\u2026), Black goes first in even generations (2, 4, 6\u2026). Tap Continue when you're ready.",
    position: 'center',
    learnMoreSection: 'game_flow',
  },
  // 4
  {
    id: 'starting_credits',
    title: 'Starting Credits',
    content:
      'You each start with 5 Credits. Credits are used to pay for projects. The total supply is only 10, so spending wisely matters.',
    position: 'center',
    highlightSelector: '[data-tutorial="credits"]',
    learnMoreSection: 'income',
  },
  // 5
  {
    id: 'card_draft_intro',
    title: 'Card Drafting',
    content:
      "Time to draft cards! You'll draw a card and see both sides. Pick which side YOU want \u2014 the other side goes to your opponent. Choose carefully: you want good projects for yourself AND bad ones for the AI.",
    position: 'center',
    learnMoreSection: 'project_cards',
  },
  // 6
  {
    id: 'reading_a_card',
    title: 'Reading a Card',
    content:
      'Each card shows: the cost in credits (top-left), tag requirements (icons at top), the effect (center text), and two automatic tags at the bottom. You get those bottom tags just by having the card \u2014 no need to activate it.',
    position: 'center',
    learnMoreSection: 'project_cards',
  },
  // 7
  {
    id: 'tags_explained',
    title: 'Tags',
    content:
      'Tags are the currency of requirements. There are 5 types: Energy \u26A1, Production \uD83C\uDFED, Nature \uD83C\uDF3F, Science \uD83D\uDCA1, Space \uD83D\uDE80. Your tags come from three sources: the bottom of your project cards, cities on bonus hexes, and resource tokens you can spend.',
    position: 'center',
    learnMoreSection: 'tags_tokens',
  },
  // 8
  {
    id: 'first_city',
    title: 'Place Your City',
    content:
      'Time to place your city! Cities are key: greenery next to your city scores points, and water next to your city generates income.',
    position: 'center',
    learnMoreSection: 'map_hexes',
  },
  // 9
  {
    id: 'bonus_hex_tip',
    title: 'Bonus Hex',
    content:
      "This is a Bonus Hex. If you place your city here, you'll count as having that tag for as long as your city stays.",
    position: 'center',
    highlightSelector: '[data-tutorial="bonus-hex"]',
    learnMoreSection: 'map_hexes',
  },
  // 10
  {
    id: 'action_phase_start',
    title: 'Action Phase',
    content:
      "It's the Action Phase! On your turn you can do ONE of three things: activate a project card, use a standard project, or pass. You and the AI alternate turns until both pass.",
    position: 'center',
    learnMoreSection: 'game_flow',
  },
  // 11
  {
    id: 'activating_project',
    title: 'Activating a Project',
    content:
      'To activate this card, you need to meet ALL its requirements: enough credits, the right tags, and any parameter thresholds. Green cards place greenery, blue cards place water, red cards give heat. Grey cards have special effects.',
    position: 'center',
    learnMoreSection: 'project_cards',
  },
  // 12
  {
    id: 'standard_projects',
    title: 'Standard Projects',
    content:
      'Standard Projects are always available \u2014 one per generation. Sell Patent gives you a quick credit. Build City lets you place or move a city. The others place water, greenery, or gain heat. Each has a cost and tag requirements just like project cards.',
    position: 'center',
    highlightSelector: '[data-tutorial="standard-projects"]',
    learnMoreSection: 'standard_projects',
  },
  // 13
  {
    id: 'passing',
    title: 'Passing',
    content:
      "If you pass, you're done for this generation \u2014 you can't take any more actions. The AI can keep going until it also passes. Sometimes passing early is strategic.",
    position: 'center',
    highlightSelector: '[data-tutorial="pass-button"]',
    learnMoreSection: 'game_flow',
  },
  // 14
  {
    id: 'ai_turn',
    title: 'AI Turn',
    content:
      'The AI is taking its turn. You can open the AI Thinking panel to see its reasoning \u2014 what moves it considered and why it chose this one.',
    position: 'right',
    highlightSelector: '[data-tutorial="ai-log"]',
  },
  // 15
  {
    id: 'income_phase',
    title: 'Income Phase',
    content:
      "Generation over! Income pays from the shared credit pool (only 10 credits exist). You earn 1 per city and 1 per adjacent water — if the pool is short, unpaid income is skipped. You also can't keep more than 5 credits.",
    position: 'center',
    learnMoreSection: 'income',
  },
  // 16
  {
    id: 'greenery_scoring',
    title: 'Greenery Scoring',
    content:
      "Nice! That greenery next to your city will score +1 point at game end. If it's next to ONLY your city (not the AI's too), it scores an extra +1 point.",
    position: 'center',
    learnMoreSection: 'parameters',
  },
  // 17
  {
    id: 'heat_map_warning',
    title: 'Heat Warning',
    content:
      'Careful \u2014 heat tiles on the MAP hurt adjacent cities (\u22121 point each). Heat in your PERSONAL supply is good (+1 point each). Only Lava Flows puts heat on the map.',
    position: 'center',
    learnMoreSection: 'parameters',
  },
  // 18
  {
    id: 'water_income',
    title: 'Water & Income',
    content:
      'Water tiles next to your cities boost your income every generation. They also score +1 VP at end of game if they\u2019re only next to your cities.',
    position: 'center',
    learnMoreSection: 'parameters',
  },
  // 19
  {
    id: 'end_game_trigger',
    title: 'Game Ending',
    content:
      'The game is ending! This happens when 2 of 3 parameter types run out or all hexes are full.',
    position: 'center',
    learnMoreSection: 'end_game',
  },
  // 20
  {
    id: 'scoring_breakdown',
    title: 'Scoring Breakdown',
    content:
      "Here's how scoring works: each city earns points for adjacent greenery (+1 each) but loses points for adjacent heat on the map (\u22121 each). Greenery and water tiles adjacent to only your cities score +1 bonus each. Heat tiles in your personal supply score +1 each.",
    position: 'center',
    learnMoreSection: 'end_game',
  },
  // 21
  {
    id: 'tutorial_complete',
    title: 'Tutorial Complete',
    content:
      "You've completed your first game! The tutorial won't show again, but you can always tap the \u2753 help button to review any rule. Good luck terraforming!",
    position: 'center',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getStepById(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find((s) => s.id === id);
}

export function getStepIndex(id: string): number {
  return TUTORIAL_STEPS.findIndex((s) => s.id === id);
}
