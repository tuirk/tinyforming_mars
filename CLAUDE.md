# TINYforming Mars

## Project Overview
A 2-player (human vs AI) board game web app based on Terraforming Mars mechanics. Currently being rebuilt from a flawed prior codebase.

## Source of Truth
- **PRD:** [docs/prd.md](docs/prd.md) — Complete game rules, all 28 card sides, both map layouts, AI architecture, data models, UI specs
- **Task Tracker:** [docs/tasks.md](docs/tasks.md) — 74 tasks across 7 phases with dependency chains
- Always defer to these documents over existing code.

## Critical Game Rules
- **SINGLE SHARED BOARD** — both players place cities and tiles on the same hex map. The old code incorrectly used separate boards per player.
- Game engine must be written fresh based on PRD data models — do not adapt old broken logic.
- UI components from the old code may be reusable — check existing before writing from scratch.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Shadcn UI (Radix primitives)
- **Backend:** Firebase (App Hosting, Firestore)
- **AI:** Google Genkit with Gemini 2.5 Flash
- **State:** Immer for immutable updates
- **CLI Tools Available:** Firebase CLI, GitHub CLI (gh). No gcloud CLI.

## Project Structure
```
src/
├── engine/          # Pure game logic (no UI, no Firebase)
│   ├── types.ts     # GameState, PlayerState, HexState, CardSide, CardEffect, etc.
│   ├── gameState.ts # State initialization and management
│   ├── rules.ts     # Legal move validation, requirement checking
│   ├── actions.ts   # Action execution (projects, standard projects)
│   ├── income.ts    # Income phase calculation
│   ├── scoring.ts   # End-game scoring with tiebreakers
│   ├── cards.ts     # All 14 cards (28 sides) as structured data
│   ├── maps.ts      # Hex grids for Tharsis and Elysium
│   └── index.ts     # Barrel exports
├── ai/              # AI decision engine
│   ├── flows/       # Genkit LLM flows (Gemini thinking node)
│   ├── genkit.ts    # Genkit configuration
│   ├── heuristic.ts # Board evaluation function (PRD Section 4.1)
│   ├── minimax.ts   # Minimax with alpha-beta pruning (PRD Section 4.2)
│   ├── aiController.ts  # AI decision router (PRD Section 4.4)
│   └── aiLogger.ts  # AI reasoning log structure
├── app/             # Next.js App Router pages and server actions
├── assets/          # Rulebook markdown
├── components/
│   ├── game/        # Game-specific UI components (hex grid, cards, panels)
│   └── ui/          # Shadcn UI library (29+ components)
├── firebase/        # Firebase integration
│   ├── config.ts    # App initialization
│   ├── auth.ts      # Anonymous + email auth
│   └── gameStore.ts # Firestore game persistence
├── hooks/           # Custom React hooks
├── lib/game/        # [LEGACY] Old game logic — reference only, do not import
└── services/        # Backend services (rulebook reader)
```

## Development
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run genkit:dev   # Genkit AI dev server
npm run test         # Vitest watch mode
npm run test:run     # Single run
npm run test:coverage # Coverage report
```

## Conventions
- Path alias: `@/*` maps to `src/*`
- Dark theme with Space Grotesk (headings) + Inter (body)
- Colors: Primary blue HSL(210,60%,50%), Background dark HSL(210,20%,20%), Accent cyan HSL(180,50%,50%)
- Use Immer for all game state mutations
- Follow task tracker phases in order (Phase 0 → 1A → 1B → ...)

## What's Reusable from Old Code
- Hex board SVG rendering (geometry is correct, needs shared-board adaptation)
- Card UI components and dark theme styling
- React component structure and routing
- Shadcn UI component library
- Firebase configuration

## What Needs Rewriting
- Game engine (state, actions, income phase, scoring) — write fresh from PRD
- Board logic — must be single shared board, not per-player
- AI decision-making — needs proper system prompts and strategy
