export interface HelpSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'how_to_win',
    title: 'How to Win',
    content: `The player with the most **victory points** wins the game.

**Sources of VP:**
- **Cities:** +1 VP per adjacent greenery tile, −1 VP per adjacent heat tile on the map
- **Exclusive tile bonuses:** +1 VP for each greenery or water tile adjacent to only your city/cities (not both players')
- **Heat personal supply:** +1 VP per heat tile in your personal supply

**Tiebreaker:** If scores are tied, compare in order until one player leads:
1. Points from cities
2. Points from greenery tiles
3. Points from water tiles
4. Points from heat tiles`,
    keywords: [
      'win', 'victory', 'points', 'score', 'scoring', 'objective',
      'tiebreaker', 'tie', 'goal', 'VP',
    ],
  },
  {
    id: 'game_flow',
    title: 'Game Flow',
    content: `The game takes place over several **Generations** (rounds). Each Generation has 3 phases in order:

1. **Research Phase** — Draft 3 project cards. Starting player flips card 1, opponent flips card 2, starting player flips card 3. Each player chooses which side faces them and which faces their opponent.
2. **Action Phase** — Players alternate taking one action each (activate a project card, complete a standard project, or pass). After a player passes they take no more actions that generation. The other player may continue until they also pass.
3. **Income Phase** — Collect income, return excess credits above 5, discard project cards.

**Turn order:** White goes first in odd generations (1, 3, 5...), Black goes first in even generations (2, 4, 6...).

A player may only activate each project card **once** per generation, and may only complete **one** standard project per generation.`,
    keywords: [
      'flow', 'generation', 'round', 'phase', 'research', 'action',
      'income', 'turn', 'order', 'draft', 'pass', 'white', 'black',
      'first player', 'alternate',
    ],
  },
  {
    id: 'map_hexes',
    title: 'Map & Hexes',
    content: `Each Mars map is made up of **19 hexes**: 14 land hexes and 5 water hexes.

**Hex types:**
- **Empty Hex** — 9 per map. No additional benefit.
- **Bonus Hex** — 5 per map. Has a tag icon in the center and a thick colored border matching the tag. If your city occupies a bonus hex, it counts as having that tag for as long as your city is there.
- **Water Hex** — 5 per map. Light blue background, reserved exclusively for water tiles. If a water hex has a resource token icon, you gain that token when placing a water tile there (if available in the supply).

Cities and greenery tiles can only be placed on land hexes (not water hexes). Water tiles can only be placed on water hexes.`,
    keywords: [
      'map', 'hex', 'hexes', 'land', 'water', 'bonus', 'empty',
      'Tharsis', 'Elysium', 'placement', 'blue', 'border', 'tag icon',
      'resource token icon',
    ],
  },
  {
    id: 'parameters',
    title: 'Parameters: Heat, Greenery, Water',
    content: `The three parameters represent how you terraform Mars. They are represented by red, green, and blue tiles respectively.

### Heat (Red Tiles)
- Gained to your **personal supply** (not placed on the map, unless a card says otherwise).
- Each heat tile in your personal supply = **+1 VP**.
- **Lava Flows** (Card 3B) places a heat tile on an unoccupied land hex. A heat tile on the map = **−1 VP** to each adjacent city.

### Greenery (Green Tiles)
- Placed on an **unoccupied land hex** (not reserved for water).
- Each greenery tile adjacent to a city = **+1 VP** to that city's owner.
- **Exclusive bonus:** +1 VP if it is adjacent to only one player's city/cities at end game.

### Water (Blue Tiles)
- Placed on an **unoccupied water hex** (light blue background).
- On placement: gain **+1 credit** per adjacent water tile already on the map.
- If the water hex has a resource token icon, gain that resource token.
- **Income:** each water tile adds +1 credit income to each adjacent city.
- **Exclusive bonus:** +1 VP if adjacent to only one player's city/cities at end game.`,
    keywords: [
      'parameter', 'heat', 'greenery', 'water', 'red', 'green', 'blue',
      'tile', 'oxygen', 'lava', 'adjacent', 'personal supply',
      'exclusive', 'bonus', 'VP', 'terraform',
    ],
  },
  {
    id: 'project_cards',
    title: 'Project Cards',
    content: `There are **14 double-sided project cards** (28 project options total). Each side has:

- **Project name**
- **Cost in credits** — Place 1 credit on the card to mark it used; additional credits for the cost go to the supply
- **Tag requirements** — Tags needed from your cards, bonus hex cities, or spent resource tokens
- **Parameter requirements** — Some cards require a number of heat (combined both players' personal supply + map), greenery, or water tiles on the map
- **Effect** — The ability (background color indicates parameter: red=heat, green=greenery, blue=water, grey=other)
- **2 bottom tags** — Available to you whether the project is activated or not

**Cost reductions** (marked with **\\***): Some cards reduce cost based on conditions. Minimum cost is always **1 credit** when a reduction is marked.

**Important:** Card text supersedes the rulebook. Each project card can only be activated **once per generation**. If no matching parameter tiles remain in the supply, a project that would place/gain that tile cannot be activated.`,
    keywords: [
      'project', 'card', 'cards', 'cost', 'credits', 'requirements',
      'tags', 'effect', 'activate', 'double-sided', 'reduction',
      'minimum', 'bottom tags', 'supersedes',
    ],
  },
  {
    id: 'standard_projects',
    title: 'Standard Projects',
    content: `There are **5 standard projects** available every generation. Each player may complete at most **1 standard project per generation**.

1. **Sell Patent** — Cost: 0. Gain 1 credit. Cannot be used if there are no credits in the supply.
2. **Build City** — Cost: 2 credits. Requires: Production + Space tags. Place or relocate one of your city tokens. Placement rules: max 2 cities per player, must be on an unoccupied land hex (not water), cannot be adjacent to any other city.
3. **Import Water** — Cost: 3 credits. Requires: Science + Space tags. Place a water tile from the supply onto an unoccupied water hex.
4. **Greenhouses** — Cost: 3 credits. Requires: Production + Nature + Nature tags. Place a greenery tile from the supply onto an unoccupied land hex.
5. **Energy Farms** — Cost: 3 credits. Requires: Energy + Science tags. Gain a heat tile from the supply to your personal supply.

Standard projects have tag requirements just like project cards. Tags can come from card bottom tags, bonus hex cities, or spent resource tokens.`,
    keywords: [
      'standard', 'project', 'sell patent', 'build city', 'import water',
      'greenhouses', 'energy farms', 'relocate', 'placement',
    ],
  },
  {
    id: 'tags_tokens',
    title: 'Tags & Resource Tokens',
    content: `### The 5 Tag Types
- **Energy** (lightning bolt)
- **Production** (factory)
- **Nature** (leaf/plant)
- **Science** (lightbulb)
- **Space** (rocket)

### Tag Sources
Tags can come from any combination of:
- **Project card bottom tags** — Each of your 3 project cards provides 2 tags on the side facing you. Available whether the project is activated or not.
- **Bonus hex cities** — If your city is on a bonus hex, it counts as having that tag.
- **Resource tokens** — Can be spent (returned to supply) to count as a matching tag.

### Resource Tokens
There are **4 resource tokens** in the supply: Nature x2, Production x1, Science x1.

Resource tokens are gained by:
- Placing a water tile on a water hex that has a resource token icon
- Certain project card effects that grant a resource token of your choice

A resource token can be **spent** (returned to the supply) when you need that matching tag for a project or standard project.`,
    keywords: [
      'tag', 'tags', 'token', 'tokens', 'resource', 'energy',
      'production', 'nature', 'science', 'space', 'lightning',
      'factory', 'leaf', 'lightbulb', 'rocket', 'spend', 'supply',
    ],
  },
  {
    id: 'income',
    title: 'Income Phase',
    content: `During the Income Phase (after all players have passed in the Action Phase):

**Income collection (starting player first, then second player):**
- **+1 credit** per city you own
- **+1 credit** per water tile adjacent to each of your cities
- A water tile touching **both** of your cities counts for each city

**Credit cap:** After collecting income (added to any unspent credits), you must **return all credits above 5** to the supply.

**Cleanup:**
- All credits placed on project cards during the Action Phase are **returned to the supply**
- All project cards for that generation are **discarded**
- If the draw pile is empty, shuffle the discard pile to form a new draw pile`,
    keywords: [
      'income', 'phase', 'credit', 'credits', 'collect', 'cap',
      'limit', 'five', '5', 'return', 'discard', 'cleanup', 'tax',
    ],
  },
  {
    id: 'end_game',
    title: 'End Game & Scoring',
    content: `### End Game Trigger
The current generation becomes the **final generation** when any of these conditions are met:
- **2 or more** of the 3 parameter tile types are exhausted from the supply
- **All hexes** on the map are occupied
- **Generation 12** has been reached

### Final Scoring

**Each city scores:**
- +1 VP per adjacent greenery tile
- −1 VP per adjacent heat tile on the map

**Exclusive tile bonuses:**
- Each greenery tile adjacent to only one player's city/cities = **+1 VP** to that player
- Each water tile adjacent to only one player's city/cities = **+1 VP** to that player

**Heat personal supply:**
- +1 VP per heat tile in your personal supply

### Tiebreaker
If scores are tied, compare in this order until one player leads:
1. Points from cities
2. Points from greenery tiles
3. Points from water tiles
4. Points from heat tiles`,
    keywords: [
      'end', 'game', 'scoring', 'final', 'trigger', 'exhausted',
      'generation 12', 'city', 'greenery', 'water', 'heat',
      'exclusive', 'bonus', 'tiebreaker', 'adjacent', 'VP',
    ],
  },
  {
    id: 'card_reference',
    title: 'Card Reference',
    content: '',
    keywords: [
      'card', 'cards', 'reference', 'project', 'list',
    ],
  },
];
