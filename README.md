# TINYforming Mars

TINYforming Mars is a light Eurogame inspired by Terraforming Mars, designed by Michael Bevilacqua and published as a print-and-play. This repo is a digital adaptation of the game by Tuirk based on the official game materials.

In TINYforming Mars you and your opponent share one Mars map. Over a series of generations you draft project cards, spend a scarce credit supply, place cities, and raise Heat, Greenery, and Water. When the game ends, victory points come from how you shaped the board: greenery next to your cities, water income over time, personal heat, and a few nasty surprises like heat tiles sitting on the map next to somebody’s city.

Original materials and community discussion: [BoardGameGeek](https://boardgamegeek.com/boardgame/282493/tinyforming-mars).

I built this so my friends and I always have a complete, playable adaptation. Solo and two-player modes are on the backlog. This project is not affiliated with Michael Bevilacqua, FryxGames, Stronghold Games, or Terraforming Mars. It is a non-commercial fan adaptation.

## Play

1. Open the app. You do not need to create an account: use **Play as guest**, or sign in with Google / email if you prefer. Guest and new accounts need to accept Terms and Privacy first.
2. On the dashboard, start **Player vs AI** (Solo and Play with a Friend are coming soon).
3. Setup is automatic: the app picks a map (Tharsis or Elysium) and your color (Black or White), then you confirm the reveal screens. Per the rules, Black places the first city, then White places theirs (not adjacent). You place when it is your color; the AI places when it is theirs.
4. Each generation: draft project cards, then take turns in the action phase (play a project, use a standard project, or pass) until both sides have passed. Income runs, then the next generation starts. White leads odd generations; Black leads even ones.
5. The game ends after a generation when at least two of the three parameter supplies (Heat, Greenery, Water) are empty, the map has no empty hexes, or generation 12 is reached, whichever comes first. Then you get the score breakdown.

Opponent AI defaults to Minimax; you can change mode in the AI panel during the game (Gemini is off on the cloud build).

Leaving mid-game discards progress. Matches are not saved.

## How the AI works

Opponent modes are classical game AI. Default is **Minimax**.

- **Minimax** searches ahead a few plies with alpha-beta pruning. At the leaves it uses the same board evaluation as heuristic mode (personal heat, greenery adjacency, water, map heat next to cities, credits, tokens, etc.). Moves are ordered by a quick eval so pruning cuts more. Search depth in the app is currently 2 plies.
- **Heuristic** scores each legal action with that evaluation function and picks a strong one (no lookahead).
- **Random** picks a legal action at random.
- **LLM (Gemini)** is optional: Minimax proposes candidates, then Gemini re-ranks them. It is not the main path and is disabled on the cloud build. Clone the repo, set `GOOGLE_GENAI_API_KEY`, and turn Gemini on locally if you want it.

## Setup

This app is built as a **Firebase** project today (Auth + Firestore for accounts, including guest). There is no Firebase-free UI path yet. You need a Firebase web app and the vars in `.env.example` to run the full client locally.

The game rules engine under `src/engine` and the Vitest suite do **not** need Firebase:

```bash
git clone https://github.com/tuirk/tinyforming_mars.git
cd tinyforming_mars
npm install
npm run test:run
npm run typecheck
```

To run the playable app, copy env and fill it in:

```bash
cp .env.example .env.local
```

Fill `.env.local` from `.env.example`:

- `NEXT_PUBLIC_FIREBASE_*` — Firebase web app config
- `GOOGLE_GENAI_API_KEY` — only needed for Gemini mode (`npm run genkit:dev` / local LLM path)

Enable Anonymous Auth (and whatever other providers you use) in the Firebase console. Point Firestore at the same project.

```bash
npm run dev          # app at http://localhost:3000
npm run test:run     # Vitest once
npm run typecheck
npm run build
```

Useful scripts: `npm run lint`, `npm run test` (watch), `npm run genkit:dev` (LLM flow server).

Do not commit `.env` / `.env.local`. Keep secrets outside the repo when you can.

`package.json` has `"private": true`. That only tells npm not to publish this app as a package. It is not about GitHub visibility. This repo can stay private or go public independently of that flag.

## License

MIT. See [LICENSE](LICENSE). Contributions are under the same license ([CONTRIBUTING.md](CONTRIBUTING.md)).

## For coding agents

AI coding agents should read [AGENTS.md](AGENTS.md) for build/test commands, rule invariants, and edit boundaries. It follows the [AGENTS.md](https://agents.md/) open format and complements this README.

## Credits

- Original game: [Michael Bevilacqua](https://boardgamegeek.com/boardgame/282493/tinyforming-mars) (BoardGameGeek)
- Digital adaptation: Tuirk

See also [AUTHORS](AUTHORS), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
