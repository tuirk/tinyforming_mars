# TINYforming Mars

TINYforming Mars is a light Eurogame inspired by Terraforming Mars, designed by Michael Bevilacqua and published as a print-and-play. This repo is a digital adaptation of the game by Tuirk based on the official game materials.

In TINYforming Mars you and your (AI for now, 2p coming soon) opponent share one Mars map. Over a series of generations you draft project cards, spend a scarce credit supply, place cities, and raise Heat, Greenery, and Water. When the game ends, victory points come from how you shaped the board: greenery next to your cities, water income over time, personal heat, and a few nasty surprises like heat tiles sitting on the map next to somebody’s city.

Original materials and community discussion: [BoardGameGeek](https://boardgamegeek.com/boardgame/282493/tinyforming-mars).

This is a non-commercial fan project. It is not affiliated with Michael Bevilacqua, FryxGames, Stronghold Games, or Terraforming Mars. Solo and two-player human modes are not in yet.

Pick one path:

1. [Play in the browser](#play-in-the-browser) (no install)
2. [Run locally](#run-locally) (your machine, your Firebase project)
3. [Develop](#develop) (engine, AI, UI)

## Play in the browser

Open **[https://tinyformingmars.web.app](https://tinyformingmars.web.app)**.

No account required. Tick Terms and Privacy, then **Play as guest**. Google or email sign-in is optional.

1. Dashboard: start **Player vs AI**.
2. The app picks a map (Tharsis or Elysium) and your color (Black or White). Black places the first city, then White (not adjacent). You place for your color; the AI places for theirs.
3. Each generation: draft, then take actions (project, standard project, or pass) until both pass. Income, then the next generation. White leads odd generations; Black leads even ones.
4. The game ends after a generation when at least two parameter supplies (Heat, Greenery, Water) are empty, the map has no empty hexes, or generation 12 is reached. Then you get the score breakdown.

Default opponent is Minimax (2-ply). You can switch to Heuristic or Random in the AI panel. Gemini is off on the hosted build.

Leaving mid-game discards the match. Games are not saved.

## How the AI works

Opponent modes are classical game AI. Default is **Minimax**.

- **Minimax** searches ahead a few plies with alpha-beta pruning. At the leaves it uses the same board evaluation as heuristic mode (personal heat, greenery adjacency, water, map heat next to cities, credits, tokens, etc.). Moves are ordered by a quick eval so pruning cuts more. Search depth in the app is currently 2 plies.
- **Heuristic** scores each legal action with that evaluation function and picks a strong one (no lookahead).
- **Random** picks a legal action at random.
- **LLM (Gemini)** is optional: Minimax proposes candidates, then Gemini re-ranks them. It is not the main path and is disabled on the cloud build. Clone the repo, set `GOOGLE_GENAI_API_KEY`, and turn Gemini on locally if you want it.

## Run locally

Same app as the hosted site, on `http://localhost:3000`. You need Node.js, npm, and your own Firebase project (Auth + Firestore). There is no Firebase-free UI.

```bash
git clone https://github.com/tuirk/tinyforming_mars.git
cd tinyforming_mars
npm install
```

Copy `.env.example` to `.env.local` and fill the `NEXT_PUBLIC_FIREBASE_*` values from Firebase Console → Project settings → Your apps → Web.

In that Firebase project:

- Authentication: enable **Anonymous** (required for Play as guest). Enable Google / email if you want those buttons.
- Firestore: create a database. Deploy this repo’s rules (`firestore.rules`) or paste them in the console. Guest play creates a `users/{uid}` doc; without those rules, guest sign-in will bounce back to the landing page.
- Authentication → Settings → Authorized domains: add `localhost`.

```bash
npm run dev
```

Open http://localhost:3000 and play as on the hosted app.

Do not commit `.env.local`. `GOOGLE_GENAI_API_KEY` is only for local Gemini. App Check keys are optional.

If `npm install` fails on a package that needs postinstall scripts, run `npm rebuild`. Do not turn off `ignore-scripts` unless you mean to.

## Develop

Rules live in `src/engine` (pure TypeScript, no UI, no Firebase). Opponent AI is `src/ai`. The Next.js app is `src/app` and `src/components`. Firebase helpers are `src/lib/firebase`. Path alias `@/*` → `src/*`.

Engine tests do not need Firebase or a running app:

```bash
npm run test:run
npm run typecheck
```

While changing code:

```bash
npm run test          # Vitest watch
npx vitest run src/engine
npm run lint
npm run build
```

Optional Gemini opponent: set `GOOGLE_GENAI_API_KEY`, run `npm run genkit:dev`, and turn Gemini on in the local AI panel. Leave it off for the hosted app.

Coding agents: [AGENTS.md](AGENTS.md). Humans: this README, plus [docs/rulebook.md](docs/rulebook.md) for rules.

This repo is not accepting public issues or pull requests ([CONTRIBUTING.md](CONTRIBUTING.md)). Forks are fine under MIT.

## License

MIT. See [LICENSE](LICENSE).

## Credits

- Original game: [Michael Bevilacqua](https://boardgamegeek.com/boardgame/282493/tinyforming-mars)
- Digital adaptation: [Tuirk](https://github.com/tuirk)

See [AUTHORS](AUTHORS), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
