# Contributing

Thanks for looking at TINYforming Mars. This is a small unofficial fan adaptation. Read [README.md](README.md) first.

AI coding agents should also read [AGENTS.md](AGENTS.md).

## Ground rules

- Match existing TypeScript / React patterns. Do not invent a new design system.
- Game rules: [docs/rulebook.md](docs/rulebook.md) wins. Card text on a side beats generic rulebook wording for that card.
- Keep `src/engine/` pure (no UI, no Firebase).
- One shared board. Do not split maps per player.
- Do not re-enable Gemini on the cloud build unless a maintainer asks.
- Do not commit `.env`, `.env.local`, or secrets.

## Setup

See README **Setup**. Short version:

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

## Pull requests

1. Keep the change small and described.
2. Add or update Vitest coverage when you change engine or AI logic.
3. Run `npm run test:run` and `npm run typecheck` before you open the PR.
4. Use the PR template checklist.

## Issues

Use the GitHub issue templates. Security reports go to [SECURITY.md](SECURITY.md), not public issues.

## License

By contributing you agree your work is licensed under the MIT License (see [LICENSE](LICENSE)).
