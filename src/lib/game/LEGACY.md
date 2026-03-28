# LEGACY — Do Not Import

These files are from the previous (broken) implementation. Kept as reference for card data and map hex positions during Phase 1A development.

**Do NOT import from these files in new code.** Use `/src/engine/` instead.

## Known issues with this code:
- **Per-player board architecture** — each Player has a `map` field (should be a single shared board)
- **Card effects are plain text** — not executable CardEffect objects
- **Standard project actions are stubs** — return unchanged state
- **No income phase, scoring, or end-game logic**

Will be removed once Phase 1A (src/engine/) is complete.
