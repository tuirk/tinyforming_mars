import type { Locator, Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Observe-then-act driver for a full human-vs-AI game.
 *
 * Every iteration asks "what is on screen right now?" and takes exactly one
 * step, so it cannot desync from the app. It has to cope with a random map and
 * colour roll (createInitialState) and a coin flip over who leads generation 1,
 * neither of which is knowable in advance.
 *
 * The AI side needs no help at all: GameScreen fires it from a useEffect on a
 * 1500 ms timer, and the income phase and AI drafting auto-advance. Only the
 * human side is driven here.
 */

type Action =
  | {
      type: 'activate_project';
      cardId: number;
      side: 'A' | 'B';
      targetHexId?: number;
      fromHexId?: number;
      secondaryTargetHexId?: number;
      chosenResourceToken?: 'nature' | 'production' | 'science';
      optionalSpend?: boolean;
    }
  | { type: 'standard_project'; projectId: string; targetHexId?: number; fromHexId?: number }
  | { type: 'pass' };

interface GameSnapshot {
  setupStep: string;
  phase: string;
  generation: number;
  humanColor: string;
  humanPassed: boolean;
  aiPassed: boolean;
  endCondition: string | null;
  winner: string | null;
  placementActive: boolean;
  placementPrompt: string | null;
  placementValidHexIds: number[];
  aiTurnCount: number;
  lastAiDecision: Action | null;
}

export interface TurnLogEntry {
  at: string;
  generation: number;
  phase: string;
  actor: 'human' | 'ai' | 'system';
  note: string;
  action?: Action;
}

export interface DriverOptions {
  runDir: string;
  /** Tutorial tips to read on camera before skipping the rest. */
  tutorialTipsToShow?: number;
  /** Hard stop for the whole game, in ms. */
  budgetMs?: number;
  captureFrames?: boolean;
}

const TOKENS = ['nature', 'production', 'science'] as const;

export class GameDriver {
  private readonly page: Page;
  private readonly opts: Required<DriverOptions>;
  private readonly log: TurnLogEntry[] = [];
  private tipsShown = 0;
  private frameSeq = 0;
  private lastPhase = '';
  private lastGeneration = 0;
  private lastNote = '';
  private seenAiTurns = 0;
  private pendingAction: Action | null = null;
  private repeatCount = 0;

  constructor(page: Page, opts: DriverOptions) {
    this.page = page;
    this.opts = {
      tutorialTipsToShow: 3,
      budgetMs: 20 * 60 * 1000,
      captureFrames: true,
      ...opts,
    };
    mkdirSync(join(this.opts.runDir, 'frames'), { recursive: true });
  }

  // ----------------------------------------------------------------
  // Bridge reads (window.__tf, published by src/dev/demoBridge.ts)
  // ----------------------------------------------------------------

  private game(): Promise<GameSnapshot | null> {
    return this.page.evaluate(() => {
      const g = (window as any).__tf?.game;
      if (!g) return null;
      return {
        setupStep: g.setupStep,
        phase: g.phase,
        generation: g.generation,
        humanColor: g.humanColor,
        humanPassed: g.humanPassed,
        aiPassed: g.aiPassed,
        endCondition: g.endCondition,
        winner: g.winner,
        placementActive: !!g.placementActive,
        placementPrompt: g.placementPrompt ?? null,
        placementValidHexIds: g.placementValidHexIds ?? [],
        aiTurnCount: g.aiTurnCount ?? 0,
        lastAiDecision: g.lastAiDecision ?? null,
      };
    });
  }

  private suggestAction(): Promise<Action | null> {
    return this.page.evaluate(() => (window as any).__tf?.game?.suggestAction?.() ?? null);
  }

  private suggestCityHex(): Promise<number | null> {
    return this.page.evaluate(() => (window as any).__tf?.game?.suggestCityHex?.() ?? null);
  }

  private draftState(): Promise<{ isHumanTurn: boolean; isAIThinking: boolean; cardId: number | null } | null> {
    return this.page.evaluate(() => {
      const d = (window as any).__tf?.draft;
      if (!d) return null;
      return { isHumanTurn: d.isHumanTurn, isAIThinking: d.isAIThinking, cardId: d.cardId };
    });
  }

  private suggestDraftSide(): Promise<'A' | 'B'> {
    return this.page.evaluate(() => (window as any).__tf?.draft?.suggestSide?.() ?? 'A');
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  private visible(testId: string, timeout = 400): Promise<boolean> {
    return this.page
      .getByTestId(testId)
      .first()
      .isVisible({ timeout })
      .catch(() => false);
  }

  /**
   * Visible AND enabled. Several buttons stay mounted but disabled while work is
   * in flight — the guest button during Firebase sign-in, for one — and clicking
   * one of those just burns the action timeout.
   */
  private async clickable(testId: string): Promise<boolean> {
    const loc = this.page.getByTestId(testId).first();
    if (!(await loc.isVisible().catch(() => false))) return false;
    return loc.isEnabled().catch(() => false);
  }

  /**
   * One-line description of what is on screen, for diagnosing a stall. A wedge
   * that reports "landing page, guest button disabled" is far cheaper to fix
   * than one that just times out.
   */
  private async describeScreen(): Promise<string> {
    const g = await this.game().catch(() => null);
    const marks: string[] = [];
    for (const id of [
      'tutorial-step',
      'play-as-guest',
      'mode-human-vs-ai',
      'setup-continue',
      'draft-A',
      'pass',
      'placement-prompt',
      'income',
      'game-over',
    ]) {
      if (await this.visible(id, 100)) {
        marks.push(`${id}${(await this.clickable(id)) ? '' : '(disabled)'}`);
      }
    }
    const state = g
      ? `phase=${g.phase} gen=${g.generation} setup=${g.setupStep} humanPassed=${g.humanPassed} aiPassed=${g.aiPassed}`
      : 'no __tf bridge (demo flag not set, or GameScreen not mounted)';
    return `${state} | visible: ${marks.join(', ') || 'none'}`;
  }

  /** Poll until a control is visible and enabled, e.g. after ticking a gate checkbox. */
  private async waitUntilClickable(testId: string, timeout: number): Promise<boolean> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.clickable(testId)) return true;
      await this.page.waitForTimeout(100);
    }
    return false;
  }

  /**
   * Wait for the setup state machine to move on.
   *
   * Not awaitGone('setup-continue'): MapRevealScreen and ColorAssignmentScreen
   * both render that testid, so a fresh button mounts the instant the old one
   * unmounts and the detach never fires — which silently burned the full
   * timeout as 20+ seconds of frozen video.
   */
  private async awaitSetupStepChange(from: string | null, timeout = 20_000): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const g = await this.game();
      if (!g || g.setupStep !== from) return;
      await this.page.waitForTimeout(100);
    }
  }

  /** Wait for a control to leave the DOM after clicking it, so we never click twice. */
  private async awaitGone(testId: string, timeout = 60_000): Promise<void> {
    await this.page
      .getByTestId(testId)
      .first()
      .waitFor({ state: 'detached', timeout })
      .catch(() => undefined);
  }

  /**
   * Click with the mouse visibly travelling to the target first. `locator.click()`
   * teleports the pointer in one mousemove, which makes the synthetic cursor jump
   * between frames; interpolating the move makes the recording readable.
   */
  private async humanClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 15_000 });
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    const box = await locator.boundingBox().catch(() => null);
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 22 });
      await this.page.waitForTimeout(140);
    }
    await locator.click({ timeout: 15_000 });
  }

  private byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  private async clickHex(hexId: number, why: string): Promise<void> {
    // The hex is a bare <g> wrapping the polygon and its decorations; clicking
    // the group centre lands on the polygon.
    await this.humanClick(this.byTestId(`hex-${hexId}`));
    this.record('human', `${why} -> hex ${hexId}`);
  }

  private record(actor: TurnLogEntry['actor'], note: string, action?: Action): void {
    // Clicking a button that never advances the app (a failed guest sign-in, say)
    // still counts as "did something", so guard against spinning on it forever.
    if (note === this.lastNote) {
      if (++this.repeatCount >= 8) {
        throw new Error(`Driver repeated "${note}" ${this.repeatCount}x without progress — stuck`);
      }
    } else {
      this.lastNote = note;
      this.repeatCount = 1;
    }

    this.log.push({
      at: new Date().toISOString(),
      generation: this.lastGeneration,
      phase: this.lastPhase,
      actor,
      note,
      action,
    });
    // eslint-disable-next-line no-console
    console.log(`[gen ${this.lastGeneration} ${this.lastPhase}] ${actor}: ${note}`);
  }

  private async frame(label: string): Promise<void> {
    if (!this.opts.captureFrames) return;
    const n = String(++this.frameSeq).padStart(3, '0');
    const safe = label.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40);
    await this.page
      .screenshot({ path: join(this.opts.runDir, 'frames', `${n}-gen${this.lastGeneration}-${safe}.png`) })
      .catch(() => undefined);
  }

  flushLog(): void {
    writeFileSync(join(this.opts.runDir, 'turnlog.json'), JSON.stringify(this.log, null, 2), 'utf8');
  }

  get entries(): TurnLogEntry[] {
    return this.log;
  }

  // ----------------------------------------------------------------
  // Multi-step prompt resolution
  // ----------------------------------------------------------------

  /**
   * After an Activate / standard-project click the app may ask follow-up
   * questions: an optional-extra confirm dialog, one or two hex placements, and
   * a resource-token choice. getLegalActions already enumerates every variant,
   * so the chosen action carries the answer to each of them.
   */
  private async resolvePrompts(action: Action): Promise<void> {
    const a = action as Extract<Action, { type: 'activate_project' }>;

    // Generous cap: a dialog closing, then two placements, then a token pick is
    // already six, and animating-out frames can cost an iteration each.
    for (let step = 0; step < 16; step++) {
      // Let React commit the click before deciding what is on screen.
      await this.page.waitForTimeout(120);

      if (await this.visible('confirm-yes')) {
        const title = (await this.page.locator('[role="dialog"] h2, [role="dialog"] [id$="-title"]').first().textContent().catch(() => '')) ?? '';
        // GameScreen clears `confirmDialog` before Radix finishes its exit
        // animation, so a dialog that is on its way out still reports visible
        // but with an empty title. Answering that one clicks a button that is
        // already unmounting.
        if (!title.trim()) {
          await this.page.waitForTimeout(150);
          continue;
        }
        const yes =
          /Place water\?/i.test(title) ? a.targetHexId != null
          : /Extra heat\?/i.test(title) ? a.optionalSpend === true
          : /Return greenery\?/i.test(title) ? a.secondaryTargetHexId != null
          : false;
        const target = yes ? 'confirm-yes' : 'confirm-no';
        if (!(await this.clickable(target))) {
          await this.page.waitForTimeout(150);
          continue;
        }
        await this.humanClick(this.byTestId(target));
        this.record('human', `dialog "${title.trim()}" -> ${yes ? 'yes' : 'no'}`);
        await this.awaitGone('confirm-yes', 5_000);
        continue;
      }

      if (await this.visible('token-nature')) {
        const wanted = a.chosenResourceToken;
        const candidates = wanted ? [wanted, ...TOKENS] : [...TOKENS];
        let picked = false;
        for (const t of candidates) {
          const btn = this.page.getByTestId(`token-${t}`);
          if (await btn.isEnabled().catch(() => false)) {
            await this.humanClick(btn);
            this.record('human', `token -> ${t}`);
            await this.awaitGone('token-nature', 5_000);
            picked = true;
            break;
          }
        }
        if (!picked) throw new Error('Token picker open but no token is enabled');
        continue;
      }

      const g = await this.game();
      if (g?.placementActive) {
        // The standard projects call startPlacement() with no prompt string, so
        // `prompt` is often null — that is normal, not an error.
        const prompt = g.placementPrompt ?? '';
        let hexId: number | undefined;
        if (/Select a city to relocate/i.test(prompt)) hexId = a.fromHexId;
        else if (/greenery to return/i.test(prompt)) hexId = a.secondaryTargetHexId;
        else hexId = a.targetHexId;

        // Only trust the chosen hex if the board actually offers it right now;
        // otherwise take any hex the engine marks valid so the game continues.
        if (hexId == null || !g.placementValidHexIds.includes(hexId)) {
          hexId = g.placementValidHexIds[0] ?? (await this.anyValidHex());
        }
        if (hexId == null) {
          throw new Error(`Placement active ("${prompt || 'no prompt'}") but no valid hex available`);
        }
        await this.clickHex(hexId, prompt.trim() || 'placement');
        continue;
      }

      return;
    }
    throw new Error(`Prompt resolution did not settle after 16 steps`);
  }

  private async anyValidHex(): Promise<number | undefined> {
    const ids = await this.page.$$eval('[data-hex-valid="1"]', (els) =>
      els.map((e) => Number((e as SVGElement).getAttribute('data-testid')!.replace('hex-', ''))),
    );
    return ids[0];
  }

  // ----------------------------------------------------------------
  // The loop
  // ----------------------------------------------------------------

  async playToGameOver(): Promise<GameSnapshot | null> {
    const deadline = Date.now() + this.opts.budgetMs;
    let idleTicks = 0;

    while (Date.now() < deadline) {
      if (await this.visible('game-over', 250)) {
        const snap = await this.game();
        this.record('system', `GAME OVER — winner=${snap?.winner ?? 'tie'} via ${snap?.endCondition ?? '?'}`);
        await this.frame('game-over');
        return snap;
      }

      const g = await this.game();
      if (g) {
        if (g.phase !== this.lastPhase || g.generation !== this.lastGeneration) {
          this.lastPhase = g.phase;
          this.lastGeneration = g.generation;
          this.record('system', `-> ${g.phase} (generation ${g.generation})`);
          await this.frame(`phase-${g.phase}`);
        }

        // Log the AI's turns too, so the turn log shows both sides. Several can
        // land between polls when the human has already passed.
        if (g.aiTurnCount > this.seenAiTurns) {
          const n = g.aiTurnCount - this.seenAiTurns;
          this.seenAiTurns = g.aiTurnCount;
          const d = g.lastAiDecision;
          const desc = !d
            ? 'action'
            : d.type === 'activate_project'
              ? `activate card ${d.cardId}${d.side}`
              : d.type === 'standard_project'
                ? `standard project ${d.projectId}`
                : 'pass';
          // The turn index keeps each note unique so these never trip the
          // repeat guard, which exists to catch the driver spinning.
          this.record('ai', `#${g.aiTurnCount} ${desc}${n > 1 ? ` (+${n - 1} since last poll)` : ''}`, d ?? undefined);
        }
      }

      if (await this.stepOnce(g)) {
        idleTicks = 0;
        continue;
      }

      // Nothing to do — the AI is thinking, or a timed screen is animating.
      idleTicks++;
      if (idleTicks % 80 === 0) {
        // eslint-disable-next-line no-console
        console.log(`[idle ${idleTicks * 0.25 | 0}s] ${await this.describeScreen()}`);
      }
      if (idleTicks > 960) {
        throw new Error(`Driver idle for ~240s — wedged at: ${await this.describeScreen()}`);
      }
      await this.page.waitForTimeout(250);
    }

    throw new Error(`Game did not finish within ${Math.round(this.opts.budgetMs / 60000)} minutes`);
  }

  /** Take at most one action. Returns true if it did something. */
  private async stepOnce(g: GameSnapshot | null): Promise<boolean> {
    // --- Tutorial: read a few tips on camera, then skip the rest ---
    if (await this.visible('tutorial-step', 250)) {
      if (this.tipsShown < this.opts.tutorialTipsToShow) {
        this.tipsShown++;
        await this.frame(`tutorial-${this.tipsShown}`);
        // Let the viewer actually read it.
        await this.page.waitForTimeout(2500);
        await this.humanClick(this.byTestId('tutorial-gotit'));
        this.record('system', `tutorial tip ${this.tipsShown} acknowledged`);
      } else {
        await this.humanClick(this.byTestId('tutorial-skip'));
        this.record('system', 'tutorial skipped');
      }
      return true;
    }

    // --- Landing: accept terms, sign in as guest ---
    if (await this.visible('play-as-guest', 250)) {
      // Order matters: the button is `disabled={loading || !acceptedLegal}`, so it
      // only becomes clickable once the legal checkbox is ticked.
      const box = this.page.getByTestId('accept-legal');
      if (!(await box.isChecked().catch(() => false))) {
        await this.humanClick(box);
        this.record('system', 'accepted terms');
      }
      if (!(await this.waitUntilClickable('play-as-guest', 5_000))) return false;
      await this.humanClick(this.byTestId('play-as-guest'));
      this.record('system', 'signed in as guest');
      // Anonymous auth plus the Firestore user-doc write can take a while on a
      // cold connection; don't come back round and click it again.
      await this.awaitGone('play-as-guest');
      return true;
    }

    // --- Dashboard ---
    if (await this.clickable('mode-human-vs-ai')) {
      await this.humanClick(this.byTestId('mode-human-vs-ai'));
      this.record('system', 'started Player vs AI');
      await this.awaitGone('mode-human-vs-ai', 20_000);
      return true;
    }

    // --- Map reveal / colour assignment ---
    if (await this.clickable('setup-continue')) {
      await this.frame('setup');
      await this.humanClick(this.byTestId('setup-continue'));
      this.record('system', 'setup continue');
      await this.awaitSetupStepChange(g?.setupStep ?? null);
      return true;
    }

    if (!g) return false;

    // --- Setup city placement (only when it is the human's turn) ---
    if (g.setupStep === 'city-black' || g.setupStep === 'city-white') {
      const humanIsBlack = g.humanColor === 'black';
      const humanPlacesNow =
        (g.setupStep === 'city-black' && humanIsBlack) || (g.setupStep === 'city-white' && !humanIsBlack);
      if (humanPlacesNow) {
        const hexId = await this.suggestCityHex();
        if (hexId != null) {
          await this.clickHex(hexId, 'setup city');
          await this.frame('setup-city');
          return true;
        }
      }
      return false; // AI is placing
    }

    // --- Research / drafting ---
    if (g.phase === 'research') {
      const d = await this.draftState();
      if (d?.isHumanTurn && !d.isAIThinking && d.cardId != null) {
        const side = await this.suggestDraftSide();
        await this.humanClick(this.byTestId(`draft-${side}`));
        this.record('human', `drafted card ${d.cardId}, keeping side ${side}`);
        return true;
      }
      return false; // AI is choosing
    }

    // --- Action phase ---
    if (g.phase === 'action') {
      // Finish any placement still hanging from the previous step before
      // choosing a new action — the board is waiting on a hex click and the
      // Pass button is still enabled, which would otherwise look like a fresh turn.
      if (g.placementActive) {
        await this.resolvePrompts(this.pendingAction ?? { type: 'pass' });
        return true;
      }

      const passEnabled = await this.page
        .getByTestId('pass')
        .isEnabled({ timeout: 300 })
        .catch(() => false);
      if (!passEnabled) return false; // not the human's turn, or already passed

      const action = await this.suggestAction();
      if (!action) return false;

      if (action.type === 'pass') {
        await this.humanClick(this.byTestId('pass'));
        this.record('human', 'pass', action);
      } else if (action.type === 'standard_project') {
        this.pendingAction = action;
        await this.humanClick(this.byTestId(`std-${action.projectId}`));
        this.record('human', `standard project ${action.projectId}`, action);
        await this.resolvePrompts(action);
        this.pendingAction = null;
      } else {
        this.pendingAction = action;
        await this.humanClick(this.byTestId(`activate-${action.cardId}${action.side}`));
        this.record('human', `activate card ${action.cardId}${action.side}`, action);
        await this.resolvePrompts(action);
        this.pendingAction = null;
      }

      await this.frame(`human-${action.type}`);
      return true;
    }

    return false; // income animation, or a transient state
  }
}
