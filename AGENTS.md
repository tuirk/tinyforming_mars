# AGENTS.md

Instructions for AI coding agents in this repository.
Player-facing overview and setup: [README.md](README.md).

## Who is asking

Do not assume every human is a brownfield contributor.

**Player / curious visitor** (how do I play, guest mode, rules, AI difficulty, clone to try the game):
- Answer from [README.md](README.md) first (Play, How the AI works, Setup).
- For rules questions, use [docs/rulebook.md](docs/rulebook.md).
- Prefer playable guidance over architecture, PRD, or refactors.
- Do not push `npm` / Firebase setup unless they want to run or change code.

**Developer / contributor** (bugs, features, PRs, engine/AI/UI work):
- Use the rest of this file.
- Prefer small, verified changes. Match existing patterns.

If intent is mixed, lead with the player answer, then offer the engineering path.

## Project (developers)

Digital adaptation of Michael Bevilacqua’s TINYforming Mars (print-and-play).
Next.js 15 App Router + React + TypeScript + Tailwind/Shadcn + Firebase Auth/Firestore.
Pure rules engine: `src/engine`. Opponent AI: `src/ai` (heuristic, minimax, optional Gemini).

## Source of truth (rules)

1. [docs/rulebook.md](docs/rulebook.md) (also mirrored for the app at `src/assets/rulebook.md`)
2. Existing engine code and tests under `src/engine`

Internal files under `docs/` (PRD, tasks, blueprint, verify-*) may be local-only / gitignored. Use them when present on disk; do not require them for public clones. Card text on a side beats generic rulebook wording for that card.

## Hard game invariants

- One shared board for both players.
- Global credit supply (max 10). Sell Patent is illegal when supply is empty.
- Setup: 5 credits each; parameter tiles H11 / G7 / W4 and tokens N2 / P1 / S1 start in shared supply only.
- Tags are always available from card sides facing you (activated or not).
- Resource tokens are consumed when spent as tags.
- Heat parameter = both players’ personal heat + heat tiles on the map.
- Only Lava Flows places heat on the map. Map heat scores −1 per adjacent city.
- Cost reduction minimum is 1 for cards with `costReduction` / `*`.
- End game (after a generation): ≥2 parameter supplies empty, or no empty hexes, or generation 12.

## Commands

```bash
npm install
npm run dev            # http://localhost:3000
npm run build
npm run typecheck
npm run lint
npm run test           # Vitest watch
npm run test:run       # single run
npm run test:coverage
npm run genkit:dev     # local Gemini / Genkit (needs GOOGLE_GENAI_API_KEY)
```

Prefer scoped Vitest when editing one area: `npx vitest run src/engine`.

## Layout (where to edit)

- `src/engine/` — rules, state, cards, maps, scoring. Keep pure.
- `src/ai/` — heuristic, minimax, controller, Genkit flows.
- `src/components/game/` — board UI, setup, drafting, HUD.
- `src/lib/firebase/` — Auth, Firestore, user docs.
- `docs/rulebook.md` — public rules reference.

Path alias: `@/*` → `src/*`.

## Conventions

- Use Immer for game-state mutations in the engine path that already uses it.
- Match existing UI patterns (Mars ochre / Orbitron headings / Inter body). Do not invent a new design system.
- Gemini opponent mode is disabled on the cloud build; do not re-enable without an explicit ask.
- Do not commit `.env`, `.env.local`, or secrets. Use `.env.example` only as the template.
- License is MIT. Do not relicense without an explicit ask.
- Global npm often has `ignore-scripts=true`. Do not disable it without approval; use `npm rebuild` if a package needs scripts.
- Never install axios `1.14.1` / `0.30.4`, or `plain-crypto-js`.

## Do / don’t

**Do**

- Detect player vs developer intent before dumping repo architecture.
- Verify rule claims against the rulebook and engine tests before changing behavior.
- Add or update Vitest coverage when changing engine or AI logic.
- Keep human-vs-AI state client-side unless the task is explicitly about persistence.

**Don’t**

- Treat every chat as a brownfield engineering session.
- Split the board into per-player maps.
- Put personal heat on the map except via Lava Flows.
- Expand README/AGENTS with marketing fluff or unverified numbers.

## Further reading

- Humans (play + setup): [README.md](README.md)
- Format: https://agents.md/
