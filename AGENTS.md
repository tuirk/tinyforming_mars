# AGENTS.md

Unofficial TINYforming Mars client. Humans play and set up from [README.md](README.md). Rules: [docs/rulebook.md](docs/rulebook.md) (mirrored at `src/assets/rulebook.md`). Card text on a side beats the rulebook for that card.

If they only want to play, send them to https://tinyformingmars.web.app or README **Play in the browser**. Do not start a Firebase/npm lecture.

## Where to edit

| Path | What |
| --- | --- |
| `src/engine/` | Rules, state, cards, maps, scoring. Keep pure (no UI, no Firebase). Use Immer where that path already does. |
| `src/ai/` | Heuristic, minimax, controller, Genkit flows. |
| `src/components/game/` | Board, setup, draft, HUD. Match existing Mars ochre / Orbitron / Inter. |
| `src/lib/firebase/` | Auth, Firestore, user docs. |

`@/*` → `src/*`. Internal `docs/prd.md`, `docs/tasks.md`, `docs/verify-*.md`, `CLAUDE.md` may exist locally and be gitignored. Use them if present; do not require them.

## Rules you will break if you ignore them

- One shared board. Never split maps per player.
- Global credit supply, max 10. Sell Patent is illegal when supply is empty.
- Setup: 5 credits each. Parameter tiles H11 / G7 / W4 and tokens N2 / P1 / S1 start in shared supply only.
- Tags count from card sides facing you, activated or not.
- Spending a resource token as a tag consumes it.
- Heat parameter = both players’ personal heat + heat tiles on the map.
- Only Lava Flows places heat on the map. Map heat scores −1 per adjacent city.
- `costReduction` / `*` never drops a card cost below 1.
- Game ends after a generation when ≥2 parameter supplies are empty, or no empty hexes, or generation 12.

Human-vs-AI match state stays client-side unless the task is persistence.

## Commands

```bash
npm run dev
npm run test:run
npx vitest run src/engine    # prefer this when touching rules
npm run typecheck
npm run lint
npm run build
```

Change engine or AI logic → add or update Vitest coverage. Verify rule claims against the rulebook and existing engine tests before changing behavior.

## Don’t

- Commit `.env`, `.env.local`, or secrets. Template is `.env.example`.
- Re-enable Gemini on the hosted/cloud build unless asked. Gemini server actions need a Google/email Firebase ID token, not guest.
- Relicense. MIT stays.
- Disable npm `ignore-scripts`. If install needs a postinstall, `npm rebuild`.
- Install axios `1.14.1` / `0.30.4`, or `plain-crypto-js`.
- Pad README or this file with marketing or unverified numbers.
