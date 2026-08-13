# Contributing

This project is **not accepting public contributions** (issues and pull requests from people who are not collaborators).

It is an unofficial fan adaptation I built for myself and friends. GitHub pull request creation is restricted to collaborators. Security reports still go through [SECURITY.md](SECURITY.md).

If you forked the code, that is fine under the MIT license. Please do not open a PR expecting a review.

---

The rest of this file is for the maintainer (and any collaborator who is later invited).

AI coding agents should also read [AGENTS.md](AGENTS.md) and [README.md](README.md).

## Ground rules

- Match existing TypeScript / React patterns. Do not invent a new design system.
- Game rules: [docs/rulebook.md](docs/rulebook.md) wins. Card text on a side beats generic rulebook wording for that card.
- Keep `src/engine/` pure (no UI, no Firebase).
- One shared board. Do not split maps per player.
- Do not re-enable Gemini on the cloud build unless a maintainer asks.
- Do not commit `.env`, `.env.local`, or secrets.

## Setup

See README **Run locally** and **Develop**. Short version:

```bash
npm install
cp .env.example .env.local   # fill Firebase vars to run the UI
npm run test:run
npm run typecheck
```

The engine and tests do not need Firebase. The playable app does.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run test:run
npm run typecheck
npm run lint
npm run build
npx vitest run src/engine   # scoped tests
```

If `npm install` fails because a package needs postinstall scripts, use `npm rebuild` after install. Do not disable `ignore-scripts` without asking.

Never install axios `1.14.1` / `0.30.4`, or `plain-crypto-js`.

## License

Code in this repository is under the MIT License (see [LICENSE](LICENSE)).
