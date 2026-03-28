# TINYforming Mars — Task Tracker

**Project Start:** TBD  
**Last Updated:** March 28, 2026

---

## How to Use This Tracker

Each task has a status, priority, and estimated complexity. Update status as you work:
- ⬜ **Todo** — Not started
- 🟡 **In Progress** — Actively working on it
- ✅ **Done** — Completed and tested
- 🔴 **Blocked** — Waiting on another task or decision

**Priority:** P0 = must have, P1 = important, P2 = nice to have  
**Complexity:** S = small (< 2 hrs), M = medium (2–6 hrs), L = large (6+ hrs), XL = multi-day

---

## Phase 0: Verification & Preparation

These tasks must be completed before any coding begins.

| # | Task | Priority | Size | Status | Notes |
|---|---|---|---|---|---|
| 0.1 | **Verify all 28 card sides against physical cards** — Cross-check every card in PRD Section 2.11 against the actual printed cards. Confirm: name, cost, cost reduction formula, tag requirements, parameter requirements, effect text, and 2 bottom tags for each side. Flag any errors. | P0 | M | ⬜ | Uncertain cards: Artificial Lake (Side A requirements), Lava Flows (Side B requirements). Some tag counts may be off due to image quality. |
| 0.2 | **Verify hex layouts for both maps** — Confirm exact positions of all 19 hexes on Tharsis and Elysium: which are water, which are bonus (and what tag), which are empty. Confirm which water hexes have Resource Token icons and which token type. Confirm row assignments (north/center/south) for cards that reference rows. | P0 | M | ⬜ | Row boundaries matter for Ice Cap Melting (southern row) and Solar Power/Windmills (center row adjacency). |
| 0.3 | **Verify Standard Project requirements** — Confirm exact tag requirements for all 5 Standard Projects against the map cards. PRD has current best reading but some tag icons were small in images. | P0 | S | ⬜ | |
| 0.4 | **Set up project repository** — Init React + TypeScript project with Vite. Set up ESLint, Prettier, folder structure matching PRD architecture (`/src/engine/`, `/src/ai/`, `/src/components/`, `/src/firebase/`). | P0 | S | ⬜ | |
| 0.5 | **Set up Firebase project** — Create Firebase project, enable Anonymous Auth, set up Firestore, create placeholder Cloud Function for Gemini. Configure Firebase Hosting. | P0 | S | ⬜ | |
| 0.6 | **Review existing codebase** — Go through last year's code. Identify any reusable components, data structures, or logic. Document what works and what needs rewriting. | P1 | M | ⬜ | May save significant time on hex rendering, card UI, etc. |

---

## Phase 1A: Core Engine (No UI)

Pure TypeScript game logic. Everything testable without any UI.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1A.1 | **Define core type definitions** — `GameState`, `PlayerState`, `HexState`, `CardSide`, `TagType`, `ResourceType`, and all supporting interfaces as specified in PRD Section 5. | P0 | M | ⬜ | 0.1, 0.2 | Foundation for everything else. |
| 1A.2 | **Encode hex grids for Tharsis and Elysium** — Create `maps.ts` with all 19 hex definitions per map: id, row/col position, type (land/water), bonus tag, resource token icon, pre-computed adjacency list, map row (north/center/south). | P0 | L | ⬜ | 0.2 | Adjacency must be verified carefully — this is the foundation for scoring, placement rules, and AI evaluation. |
| 1A.3 | **Encode all 14 project cards (28 sides)** — Create `cards.ts` with structured card data. Each side: name, color, cost, cost reduction, tag requirements, parameter requirements, effect (as typed CardEffect objects), bottom tags. | P0 | L | ⬜ | 0.1 | Must match verified card data from task 0.1. Use the CardEffect union type from PRD Section 5.3. |
| 1A.4 | **Build game initialization** — `gameState.ts`: random map selection (coin flip), random color assignment (coin flip), initial credit distribution (5 each), parameter supply setup, resource token supply setup, deck shuffle. | P0 | M | ⬜ | 1A.1, 1A.2, 1A.3 | |
| 1A.5 | **Build tag counting system** — Function to count a player's available tags from: (a) bottom tags on all 3 project card sides facing them, (b) bonus hex tags from cities on bonus hexes, (c) held resource tokens (spendable as matching tags). This is used everywhere for requirement checking. | P0 | M | ⬜ | 1A.1 | Critical: tags from cards are available whether or not the card is activated. Resource tokens are consumed when spent. |
| 1A.6 | **Build requirement checker** — Given a player and a card/standard project, determine if all requirements are met: credit cost (after reductions), tag requirements (using tag counting system), parameter requirements (heat = both players' personal + map tiles; greenery/water = tiles on map). | P0 | L | ⬜ | 1A.5 | Must handle all cost reduction types from PRD Section 5.3. |
| 1A.7 | **Build legal move generator** — `rules.ts`: for a given game state and player, return all legal actions: activatable project cards, available standard projects, pass. Include placement constraint validation for tile/city placement. | P0 | L | ⬜ | 1A.6 | Used by both UI (to grey out unavailable actions) and AI (to enumerate moves). |
| 1A.8 | **Build action execution — Project Cards** — `actions.ts`: given a legal project card action, mutate game state: deduct credits (place on card), spend resource tokens if used for tags, execute card effect (place tiles, gain heat, gain credits, gain resource tokens, return greenery, etc.). Handle all CardEffect types. | P0 | XL | ⬜ | 1A.7 | This is the biggest task. Each card effect type needs its own execution logic. Composite effects (e.g., Comet: heat + conditional water) need sequential execution. |
| 1A.9 | **Build action execution — Standard Projects** — Execute all 5 standard projects: Sell Patent (gain credit), Build City (place/relocate with all placement rules), Import Water (place water tile), Greenhouses (place greenery tile), Energy Farms (gain heat tile). | P0 | L | ⬜ | 1A.7 | City placement rules: max 2 cities, not on water hex, not adjacent to any city. Relocation follows same rules. |
| 1A.10 | **Build tile placement logic** — Shared function for placing tiles on the map. Handles: hex occupancy check, water hex restriction, placement constraints from cards, resource token gain from water hex icons, water adjacency credit bonus, greenery removal (Ice Asteroid / Asteroid). | P0 | L | ⬜ | 1A.2 | Water placement triggers: resource token gain + credit per adjacent water. These side effects must fire automatically. |
| 1A.11 | **Build income phase** — `income.ts`: for each player (starting player first): +1 credit per city, +1 credit per water tile adjacent to each city (water touching both cities counts for both), add to unspent credits, cap at 5 (return excess to supply). Return all credits from project cards to supply. Discard project cards. | P0 | M | ⬜ | 1A.1 | Credit supply is global (max 10). If supply runs out, player gets what's left. |
| 1A.12 | **Build end-game detection** — Check after each action and after income phase: (a) 2+ of 3 parameter tile types exhausted from supply, (b) no unoccupied hexes remaining on map, (c) generation counter reaches 12. Return which condition triggered. | P0 | M | ⬜ | 1A.1 | Check all three conditions; whichever hits first ends the game. |
| 1A.13 | **Build end-game scoring** — `scoring.ts`: calculate per-city score (greenery adjacency +1, heat adjacency −1), exclusive tile bonuses (greenery/water adjacent to only one player's cities = +1 VP), personal heat supply VP (+1 each). Sum totals. Apply tiebreaker sequence if tied. | P0 | L | ⬜ | 1A.2 | The "adjacent to only one player" check requires examining all hexes adjacent to each tile and checking for city ownership. |
| 1A.14 | **Build generation flow controller** — Orchestrate the full generation cycle: Research Phase → Action Phase (alternating turns until both pass) → Income Phase → End-game check → next Generation or game over. Track start player alternation. | P0 | L | ⬜ | 1A.8, 1A.9, 1A.11, 1A.12 | |
| 1A.15 | **Build Research Phase (card draft) logic** — Draw 3 cards from deck (reshuffle discard if needed). Starting player picks orientation of card 1, second player picks card 2, starting player picks card 3. Assign facing sides to each player. | P0 | M | ⬜ | 1A.4 | This is the logic only — human UI and AI decision-making come later. |
| 1A.16 | **Write unit tests for rules engine** — Cover: legal move generation for various board states, requirement checking with edge cases (exact thresholds, cost reductions to minimum 1), placement constraints for every card, income calculation, scoring with tiebreakers. | P0 | XL | ⬜ | 1A.7–1A.13 | Test every card's activation. Test credit supply exhaustion. Test all end-game conditions. |
| 1A.17 | **Write integration test — full game simulation** — Run a complete game with scripted moves (or random legal moves) from setup to scoring. Verify state consistency at every step. No crashes, no illegal states. | P0 | L | ⬜ | 1A.14, 1A.16 | |

---

## Phase 1B: Basic Playable UI

Get a working game on screen with placeholder AI.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1B.1 | **Build SVG hex board component** — `HexBoard.tsx`: render 19 hexes in correct layout for selected map. Color-code hex types (land, water, bonus). Show bonus tag icons. Support click interaction on hexes. Highlight valid placement targets. | P0 | XL | ⬜ | 1A.2 | Check if last year's hex rendering code is reusable (task 0.6). SVG for crisp scaling. |
| 1B.2 | **Build tile and city rendering on board** — Show placed greenery (green), water (blue), heat (red) tiles on hexes. Show city tokens with player color (white/black). Update dynamically as game state changes. | P0 | L | ⬜ | 1B.1 | |
| 1B.3 | **Build player dashboard component** — `PlayerDashboard.tsx`: display credit count, personal heat tile count, held resource tokens (with icons), current generation number, current phase, player color indicator. | P0 | M | ⬜ | 1A.1 | |
| 1B.4 | **Build card panel component** — `CardPanel.tsx`: display the 3 project card sides facing the human player along the bottom of the screen. Show card name, cost, tags, requirements (met/unmet indicators), effect text, "Activate" button. Fan layout like a hand of cards. | P0 | L | ⬜ | 1A.3 | Grey out cards that can't be activated. Show credit cost after reductions. |
| 1B.5 | **Build Standard Projects compact UI** — `StandardProjects.tsx`: row of 5 icon buttons. Show cost, tooltip with full details on hover. Grey out when requirements not met or already used this Generation. | P0 | M | ⬜ | 1A.9 | |
| 1B.6 | **Build drafting view** — `DraftingView.tsx`: during Research Phase, show drawn card with both sides visible. "Keep this side" / "Give to AI" selection. Card flip animation. Sequence through all 3 card draws with correct player order. | P0 | L | ⬜ | 1A.15 | AI draft choices are random for now (Phase 1C/1E replaces this). |
| 1B.7 | **Build city placement flow** — During setup, highlight valid hexes for city placement. Click to place. Enforce: Black places first, White places second (not adjacent to Black's city). Reuse for Build City standard project and Research Outpost card. | P0 | M | ⬜ | 1B.1, 1A.9 | |
| 1B.8 | **Build tile placement flow** — When a card/project requires placing a tile, highlight valid hexes based on placement constraints. Click to place. Show constraint explanation ("Must be adjacent to a city", "Southern row only", etc.). | P0 | L | ⬜ | 1B.1, 1A.10 | Different cards have different constraints. Reuse the constraint system from the engine. |
| 1B.9 | **Build action phase turn flow UI** — Show whose turn it is. On human turn: enable card/project/pass buttons. On AI turn: show "AI is thinking" placeholder. Alternate turns. Handle passing logic (passed player can't act, other continues). | P0 | L | ⬜ | 1A.14 | |
| 1B.10 | **Build income phase visualization** — Auto-play the income sequence with step-by-step credit changes visible. "+1 City A", "+2 Water tiles", "Capped at 5, returning 3". Cards slide to discard. Brief enough to not bore the player. | P1 | M | ⬜ | 1A.11 | |
| 1B.11 | **Build game over screen** — `GameOverScreen.tsx`: show final score breakdown by category (Cities, Greenery, Water, Heat). Side-by-side comparison. Tiebreaker detail if applicable. Winner announcement. "Play Again" button. | P0 | M | ⬜ | 1A.13 | |
| 1B.12 | **Build setup flow** — Loading screen → map reveal (Tharsis/Elysium) → color assignment → card draft → city placement → game begins. Smooth transitions between steps. | P0 | M | ⬜ | 1B.6, 1B.7, 1A.4 | |
| 1B.13 | **Implement placeholder AI — random legal moves** — AI picks a random legal action on its turn. AI picks random card orientation during drafts. AI places cities/tiles on random valid hexes. Enough to make the game fully playable end-to-end. | P0 | M | ⬜ | 1A.7 | Will be replaced in Phase 1C–1E. |
| 1B.14 | **Build top bar and layout shell** — Overall page layout: top bar with game info, center-left board area, bottom card panel, right-side drawer placeholder. Responsive grid. Dark theme. | P0 | M | ⬜ | | |
| 1B.15 | **Playtest full game loop** — Play 5+ complete games against random AI. Log bugs, UX friction points, rule enforcement errors. Fix critical issues. | P0 | L | ⬜ | All 1B tasks | |

---

## Phase 1C: AI — Heuristic Layer

First real AI intelligence.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1C.1 | **Build heuristic evaluation function** — `heuristic.ts`: implement `evaluate(state, playerId)` using the weight table from PRD Section 4.1. Score: heat supply VP, greenery adjacency, exclusive tile bonuses, heat map penalties, water income value, credits, resource tokens, available moves count. | P0 | L | ⬜ | 1A.13 | Start with PRD weights, tune later. |
| 1C.2 | **Build end-game proximity modifier** — Detect how close the game is to ending (parameter supplies, hex occupancy, generation count). Shift heuristic weights toward direct VP as end-game approaches. Reduce value of income/positional factors. | P1 | M | ⬜ | 1C.1, 1A.12 | |
| 1C.3 | **Replace random AI with heuristic AI** — AI evaluates all legal actions, applies each to a cloned game state, scores the resulting state with the heuristic, and picks the highest-scoring action. | P0 | M | ⬜ | 1C.1, 1A.7 | Need efficient state cloning (deep copy of GameState). |
| 1C.4 | **Heuristic-based draft decisions** — During Research Phase, AI scores each card orientation: evaluate the value of Side A facing AI + Side B facing human, vs Side B facing AI + Side A facing human. Pick the orientation that maximizes the gap. | P0 | M | ⬜ | 1C.1 | Simpler than Gemini but decent for now. |
| 1C.5 | **Heuristic-based tile/city placement** — When the AI needs to choose where to place a tile or city, evaluate all valid hexes using the heuristic and pick the best position. | P0 | M | ⬜ | 1C.1 | Greenery placement especially important — adjacency to own city, exclusivity from opponent. |
| 1C.6 | **Build AI log panel (basic)** — `AILogDrawer.tsx`: collapsible right-side drawer. Shows each AI decision with the action chosen and its heuristic score. Scrollable history. Collapsible per-generation sections. | P0 | L | ⬜ | 1C.3 | |
| 1C.7 | **Build dev-mode weight tuning panel** — Hidden panel (accessible via keyboard shortcut or URL param) that shows all heuristic weights as sliders. Adjust in real-time and see how AI behavior changes. For development use only. | P2 | M | ⬜ | 1C.1 | Extremely helpful for tuning. |
| 1C.8 | **Playtest and tune heuristic weights** — Play 10+ games. Identify dumb AI decisions. Adjust weights. Document what works. | P0 | L | ⬜ | 1C.3 | Ongoing — revisit after minimax is added too. |

---

## Phase 1D: AI — Minimax Layer

AI now looks ahead.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1D.1 | **Build minimax search function** — `minimax.ts`: implement minimax with alpha-beta pruning as specified in PRD Section 4.2. Configurable depth parameter. Returns best action + score. | P0 | L | ⬜ | 1C.1 | |
| 1D.2 | **Build efficient state cloning** — Deep copy of GameState that's fast enough for repeated cloning during minimax search. Consider structural sharing or immutable patterns if performance is an issue. | P0 | M | ⬜ | 1A.1 | Minimax at depth 2 clones state ~50-100 times per decision. Must be fast. |
| 1D.3 | **Build move ordering optimization** — Before minimax explores child nodes, sort legal actions by heuristic score (best first). This maximizes alpha-beta pruning effectiveness and reduces nodes evaluated. | P1 | S | ⬜ | 1D.1, 1C.1 | |
| 1D.4 | **Integrate minimax into AI controller** — `aiController.ts`: during Action Phase, use minimax (depth 2) instead of single-step heuristic evaluation. Fall back to heuristic if minimax takes too long. | P0 | M | ⬜ | 1D.1, 1C.3 | |
| 1D.5 | **Add depth-3 search option** — Test depth 3 performance in browser. If feasible (< 2 seconds), make it the default. If not, keep depth 2 and note for future optimization. | P1 | M | ⬜ | 1D.1 | |
| 1D.6 | **Web Worker offloading (if needed)** — If minimax causes UI jank, move the search to a Web Worker so it runs on a separate thread. Communicate results via postMessage. | P1 | L | ⬜ | 1D.4 | Only needed if depth-2 search causes noticeable UI freeze. |
| 1D.7 | **Enhanced AI logging — evaluation tree** — Update AI log to show the minimax evaluation: list all evaluated actions with scores, show how opponent response adjusts the score, highlight the chosen action. Match the format from PRD Section 4.5. | P0 | M | ⬜ | 1D.4, 1C.6 | |
| 1D.8 | **Playtest minimax AI** — Play 10+ games. Compare AI quality vs heuristic-only. Verify it makes meaningfully better decisions (blocking, long-term planning). Profile performance. | P0 | L | ⬜ | 1D.4 | |

---

## Phase 1E: AI — Gemini Thinking Node

LLM-powered reasoning for complex decisions.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1E.1 | **Build Firebase Cloud Function for Gemini** — HTTP callable function that accepts game state context + decision type, calls Gemini Flash API, returns structured JSON response. Error handling, timeout (5s), rate limiting per user. | P0 | L | ⬜ | 0.5 | Keep API key in Firebase config, never exposed to client. |
| 1E.2 | **Build Gemini prompt templates** — Create prompt templates for: (a) card draft orientation decision, (b) action phase tiebreaker. Include game state serialization format. Specify JSON response schema. Test prompts for consistent structured output. | P0 | L | ⬜ | 1E.1 | Use PRD Section 4.3 prompt structure as starting point. Iterate based on response quality. |
| 1E.3 | **Build thinking node client** — `thinkingNode.ts`: client-side function that calls the Cloud Function, parses the Gemini response, validates the suggested action against legal moves, and returns the decision + reasoning text. | P0 | M | ⬜ | 1E.1 | |
| 1E.4 | **Integrate Gemini into draft decisions** — Replace heuristic draft logic (from 1C.4) with Gemini call during Research Phase. AI sends both card sides + game context, Gemini returns chosen orientation + reasoning. | P0 | M | ⬜ | 1E.3, 1C.4 | Fallback to heuristic if Gemini fails or times out. |
| 1E.5 | **Build tiebreaker logic** — In AI controller, after minimax returns results: if top 2+ actions are within a configurable margin (e.g., 0.5 points), call Gemini to break the tie. Otherwise, trust minimax. | P1 | M | ⬜ | 1E.3, 1D.4 | The margin threshold should be tunable. |
| 1E.6 | **Stream Gemini reasoning to AI log** — When Gemini is called, show a "thinking" state in the log, then stream/display the reasoning text as it arrives. Match the format from PRD Section 4.5 (Gemini-assisted section). | P0 | M | ⬜ | 1E.3, 1C.6 | |
| 1E.7 | **Build Gemini fallback handling** — If Gemini API is unavailable, times out, returns unparseable response, or suggests an illegal move: fall back to heuristic/minimax decision. Log the fallback in the AI log panel. Never crash or stall the game. | P0 | M | ⬜ | 1E.3, 1E.4 | |
| 1E.8 | **Playtest full AI stack** — Play 10+ games with all three AI layers active. Evaluate: Gemini draft reasoning quality, tiebreaker frequency and quality, overall AI strength. Adjust tiebreaker margin and prompt templates. | P0 | L | ⬜ | 1E.4, 1E.5 | |

---

## Phase 1F: Polish

Final refinements for a shippable product.

| # | Task | Priority | Size | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1F.1 | **Add tile placement animations** — Tiles slide or fade onto hexes when placed. City tokens animate on placement/relocation. Heat tiles animate moving to personal supply. Smooth, 0.5–1s duration. | P1 | L | ⬜ | 1B.2 | |
| 1F.2 | **Add card draft animations** — Cards slide in face-down, flip to reveal both sides. After selection, chosen side slides to card panel, other side fades out. AI draft shows flip + brief delay. | P1 | L | ⬜ | 1B.6 | |
| 1F.3 | **Add AI thinking animation** — Subtle pulse or spinner near AI's cities during AI turn. Thinking indicator in log panel header. Deliberate 1-2 second pacing even for instant heuristic decisions. | P1 | M | ⬜ | 1C.6 | Makes AI feel like a real opponent rather than instant computation. |
| 1F.4 | **Firebase auth integration** — Anonymous auth on first visit. Optional email sign-up for cross-device persistence. Login/logout UI. | P1 | M | ⬜ | 0.5 | |
| 1F.5 | **Game save/load with Firestore** — Auto-save game state to Firestore after each action. "Continue Game" on home screen. Game list for users with accounts. Handle stale/corrupted saves gracefully. | P1 | L | ⬜ | 1F.4 | |
| 1F.6 | **Mobile responsive layout** — Board takes full width on mobile. Card panel collapses into bottom sheet. Standard projects in bottom sheet. AI log becomes modal overlay. Phase indicators in compact top bar. | P1 | L | ⬜ | 1B.14 | |
| 1F.7 | **Sound effects (optional)** — Tile placement sounds, card flip sounds, credit gain/loss sounds, AI turn notification, end-game fanfare. Mute toggle. | P2 | M | ⬜ | | |
| 1F.8 | **Home screen** — Title, "New Game" button, "Continue Game" (if save exists), brief rules summary or tutorial link. Clean, thematic design. | P1 | M | ⬜ | | |
| 1F.9 | **Tutorial / rules reference** — In-game rules reference accessible via help button. Not a full tutorial — just a quick reference for key rules (scoring, standard projects, tag sources). | P2 | M | ⬜ | | |
| 1F.10 | **Bug bash and edge case fixes** — Dedicated pass through all known edge cases: credit supply exhaustion, deck reshuffle, all hexes occupied, parameter exhaustion mid-turn, Research Outpost city relocation, Ice Asteroid/Asteroid greenery destruction, Protected Valley (greenery on water hex). | P0 | XL | ⬜ | All prior phases | |
| 1F.11 | **Performance audit** — Profile React renders, minimax execution time, Firestore read/write frequency. Optimize bottlenecks. Ensure AI turn < 3s (heuristic+minimax) or < 6s (with Gemini). | P1 | M | ⬜ | All prior phases | |
| 1F.12 | **Deploy to Firebase Hosting** — Production build, deploy, configure custom domain if desired. Verify Cloud Function works in production. | P0 | S | ⬜ | All prior phases | |

---

## Summary

| Phase | Task Count | P0 Tasks | Estimated Total Effort |
|---|---|---|---|
| Phase 0: Verification | 6 | 5 | 1–2 days |
| Phase 1A: Core Engine | 17 | 17 | 2–3 weeks |
| Phase 1B: Basic UI | 15 | 13 | 2–3 weeks |
| Phase 1C: Heuristic AI | 8 | 5 | 1 week |
| Phase 1D: Minimax AI | 8 | 5 | 1–1.5 weeks |
| Phase 1E: Gemini Thinking Node | 8 | 6 | 1–1.5 weeks |
| Phase 1F: Polish | 12 | 3 | 1–2 weeks |
| **Total** | **74** | **54** | **~9–13 weeks** |

---

## Quick Reference — Dependency Chain

```
Phase 0 (Verify cards + maps + setup)
   │
   ▼
Phase 1A (Core engine + tests)
   │
   ├──▶ Phase 1B (Playable UI with random AI)
   │       │
   │       ▼
   │    Phase 1C (Heuristic AI)
   │       │
   │       ▼
   │    Phase 1D (Minimax AI)
   │       │
   │       ▼
   │    Phase 1E (Gemini Thinking Node)
   │
   └──────────────────────▶ Phase 1F (Polish — can start partially in parallel)
```

Phase 1F tasks like animations (1F.1–1F.3) can begin as soon as the relevant UI components exist from Phase 1B. Auth and persistence (1F.4–1F.5) can be built in parallel with AI phases. The bug bash (1F.10) should wait until all game logic is complete.
