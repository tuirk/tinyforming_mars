# TINYforming Mars — Product Requirements Document

**Version:** 1.0  
**Date:** March 28, 2026  
**Author:** Game Design Discussion (Human + Claude)  
**Status:** Draft — Pending Review

---

## 1. Overview

TINYforming Mars is a digital adaptation of the free print-and-play board game by Michael Bevilacqua. This web application implements a single-player experience where one human player competes against an AI opponent on a shared Mars map. The goal is to terraform Mars by completing projects that raise Heat, Greenery, and Water parameters, building cities, and scoring the most victory points.

**Phase 1 (this document):** 1 Human vs 1 AI  
**Phase 2 (future):** Play with a friend (online multiplayer)

---

## 2. Game Rules Summary

### 2.1 Objective

Both players compete to terraform Mars by completing projects that fulfill parameter requirements (Heat, Greenery, Water). The player with the highest score at end of game wins.

### 2.2 Map

A single shared map is used by both players. The map contains 19 hexagonal spaces: 14 land hexes (for Greenery tiles and City tokens) and 5 water hexes (light blue background, reserved for Water tiles). Among the 14 land hexes, there are 5 Bonus Hexes (with a tag icon and colored border) and 9 Empty Hexes.

Two maps exist: **Tharsis** and **Elysium**. One is randomly selected at the start of each game (binary coin flip, not LLM-based).

**Tharsis layout:**
- Bonus hexes: 2× Production (top-left, bottom-left), 1× Science (top-right), 1× Space (bottom-right), 1× Nature (center area)
- Water hexes: clustered in center-right region
- Strategic note: water clustering rewards city placement near the cluster for income stacking

**Elysium layout:**
- Bonus hexes: 2× Production (bottom-left, bottom-right), 1× Science (top-left area), 1× Nature (top area)
- Water hexes: spread across upper and middle portions
- Strategic note: dispersed water makes income stacking harder; bonus hexes more strategically important

### 2.3 Hex Types

- **Empty Hex:** No additional benefit.
- **Bonus Hex:** Has a tag icon and thick colored border. A city on a Bonus Hex counts as having that tag type for as long as the city remains there. There are 5 Bonus Hexes per map.
- **Water Hex:** Light blue background. Reserved exclusively for Water tiles. If a Water Hex has a Resource Token icon printed on it, placing a Water tile there grants that Resource Token to the player.

### 2.4 Components (Digital Equivalents)

| Physical Component | Digital Representation |
|---|---|
| 14 Project Cards (double-sided) | Card objects with Side A and Side B data |
| Map Cards ×3 (Tharsis, Elysium) | 2 hex-grid board layouts (third map excluded) |
| Credits ×10 | Shared credit supply counter (max 10) |
| Player Tokens: White ×3, Black ×3 | Per-player: 2 City tokens + 1 Project marker |
| Parameter Tiles: Heat (Red) ×11, Greenery (Green) ×7, Water (Blue) ×4 | Shared supply counters per type |
| Resource Tokens: Nature ×2, Production ×1, Science ×1 | Shared supply of 4 tokens |

### 2.5 Setup Sequence

1. **Map selection:** Random coin flip between Tharsis and Elysium.
2. **Color assignment:** Random coin flip. White goes first in odd Generations (1, 3, 5…), Black goes first in even Generations (2, 4, 6…).
3. **Starting credits:** Each player receives 5 Credits from the supply.
4. **Parameter tile supply:** Heat ×11, Greenery ×7, Water ×4 placed in shared supply.
5. **Resource token supply:** Nature ×2, Production ×1, Science ×1 placed in shared supply.
6. **Deck creation:** Shuffle all 14 Project Cards into a face-down draw pile.
7. **Initial card draft:** The starting player (White in Generation 1) draws the first Project Card, flips it face-up, and chooses which side faces them and which faces the opponent. The second player draws the second card and chooses orientation. The first player draws the third card and chooses orientation. Each player now sees 3 project sides facing them.
8. **Initial city placement:** The Black player places one City Token on any land hex (not reserved for water). Then the White player places one City Token on any land hex not reserved for water AND not adjacent to the Black player's city.

### 2.6 Generations (Rounds)

Each Generation has three phases executed in order:

#### Phase 1: Research Phase

Starting with the Generation's first player, players alternate drawing Project Cards from the deck. Each player draws a card, flips it face-up, and chooses which side faces them vs. the opponent. Three cards are drawn total (first player draws cards 1 and 3, second player draws card 2). Each player ends up with access to the 3 sides facing them.

If the draw pile is empty, shuffle the discard pile to create a new draw pile.

#### Phase 2: Action Phase

The Generation's starting player takes one action, then the second player takes one action. Players alternate taking one action each until one player passes. Once a player passes, they cannot take any more actions that Generation. The other player may continue taking actions until they also pass.

**Possible actions:**
- **Activate a Project Card:** Complete one of the 3 projects facing you (if requirements are met). Pay the credit cost, meet tag requirements, meet parameter requirements. Execute the card's effect. Mark the card with your Player Token to indicate it's been used this Generation. A project can only be activated once per Generation.
- **Complete a Standard Project:** Use one of the 5 Standard Projects on the map card (max 1 Standard Project per player per Generation). Mark with Player Token.
- **Pass:** End your participation in this Generation's Action Phase.

**Requirements for Projects and Standard Projects:**
- **Credit cost:** Place the required credits on the card/project. Credits on cards cannot be removed during the Action Phase.
- **Tag requirements:** Tags come from: your Project Cards (the tags printed at the bottom of cards facing you — available whether activated or not), cities on Bonus Hexes, and spending (discarding) Resource Tokens.
- **Parameter requirements:** Heat requirement = combined total of both players' personal heat tile supplies + heat tiles on the map. Greenery/Water requirement = count of Green/Blue tiles on the map.

**Important rules:**
- If there are no available Parameter Tiles matching a project's effect, that project cannot be activated.
- The text of a Project Card supersedes the rulebook.
- Players have access to the tags on their project cards regardless of whether the project is activated.
- Credits gained during the Action Phase cannot be taken from cards that have credits placed on them.

#### Phase 3: Income Phase

Starting with the Generation's first player:
1. Collect **1 Credit per city** they own.
2. Collect **1 Credit per Water Tile adjacent to each of their cities.** A Water Tile touching both of a player's cities counts for each city.
3. Add income credits to any unspent credits from the Action Phase.
4. **Return all Credits above 5 to the supply.** (Hard cap of 5 credits carried between Generations.)
5. Second player repeats the same income process.
6. All Credits on Project Cards are returned to the supply.
7. Project Cards from this Generation are discarded (shuffle discard into draw pile when needed).

**Check for End Game:** If at least 2 of the 3 Parameter Tile types have been exhausted from the supply, OR there are no unoccupied hexes on the map, OR Generation 12 has been reached — the game ends. Otherwise, the next Generation begins with the start player switching.

### 2.7 Parameters

**Heat:** When gained, take a Red Tile from supply → player's personal supply. Each Heat Tile in personal supply = 1 VP at end of game. A Heat Tile on the map = −1 point to any adjacent city during end-game scoring.

**Greenery:** When placing, take a Green Tile from supply → place on an unoccupied land hex (not reserved for water). Each Greenery Tile adjacent to a city = +1 VP for that city's owner. An additional +1 VP if the Greenery Tile is adjacent to ONLY that player's city (not both players' cities).

**Water:** When placing, take a Blue Tile from supply → place on an unoccupied Water Hex. If the Water Hex has a Resource Token icon, gain that Resource Token from supply. If the Water Tile is placed adjacent to any other Water Tiles, gain 1 Credit per adjacent Water Tile. During Income Phase, each Water Tile adjacent to a city adds 1 to that city's income. Each Water Tile adjacent to only one player's city(ies) = 1 VP at end of game.

### 2.8 Standard Projects

Five Standard Projects are available every Generation (max 1 per player per Generation):

1. **Sell Patent:** Gain 1 Credit. No requirements. Cannot be used if the supply has no Credits.
2. **Build City:** Cost 2 + Space + Production tags. Place or relocate one City Token. Rules: max 2 cities per player, must be on unoccupied land hex, cannot be on water hex, cannot be adjacent to any other city. If both cities are placed, may relocate one instead (same placement rules apply).
3. **Import Water:** Cost 3 + Space + Nature tags. Place a Water Tile on an unoccupied Water Hex.
4. **Greenhouses:** Cost 3 + Production + Nature + Nature tags. Place a Greenery Tile on an unoccupied land hex.
5. **Energy Farms:** Cost 3 + Energy + Energy + Science tags. Gain 1 Heat Tile.

### 2.9 Resource Tokens

There are 4 Resource Tokens: Nature ×2, Production ×1, Science ×1. When a Water Tile is placed on a Water Hex containing a Resource Token icon, the placing player gains the matching token from the supply. If the matching token is unavailable, nothing happens.

A Resource Token can be spent (returned to supply) to satisfy a matching Tag requirement for any Project or Standard Project.

Some Project Cards allow the player to gain a Resource Token of their choice from the supply.

### 2.10 Project Cards

There are 14 double-sided Project Cards. Each side contains:

1. **Name** — unique identifier
2. **Cost** — in Credits (asterisk * = cost can be reduced by card effect, minimum cost of 1)
3. **Requirements** — Tags needed (from project cards, bonus hexes, or resource tokens) + Parameter Tile thresholds
4. **Effect Icons** — visual shorthand for the card's ability
5. **Effect Text** — full description (supersedes rulebook)
6. **Tags** — 2 tags at the bottom of each side, available to the owning player immediately upon drafting (whether activated or not)
7. **Background color** — Red (Heat), Green (Greenery), Blue (Water), Grey (utility/other)

### 2.11 Complete Card Data

#### Card 1: ICE CAP MELTING / POWER GRID
- **Side A — ICE CAP MELTING** (Blue/Water): Cost 3. Requires: Energy, Energy, Production tags + 5 Heat tiles. Effect: Place 1 Water Cube on southern row hex. Tags: Production, Production.
- **Side B — POWER GRID** (Red/Heat): Cost 1. Requires: Nature tag. Effect: Gain 1 Heat Cube + 1 Credit per city on Mars. Tags: Energy, Nature.

#### Card 2: ARTIFICIAL LAKE / SOLAR POWER
- **Side A — ARTIFICIAL LAKE** (Blue/Water): Cost 2. Requires: (check image for specifics). Effect: Place 1 Water Cube on a water hex adjacent to a city. Tags: Nature, Nature.
- **Side B — SOLAR POWER** (Red/Heat): Cost 3*. Requires: Energy, Production tags. Reduction: −1 Credit per city on center row. Effect: Gain 1 Heat Cube. Tags: Energy, Science.

#### Card 3: WATER FROM EUROPA / LAVA FLOWS
- **Side A — WATER FROM EUROPA** (Blue/Water): Cost 3*. Requires: Production, Space tags. Reduction: −1 Credit per Space tag beyond one. Effect: Place 1 Water Cube. Tags: Space, Space.
- **Side B — LAVA FLOWS** (Red/Heat): Cost 2. Requires: (none specific). Effect: Place 1 Heat Cube in unoccupied hex not reserved for water. Tags: Nature, Space.

#### Card 4: ICE ASTEROID / FUSION POWER
- **Side A — ICE ASTEROID** (Blue/Water): Cost 3. Requires: Energy tag. Effect: Place 1 Water Cube. If adjacent to Greenery Cubes, return 1 of those Greenery Cubes to supply. Tags: Energy, Space.
- **Side B — FUSION POWER** (Red/Heat): Cost 2. Requires: Nature tag. Effect: Gain 1 Heat Cube + gain 1 available Resource Token of your choice. Tags: Nature, Energy.

#### Card 5: ASTEROID MINING / GHG FACTORIES
- **Side A — ASTEROID MINING** (Grey): Cost 1. Requires: (none). Effect: Gain 1 Credit for each Production and/or Space tag on your Project Cards. Tags: Production, Nature.
- **Side B — GHG FACTORIES** (Red/Heat): Cost 3*. Requires: Energy, Production tags. Reduction: −1 Credit per Production tag beyond two. Effect: Gain 1 Heat Cube. Tags: Energy, Energy.

#### Card 6: GRASS / GEOTHERMAL POWER
- **Side A — GRASS** (Green/Greenery): Cost 2. Requires: Nature ×3, Production tag. Effect: Place 1 Greenery Cube adjacent to a city. Tags: Nature, Nature.
- **Side B — GEOTHERMAL POWER** (Red/Heat): Cost 3*. Requires: Energy, Nature tags. Reduction: −1 Credit per two Heat Cubes you have (min cost 1). Effect: Gain 1 Heat Cube. Tags: Science, Space.

#### Card 7: WINDMILLS / RESEARCH OUTPOST
- **Side A — WINDMILLS** (Red/Heat): Cost 4*. Requires: Energy ×2 tags. Reduction: −1 Credit per unoccupied hex adjacent to your cities (min 1). Effect: Gain 1 Heat Cube. Tags: Energy, Energy.
- **Side B — RESEARCH OUTPOST** (Grey): Cost 1. Requires: Production, Science tags. Effect: Place or Relocate one of your cities. If new hex is not adjacent to any hexes with cubes, gain 1 available Resource Token of your choice. Tags: Energy, Space.

#### Card 8: LICHEN / GREAT DAM
- **Side A — LICHEN** (Green/Greenery): Cost 2. Requires: Nature ×2, Production tags + 2 Heat tiles. Effect: Place 1 Greenery Cube. Cannot be placed adjacent to a city. Tags: Production, Production.
- **Side B — GREAT DAM** (Red/Heat): Cost 3*. Requires: Production, Water tags. Reduction: −1 Credit per Water Cube on Mars beyond two. Effect: Gain 1 Heat Cube. Tags: Nature, Energy.

#### Card 9: TREES / NUCLEAR POWER
- **Side A — TREES** (Green/Greenery): Cost 2. Requires: Science tag + 5 Heat tiles. Effect: Place 1 Greenery Cube adjacent to two other Greenery Cubes. Tags: Production, Nature.
- **Side B — NUCLEAR POWER** (Red/Heat): Cost 2*. Requires: Energy tag. Reduction: −1 Credit per Energy tag you have (min 1). Effect: Gain 1 Heat Cube. Tags: Energy, Science.

#### Card 10: ALGAE / COMET
- **Side A — ALGAE** (Green/Greenery): Cost 2. Requires: Nature, Energy tags + 2 Heat tiles. Effect: Place 1 Greenery Cube adjacent to at least one Water Cube. Tags: Science, Science.
- **Side B — COMET** (Red/Heat): Cost 3. Requires: Energy, Space tags + 5 Heat tiles. Effect: Gain 1 Heat Cube. If you now have 5+ Heat Cubes, you may also place 1 Water Cube. Tags: Energy, Space.

#### Card 11: MOSS / AQUIFER PUMPING
- **Side A — MOSS** (Green/Greenery): Cost 4. Requires: Nature ×3 tags + 1 Water tile. Effect: Place 1 Greenery Cube. Gain 1 Credit per Water Cube adjacent to placed Greenery. Tags: Nature, Nature.
- **Side B — AQUIFER PUMPING** (Blue/Water): Cost 4. Requires: Energy tag. Effect: Place 1 Water Cube. Gain 2 Credits if the Water Cube was NOT placed adjacent to any other Water Cube. Tags: Energy, Energy.

#### Card 12: BUSHES / METHANE FROM TITAN
- **Side A — BUSHES** (Green/Greenery): Cost 5*. Requires: Production tag + 4 Heat tiles. Reduction: −1 Credit per Greenery Cube adjacent to one of your cities (min 1). Effect: Place 1 Greenery Cube. Tags: Energy, Energy.
- **Side B — METHANE FROM TITAN** (Red/Heat): Cost 2. Requires: Production, Space tags. Effect: Gain 1 Heat Cube. If you spend an additional 2 Credits and have a Space tag, gain an additional Heat Cube. Tags: Production, Nature.

#### Card 13: PROTECTED VALLEY / ASTEROID
- **Side A — PROTECTED VALLEY** (Green/Greenery): Cost 4. Requires: Nature ×2 tags + 2 Heat tiles. Effect: Place 1 Greenery Cube in a space reserved for a Water Cube (water hex). Tags: Energy, Energy.
- **Side B — ASTEROID** (Red/Heat): Cost 4. Requires: Science tag. Effect: Gain 1 Heat Cube. You may return 1 Greenery Cube from any Mars hex to the supply. Tags: Science, Nature.

#### Card 14: INSECTS / SUBTERRANEAN RESERVOIR
- **Side A — INSECTS** (Green/Greenery): Cost 2. Requires: Nature, Science tags + 6* Heat tiles. Reduction: −2 Heat parameter requirement per additional Science tag beyond one. Effect: Place 1 Greenery Cube. Tags: Nature, Space.
- **Side B — SUBTERRANEAN RESERVOIR** (Blue/Water): Cost 3*. Requires: Nature ×2, Water tags. Reduction: −1 Credit per additional Nature tag beyond one (min 1). Effect: Place 1 Water Cube. Tags: Energy, Energy.

### 2.12 End Game Scoring

**City scoring:** For each city, count:
- +1 point per adjacent Greenery Tile
- −1 point per adjacent Heat Tile (on the map)

**Greenery & Water Tile scoring:** Each Greenery or Water Tile adjacent to only ONE player's city(ies) = +1 VP for that player. If adjacent to both players' cities, no bonus VP for either.

**Heat Tile scoring:** +1 VP per Heat Tile in the player's personal supply (not on the map).

**Tiebreaker order:** If tied, compare in this order until one player leads:
1. Points from Cities
2. Points from Greenery Tiles
3. Points from Water Tiles
4. Points from Heat Tiles

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| State Management | React Context or Zustand |
| Backend / Auth | Firebase (Authentication, Firestore, Cloud Functions) |
| AI — Decision Engine | Heuristic evaluation + Minimax algorithm (client-side TypeScript) |
| AI — Thinking Node | Gemini API via Firebase Cloud Function |
| Hosting | Firebase Hosting |
| Build Tool | Vite |

### 3.2 System Architecture

```
┌──────────────────────────────────────────────┐
│                  React Frontend               │
│                                               │
│  ┌─────────┐  ┌──────────┐  ┌─────────────┐ │
│  │Board/Map│  │Card Panel │  │ AI Log Panel │ │
│  │Component│  │ Component │  │  (Drawer)    │ │
│  └────┬────┘  └─────┬────┘  └──────┬──────┘ │
│       └──────────┬───┘              │         │
│            ┌─────▼──────┐           │         │
│            │ Game Engine │───────────┘         │
│            │ (TypeScript)│                     │
│            └──┬───────┬──┘                     │
│               │       │                        │
│     ┌─────────▼──┐ ┌──▼────────────┐          │
│     │  AI Engine  │ │ Rules Engine  │          │
│     │ (Heuristic  │ │ (Validation,  │          │
│     │  + Minimax) │ │  Legal Moves) │          │
│     └──────┬──────┘ └──────────────┘          │
└────────────┼──────────────────────────────────┘
             │ (complex decisions only)
     ┌───────▼────────┐
     │ Firebase Cloud  │
     │   Function      │
     │ (Gemini API)    │
     └────────────────┘
```

### 3.3 Core Modules

**Game Engine (`/src/engine/`):**
- `gameState.ts` — Central state type definitions and state management
- `rules.ts` — Legal move validation, requirement checking, end-game detection
- `actions.ts` — Action execution (project activation, standard projects, tile placement)
- `income.ts` — Income phase calculation, credit cap enforcement
- `scoring.ts` — End-game scoring with tiebreaker logic
- `cards.ts` — All 14 cards with both sides as structured data
- `maps.ts` — Hex grid definitions for Tharsis and Elysium

**AI Engine (`/src/ai/`):**
- `heuristic.ts` — Board state evaluation function (returns numeric score)
- `minimax.ts` — Minimax search with alpha-beta pruning
- `thinkingNode.ts` — Gemini API integration for complex decisions
- `aiController.ts` — Orchestrator: routes decisions to the appropriate layer
- `aiLogger.ts` — Structured logging of all AI reasoning for the side panel

**UI Components (`/src/components/`):**
- `HexBoard.tsx` — SVG hex grid with tile/city rendering and click interactions
- `CardPanel.tsx` — Bottom card fan showing player's project cards
- `StandardProjects.tsx` — Compact icon row for the 5 standard projects
- `AILogDrawer.tsx` — Collapsible right-side panel for AI thinking logs
- `PlayerDashboard.tsx` — Credit count, heat supply, resource tokens, generation tracker
- `DraftingView.tsx` — Card orientation selection during Research Phase
- `GameOverScreen.tsx` — Final scoring breakdown with tiebreaker detail

**Firebase (`/src/firebase/`):**
- `auth.ts` — Anonymous or email auth for game persistence
- `gameStore.ts` — Firestore read/write for saving/loading game state
- `geminiFunction.ts` — Cloud Function wrapper for Gemini API calls

---

## 4. AI Architecture — Detailed Design

### 4.1 Layer 1: Heuristic Evaluation

A pure function `evaluate(state: GameState, playerId: string): number` that scores any game state from a player's perspective. This is the foundation that both standalone heuristic decisions and minimax search depend on.

**Scoring weights (initial values, to be tuned through playtesting):**

| Factor | Weight | Notes |
|---|---|---|
| Heat Tile in personal supply | +1.0 | Direct VP |
| Greenery Tile adjacent to only my city | +2.0 | City VP + exclusive bonus VP |
| Greenery Tile adjacent to my city (shared) | +1.0 | City VP only, no exclusive bonus |
| Greenery Tile adjacent to opponent's city only | −1.0 | Opponent scores |
| Heat Tile on map adjacent to my city | −1.0 | Negative city VP |
| Heat Tile on map adjacent to opponent's city | +0.5 | Damages opponent |
| Water Tile adjacent to only my city | +1.5 | VP + income value |
| Water Tile adjacent to both cities | +0.5 | Income only, no exclusive VP |
| Credits in hand | +0.3 | Enabling resource, not direct VP |
| City on Bonus Hex | +0.5–1.5 | Depends on tag relevance to available cards |
| Resource Token held | +0.8 | Flexible tag substitute |
| Available legal moves count | +0.1 each | More options = better position |

**End-game proximity adjustment:** As the game approaches end conditions (parameter supplies low, hexes filling up), the evaluator should shift weights toward direct VP scoring and away from positional/income factors.

### 4.2 Layer 2: Minimax with Alpha-Beta Pruning

For Action Phase decisions, the AI uses minimax search to look ahead.

**Algorithm:**
```
function minimax(state, depth, isMaximizing, alpha, beta):
  if depth == 0 or state is terminal:
    return heuristic.evaluate(state, aiPlayerId)

  if isMaximizing (AI's turn):
    maxEval = -infinity
    for each legal action in getLegalActions(state, aiPlayerId):
      newState = applyAction(state, action)
      eval = minimax(newState, depth - 1, false, alpha, beta)
      maxEval = max(maxEval, eval)
      alpha = max(alpha, eval)
      if beta <= alpha: break  // prune
    return maxEval

  else (Human's turn):
    minEval = +infinity
    for each legal action in getLegalActions(state, humanPlayerId):
      newState = applyAction(state, action)
      eval = minimax(newState, depth - 1, true, alpha, beta)
      minEval = min(minEval, eval)
      beta = min(beta, eval)
      if beta <= alpha: break  // prune
    return minEval
```

**Search depth:** Start at depth 2 (AI move → Human response). Increase to depth 3 if performance allows (measure in browser). The branching factor is approximately 5-8 legal actions per turn, so depth 2 evaluates roughly 25-64 leaf nodes — trivial for modern browsers.

**Alpha-beta pruning:** Eliminates branches that can't possibly influence the final decision, significantly reducing the number of evaluations needed.

**Move ordering optimization:** Evaluate "promising" moves first (high heuristic score) to improve pruning efficiency.

### 4.3 Layer 3: Gemini Thinking Node

For decisions where the heuristic/minimax approach is insufficient — primarily the Research Phase card draft, and optionally for ambiguous Action Phase situations.

**When to invoke Gemini:**
- **Always:** Card orientation decisions during Research Phase (which side faces the AI)
- **Conditionally:** When the top 2-3 minimax-scored actions are within a narrow margin (e.g., within 0.5 points of each other), ask Gemini to break the tie with contextual reasoning
- **Never:** Simple/obvious decisions where minimax gives a clear winner

**Prompt structure for drafting:**
```
You are the AI player in TINYforming Mars. Analyze this card draft decision.

GAME STATE:
- Generation: {n}
- Your color: {color}
- Your cities: {hex positions}
- Your current tags (from existing project cards): {tags}
- Your heat supply: {count}
- Map parameters: Heat tiles {n}/11, Greenery tiles {n}/7, Water tiles {n}/4
- Opponent's visible tags: {tags}

CARD DRAWN:
- Side A: {name} — {effect} — Tags: {tags} — Cost: {cost} — Requirements: {reqs}
- Side B: {name} — {effect} — Tags: {tags} — Cost: {cost} — Requirements: {reqs}

Which side should face you (the AI)? Consider:
1. Which side's effect is more valuable given the current board state?
2. Which side's tags help you more for future projects?
3. How much does giving the other side to your opponent help them?
4. Can you actually meet the requirements to activate your chosen side?

Respond in JSON: { "choice": "A" | "B", "reasoning": "brief explanation" }
```

**Gemini model:** Use Gemini Flash for low latency and cost. Invoke via Firebase Cloud Function to keep API key secure.

**Logging:** All Gemini responses (including reasoning) are captured and displayed in the AI Log Drawer.

### 4.4 AI Decision Flow

```
AI's Turn
    │
    ├── Research Phase (Card Draft)?
    │   └── YES → Call Gemini Thinking Node
    │            → Log reasoning
    │            → Return chosen orientation
    │
    └── Action Phase?
        └── YES → Gather all legal actions
                → Run Minimax (depth 2-3) on each
                → Are top actions within close margin?
                │   ├── YES → Call Gemini to break tie
                │   │        → Log both minimax scores + Gemini reasoning
                │   │        → Return Gemini's choice
                │   └── NO  → Select highest-scored action
                │            → Log minimax evaluation tree
                │            → Return best action
                → Execute chosen action with animation
```

### 4.5 AI Logging Format

The AI Log Drawer displays structured entries for each AI decision:

```
[Generation 3 — Action Phase]
┌ Evaluating 4 legal actions:
│  ① Place Greenery at Hex 7 .......... Score: +3.2
│     ↳ Adjacent to my city (+2.0), exclusive (+1.0), income (+0.2)
│  ② Activate Solar Power ............. Score: +1.8
│     ↳ Heat to supply (+1.0), credits gained (+0.8)
│  ③ Standard: Sell Patent ............ Score: +0.3
│     ↳ +1 Credit only
│  ④ Pass .............................. Score: +0.0
│
│  Minimax depth-2 adjustment:
│     ① drops to +2.5 (opponent takes Hex 8 for +0.7)
│     ② stays at +1.8
│
└ DECISION: Place Greenery at Hex 7 ✓
```

For Gemini-assisted decisions:
```
[Generation 2 — Research Phase — Card Draft]
┌ Card drawn: ICE ASTEROID / FUSION POWER
│  Side A (ICE ASTEROID): Place Water, may destroy Greenery
│  Side B (FUSION POWER): Gain Heat + Resource Token
│
│  🧠 Gemini Analysis:
│  "Taking Fusion Power (Side B). I need Heat tiles for
│   scoring and the Resource Token gives me flexibility
│   for tag requirements. Giving the opponent Ice Asteroid
│   is a risk but they lack the Energy tag to activate it."
│
└ DECISION: Side B — FUSION POWER faces AI ✓
```

---

## 5. Data Models

### 5.1 Game State

```typescript
interface GameState {
  id: string;
  map: 'tharsis' | 'elysium';
  generation: number;
  phase: 'setup' | 'research' | 'action' | 'income' | 'game_over';
  startPlayerId: string; // who goes first this Generation

  players: {
    human: PlayerState;
    ai: PlayerState;
  };

  board: HexState[]; // 19 hexes
  parameterSupply: {
    heat: number;    // starts at 11
    greenery: number; // starts at 7
    water: number;   // starts at 4
  };
  resourceTokenSupply: {
    nature: number;     // starts at 2
    production: number; // starts at 1
    science: number;    // starts at 1
  };
  creditSupply: number; // starts at 10 (minus 5 per player = 0 after setup)

  deck: CardId[];         // draw pile (card IDs)
  discard: CardId[];      // discard pile
  currentCards: DraftedCard[]; // 3 cards in play this Generation

  turnOrder: string[];   // who acts next
  passedPlayers: string[];
  actionLog: ActionLogEntry[];
  aiLog: AILogEntry[];

  endCondition: 'parameters' | 'hexes_full' | 'generation_12' | null;
  winner: string | null;
}

interface PlayerState {
  id: string;
  color: 'white' | 'black';
  credits: number;
  heatTilesPersonal: number; // Heat tiles in personal supply (VP)
  cities: HexId[];           // hex IDs where cities are placed (max 2)
  resourceTokens: ResourceType[];
  projectCardsFacing: CardSide[]; // the 3 sides facing this player
  usedProjectThisGen: CardId[];
  usedStandardProjectThisGen: boolean;
  hasPassed: boolean;
}

interface HexState {
  id: HexId;
  type: 'land' | 'water';
  bonusTag: TagType | null; // for bonus hexes
  resourceTokenIcon: ResourceType | null; // for water hexes with icons
  tile: 'heat' | 'greenery' | 'water' | null;
  tilePlacedBy: string | null;
  city: { playerId: string } | null;
  row: 'north' | 'center' | 'south'; // for card effects referencing rows
  adjacentHexIds: HexId[];
}

interface CardSide {
  cardId: CardId;
  side: 'A' | 'B';
  name: string;
  color: 'red' | 'green' | 'blue' | 'grey';
  cost: number;
  costReduction: CostReduction | null;
  tagRequirements: TagRequirement[];
  parameterRequirements: ParameterRequirement[];
  effect: CardEffect;
  tags: [TagType, TagType]; // always exactly 2
}

type TagType = 'energy' | 'production' | 'nature' | 'science' | 'space';
type ResourceType = 'nature' | 'production' | 'science';
```

### 5.2 Hex Grid Adjacency

Each map is stored as a fixed array of 19 hexes with pre-computed adjacency lists. Hexes are indexed 0–18 with row/column coordinates for rendering.

```typescript
interface HexDefinition {
  id: number;
  row: number;
  col: number;
  type: 'land' | 'water';
  bonusTag: TagType | null;
  resourceTokenIcon: ResourceType | null;
  adjacentIds: number[];
  mapRow: 'north' | 'center' | 'south';
}
```

### 5.3 Card Effect System

Card effects are encoded as structured objects, not free text, so the game engine can execute them programmatically:

```typescript
type CardEffect =
  | { type: 'place_water'; constraint?: PlacementConstraint }
  | { type: 'place_greenery'; constraint?: PlacementConstraint }
  | { type: 'gain_heat'; count: number }
  | { type: 'place_heat_on_map'; constraint?: PlacementConstraint }
  | { type: 'gain_credits'; formula: CreditFormula }
  | { type: 'gain_resource_token'; choice: boolean }
  | { type: 'place_or_relocate_city'; bonusCondition?: CityBonusCondition }
  | { type: 'return_greenery' }  // destructive: remove opponent's greenery
  | { type: 'composite'; effects: CardEffect[] } // for cards with multiple effects

interface PlacementConstraint {
  adjacent_to?: 'city' | 'greenery' | 'water' | 'none';
  not_adjacent_to?: 'city';
  row?: 'south' | 'center' | 'north';
  hex_type?: 'water' | 'land';
  min_adjacent_greenery?: number;
  min_adjacent_water?: number;
}

type CostReduction =
  | { type: 'per_tag'; tag: TagType; beyond?: number; amount: number }
  | { type: 'per_tile'; tile: 'heat' | 'greenery' | 'water'; beyond?: number; amount: number }
  | { type: 'per_city_on_row'; row: 'center'; amount: number }
  | { type: 'per_adjacent_unoccupied'; amount: number }
  | { type: 'per_heat_cubes'; divisor: number; amount: number }
```

---

## 6. UI/UX Design

### 6.1 Layout

```
┌─────────────────────────────────────────────────────┐
│ Top Bar: Generation #  |  Phase  |  Player Color    │
│         Credit Count  |  Heat Supply  |  Resources  │
├────────────────────────────────────┬────────────────┤
│                                    │   AI Thinking  │
│                                    │     Log        │
│          Hex Board                 │   (Collapsible │
│       (center-left)                │    Drawer)     │
│                                    │                │
│                                    │  [Gen 3 Action]│
│                                    │  Evaluating... │
│                                    │  ① Greenery +3 │
│                                    │  ② Solar    +1 │
│                                    │  Decision: ①   │
├────────────────────────────────────┴────────────────┤
│  [Card 1]     [Card 2]     [Card 3]    │ Standard  │
│  ┌───────┐    ┌───────┐    ┌───────┐   │ Projects  │
│  │       │    │       │    │       │   │ [5 icons] │
│  │       │    │       │    │       │   │           │
│  └───────┘    └───────┘    └───────┘   │  [Pass]   │
└─────────────────────────────────────────────────────┘
```

### 6.2 Key UI States

**Setup Flow:**
1. Loading screen → Random map and color assignment with animation
2. "You are White/Black. White goes first." announcement
3. Card draft phase with flip animations (see Research Phase below)
4. City placement — valid hexes highlighted, click to place

**Research Phase (Drafting):**
- When it's the human's turn to draw: card slides in face-down, flips to reveal both sides. Player taps/clicks to choose which side faces them. Clear labels: "Keep this side" / "Give to AI."
- When it's the AI's turn to draw: brief "thinking" animation (1-2 seconds), card flips, AI's choice is shown. Log panel streams the Gemini reasoning.
- After all 3 cards are drafted: smooth transition showing the player's 3 facing sides fanning out at the bottom.

**Action Phase:**
- Player's turn: Project Cards displayed at bottom, Standard Projects in compact icon row. Clickable when requirements are met (greyed out otherwise). Clicking a project shows required hex placement on the board (if applicable) with valid hexes highlighted.
- AI's turn: Brief pulse animation on AI's city area. Thinking log streams in the drawer. After decision, tile placement or effect animates on the board. 1-2 second deliberate pace to feel like a real opponent.

**Income Phase:**
- Automated sequence with step-by-step visual: "+1 Credit (City A)" → "+1 Credit (City B)" → "+2 Credits (Water tiles)" → "Credits capped at 5, returning 3 to supply" → Cards slide to discard pile.

**End Game:**
- Score breakdown screen with categories (Cities, Greenery, Water, Heat), visual comparison between player and AI, tiebreaker detail if needed, winner announcement.

### 6.3 AI Turn Experience

1. **Thinking indicator:** Subtle animation near AI's cities or in the log panel header. Text: "AI is thinking..."
2. **Log streaming:** Reasoning appears line by line in the AI Log Drawer (whether open or closed, a badge/indicator shows activity).
3. **Decision announcement:** Brief highlight of the chosen action (e.g., hex pulses before tile is placed).
4. **Execution animation:** Tile slides onto hex, heat cube moves to supply, credits update — smooth transitions, 0.5-1 second total.
5. **Log finalization:** Decision entry is marked complete with a checkmark.

### 6.4 Standard Projects UI

Compact row of 5 icon buttons below or beside the card fan area. Each button shows the project's icon and cost. Hover/tap reveals a tooltip with full details and current requirement status (met/unmet). Greyed out when requirements aren't met or already used this Generation.

```
[💰 Sell] [🏙️ City: 2] [💧 Water: 3] [🌿 Green: 3] [🔥 Heat: 3]
```

### 6.5 Responsive Design

- **Desktop (primary):** Full layout as described above.
- **Mobile:** Board takes full width, card panel and standard projects collapse into a bottom sheet that slides up. AI log becomes a modal overlay. Phase indicators move to a compact top bar.

### 6.6 Theme

- Dark theme (as in existing implementation).
- Color-coding consistent with the physical game: Red/Heat, Green/Greenery, Blue/Water, Grey/utility.
- Hex board rendered as SVG for crisp scaling.

---

## 7. Firebase Architecture

### 7.1 Authentication

Anonymous auth by default (no sign-up required to play). Optional email auth for game save persistence across devices.

### 7.2 Firestore Schema

```
/games/{gameId}
  - state: GameState (full serialized state)
  - createdAt: timestamp
  - updatedAt: timestamp
  - userId: string
  - status: 'active' | 'completed'

/users/{userId}
  - games: string[] (game IDs)
  - stats: { wins: number, losses: number, totalGames: number }
```

### 7.3 Cloud Functions

**`callGemini`** — HTTP callable function. Receives: game state context + decision type (draft/tiebreak). Calls Gemini Flash API. Returns: structured decision + reasoning text. Rate-limited per user.

### 7.4 Game Save / Load

- Auto-save to Firestore after each action.
- "Continue Game" option on home screen loads the most recent active game.
- Game state is fully serializable as JSON.

---

## 8. Development Phases

### Phase 1A: Core Engine (no UI)
- Game state types and initialization
- Hex grid definitions for both maps with adjacency
- Card data for all 14 cards (28 sides)
- Rules engine: legal move validation, requirement checking
- Action execution: all project effects, standard projects
- Income phase logic with credit cap
- End-game detection and scoring
- Unit tests for all rules and edge cases

### Phase 1B: Basic Playable UI
- Hex board SVG rendering with click interaction
- Card panel with project card display
- Standard projects compact UI
- Setup flow (random map, color, initial draft, city placement)
- Phase-by-phase game flow with turn management
- Player dashboard (credits, heat, resources, generation)
- Basic AI: random legal moves (placeholder)

### Phase 1C: AI — Heuristic Layer
- Board state evaluation function
- Heuristic-only AI (no search, no LLM)
- AI plays legal moves ranked by heuristic score
- AI log panel (basic: shows chosen action + score)
- Playtesting and weight tuning

### Phase 1D: AI — Minimax Layer
- Minimax search with alpha-beta pruning
- Configurable search depth
- Move ordering optimization
- Enhanced AI logging (shows evaluation tree)
- Performance testing in browser

### Phase 1E: AI — Gemini Thinking Node
- Firebase Cloud Function for Gemini API calls
- Draft decision prompts and response parsing
- Tiebreaker logic (when to call Gemini vs trust minimax)
- Streaming reasoning to AI log panel
- Error handling / fallback to heuristic if Gemini is unavailable

### Phase 1F: Polish
- Animations (tile placement, card drafting, AI thinking)
- Sound effects (optional)
- End-game scoring screen
- Firebase auth and game persistence
- Mobile responsive layout
- Bug fixing and edge case handling

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Gemini API latency | Slow AI turns | Use Gemini Flash; fallback to heuristic if timeout >5s |
| Gemini returns illegal move | Game-breaking | All AI decisions validated by Rules Engine before execution |
| Minimax too slow in browser | Poor UX | Start at depth 2; profile and optimize; web worker offloading |
| Heuristic weights poorly tuned | AI feels dumb | Iterative playtesting; log and review AI decisions; expose tuning UI for dev mode |
| Card effect edge cases | Incorrect game state | Comprehensive unit tests for every card; card text supersedes rules |
| Credit supply exhaustion | Silent game-breaking | Engine enforces supply limits with clear UI feedback |

---

## 10. Success Criteria

- A complete game can be played from setup to scoring without bugs.
- AI makes strategically sound decisions that are not trivially exploitable.
- AI turn completes within 3 seconds (heuristic + minimax) or 6 seconds (with Gemini call).
- AI reasoning log is clear enough that a player can understand why the AI made each decision.
- All game rules from the physical rulebook are correctly enforced.
- Game state persists and can be resumed after page reload.

---

## 11. Future Considerations (Phase 2+)

- **Multiplayer:** Real-time play with a friend via Firebase Realtime Database or Firestore listeners. Lobby/invite system. Turn timer.
- **AI difficulty levels:** Easy (heuristic only, suboptimal weights), Medium (minimax depth 2), Hard (minimax depth 3 + Gemini).
- **Optional setup variant:** Parameter tile rows with bonus triggers (page 17 of rulebook).
- **Statistics dashboard:** Win rate, average score, most-used cards, etc.
- **Replay system:** Step through a completed game move by move.
- **Third map:** If available, add the third map option.
