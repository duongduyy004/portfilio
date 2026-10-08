# Horizontal Slide Deck Implementation Plan (v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the `feat/slideshow` branch from vertical snapping slides into a horizontal, full-screen, responsive slide deck.

**Architecture:** One horizontal scroll-snap container (`Deck`) below a fixed tab bar holds 10 full-deck `Slide` panels, each scrolling vertically inside itself. A single `SlideNav` script maps keys and the wheel to slide moves, drives the counter, dots, arrows, tabs, hash and live region, and handles deep links. Its decisions come from pure helpers in `src/lib/slidenav.ts`.

**Tech Stack:** Astro 7, TypeScript, Vitest + Astro Container API, Playwright (preview on port 4322).

**Spec:** `docs/superpowers/specs/2026-10-08-slideshow-design.md` (v2)

## Global Constraints

- Deck: `height: calc(100dvh - var(--tabbar-h))`, `scroll-snap-type: x mandatory`. Slide: `flex: 0 0 100%`, `scroll-snap-stop: always`, `overflow-y: auto`, `overscroll-behavior-y: contain`, `tabindex="-1"`.
- The tab bar box height equals `--tabbar-h` exactly (60px).
- While JS runs, `html, body { height: 100%; overflow: hidden }` via a class on `<html>` (`deck-on`) set by the inline head script. Without JS the page keeps its normal overflow and the deck scrollbar stays visible.
- Grids per spec §4: posts 4/2/1, events 4/2/1, videos 3/2/1, Beyond Work 4/2/1 at ≥1200 / 640–1199 / <640.
- Dots at the bottom on all sizes; arrows only at ≥ 640px; the previous arrow is hidden on slide 1 and the next on slide 10.
- Wheel: threshold 50 (normalised px), cooldown 700ms. The live announcement is debounced 400ms. History uses `replaceState` only.
- `behavior: 'auto'` under reduced motion, otherwise `'smooth'`.
- `slides.ts`, `profile.ts` and the content components are unchanged.
- Each commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Clicking content on another slide** (e.g. Playwright or a tab jump straight to a card on slide 8): the "reset inner scroll" rule must not yank the slide the visitor just arrived on. Rule: on a slide change, reset `scrollTop` of every slide **except** the current one. Pinned by e2e `arriving does not reset the current slide mid-read` (Task 4).
2. **Trackpad momentum at a slide's edge:** a long inertial scroll must move at most one slide. Pinned by e2e `a long wheel burst moves one slide` (Task 4).
3. **Wheel over an open pop-up** must not move the deck. Pinned by e2e `wheel does nothing while a pop-up is open` (Task 4).
4. **Phone browser bar resizing (`dvh` change) or a rotation** mid-deck: the deck must stay on the same slide. The script re-snaps to the current index on `resize`. Pinned by e2e `resizing keeps the current slide` (Task 4).
5. **Expanding a role story** inside a slide must not move to another slide or reset the scroll. Pinned by e2e `expanding a story keeps the slide and position` (Task 4).

---

### Task 1: Navigation helpers v2

**Files:**
- Modify: `src/lib/slidenav.ts` (remove `currentSlide` and `stepTarget`; keep `counterText`; add `currentSlideX`, `wheelStep`; rewrite `navKey`)
- Modify: `tests/unit/slidenav.test.ts` (replace the old cases)

**Interfaces:**
- Produces:
```ts
export function currentSlideX(scrollLeft: number, deckWidth: number, count: number): number;
export type NavAction = 'next' | 'prev' | 'first' | 'last' | 'page-next' | 'page-prev';
export function navKey(e: KeyLike, focus: { tag: string; dialogOpen: boolean }): NavAction | null;
export function wheelStep(deltaY: number, canScrollDown: boolean, canScrollUp: boolean, accumulated: number):
  { consume: false; accumulated: 0 } | { consume: true; accumulated: number; move: -1 | 0 | 1 };
export function counterText(index: number, count: number): string; // unchanged
```

- [ ] **Step 1:** Rewrite `tests/unit/slidenav.test.ts`:
  - `currentSlideX`: `(0, 400, 10) === 0`; `(390, 400, 10) === 1` (rounding); `(4100, 400, 10) === 9` (clamp); `(0, 0, 10) === 0` (zero width).
  - `navKey`:
    - ArrowRight → `next`, ArrowLeft → `prev`, Home → `first`, End → `last`;
    - PageDown and Space → `page-next`; PageUp and Shift+Space → `page-prev`;
    - ArrowUp and ArrowDown → `null`, because they stay native;
    - ctrl, alt or meta held → `null`; `dialogOpen` → `null`;
    - tags INPUT, TEXTAREA, SELECT, VIDEO and IFRAME → `null` for ArrowRight;
    - tags A, BUTTON and SUMMARY → `null` for Space, but `next` for ArrowRight;
    - `'a'` → `null`.
  - `wheelStep`:
    - `(30, true, false, 0)` → `{ consume: false, accumulated: 0 }`;
    - `(30, false, true, 0)` → `{ consume: true, accumulated: 30, move: 0 }`;
    - `(30, false, true, 30)` → `{ consume: true, accumulated: 0, move: 1 }`;
    - `(-60, true, false, 0)` → `{ consume: true, accumulated: 0, move: -1 }`;
    - `(-30, true, true, 0)` → `{ consume: false, accumulated: 0 }`;
    - `(0, false, false, 20)` → `{ consume: true, accumulated: 20, move: 0 }`.
  - `counterText` cases are unchanged.
- [ ] **Step 2:** Run `npx vitest run tests/unit/slidenav.test.ts` → FAIL (missing exports).
- [ ] **Step 3:** Implement.
  - `wheelStep`: if the slide can scroll in the delta's direction (`deltaY > 0 && canScrollDown`, or `< 0 && canScrollUp`), return not consumed. Otherwise add the delta. At `|acc| >= 50`, return `move = sign`, `accumulated: 0`; else `move: 0`.
  - Remove `currentSlide` and `stepTarget`, and their tests.
- [ ] **Step 4:** Run → PASS. Note: `npm run check` will fail until Task 4 rewrites `SlideNav.astro`'s script; the unit suite must pass.
- [ ] **Step 5:** Commit: `refactor: navigation helpers for a horizontal deck`.

---

### Task 2: Deck and Slide panel with CSS

**Files:**
- Create: `src/components/Deck.astro`, `tests/unit/deck.test.ts`
- Modify: `src/components/Slide.astro`, `tests/unit/slide.test.ts`, `src/styles/global.css` (replace the v1 slide/snap block), `src/layouts/Base.astro` (inline script also adds `deck-on`)

**Interfaces:**
- Produces:
  - **`Slide`** keeps its props. Root: `<section … class="slide slide--{tone}" tabindex="-1" data-slide …>`. It contains the anchor span, `<div class="slide__inner container">…</div>` and `<span class="slide__more" aria-hidden="true" hidden>↓ more</span>`.
  - **`Deck`** has no props and a default slot. It renders:
    ```html
    <main class="deck" data-deck>
      <slot/>
      <button class="deck__arrow deck__arrow--prev" data-deck-prev aria-label="Previous slide" hidden>‹</button>
      <button … data-deck-next aria-label="Next slide" hidden>›</button>
    </main>
    ```
    The buttons sit inside `main`, but are positioned `fixed` relative to the deck area.

- [ ] **Step 1:** Tests:
  - `slide.test.ts` adds: `tabindex="-1"`, and a `slide__more` element with `hidden` and `aria-hidden="true"`. The existing assertions are kept.
  - `deck.test.ts`: renders `<main class="deck"` with `data-deck`, slot content, and two buttons labelled "Previous slide" and "Next slide", both `hidden`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/slide.test.ts tests/unit/deck.test.ts` → FAIL.
- [ ] **Step 3:** Implement the components. In `global.css`, replace the v1 block (html snap, `.slide` min-height/snap) with the Global Constraints rules, plus:
  - `.slide { display: flex; flex-direction: column }` and `.slide__inner { margin-block: auto; padding-block: 32px 72px }`;
  - the tones are kept;
  - `.slide__more` is fixed relative to the slide (`position: sticky; bottom: 64px; align-self: center`) in a white pill with an ink border;
  - `.deck-on .deck { scrollbar-width: none }` plus the webkit equivalent;
  - `html.deck-on, html.deck-on body { height: 100%; overflow: hidden }`;
  - print: `.deck { display: block; height: auto; overflow: visible }`, `.slide { height: auto; overflow: visible; break-before: page }`, `.slide__more, .deck__arrow, .slidenav { display: none }`, `html.deck-on, html.deck-on body { overflow: visible; height: auto }`.

  `Base.astro`'s inline script adds `document.documentElement.classList.add('deck-on')` unconditionally (it is unrelated to reduced motion).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: horizontal deck container and full-screen slide panels`.

---

### Task 3: Bottom dots and fixed tab bar

**Files:**
- Modify: `src/components/SlideNav.astro` (markup and styles only; the script is replaced in Task 4, so leave a stub `<script>` that removes `hidden` from the nav), `src/components/TabBar.astro` (fixed, exact height), `tests/unit/slidenav-render.test.ts`

**Interfaces:**
- Produces:
  - `SlideNav` props unchanged. It renders `<nav class="slidenav" aria-label="Slides" hidden>` with an `<ol>` of 10 `<a href="#slide-N" class="slidenav__dot" data-dot="N"><span class="slidenav__label">title</span></a>`. Spec §5 says dots work without JS, so unlike v1 the nav is **not** rendered `hidden`.
  - TabBar: `.tabbar { position: fixed; inset: 0 0 auto; height: var(--tabbar-h); box-sizing: border-box }`, and its row `height: 100%`.

- [ ] **Step 1:** Update `slidenav-render.test.ts` to expect `<nav[^>]*aria-label="Slides"` **without** `hidden`, an `<ol`, and the 10 dots with their titles (as now).
- [ ] **Step 2:** Run → FAIL (the nav still has `hidden`).
- [ ] **Step 3:** Implement the markup and styles.
  - The dot row is `position: fixed; left: 50%; bottom: 16px; translate: -50% 0; z-index: 9`, in a white pill with an ink border, 6px padding and 8px gaps.
  - Dots are 12px.
  - Labels sit above the dot, visible on hover/focus only at ≥ 640px.
  - Remove the v1 right-rail styles.
- [ ] **Step 4:** Run `npx vitest run` → all PASS.
- [ ] **Step 5:** Commit: `feat: bottom dot row and fixed tab bar`.

---

### Task 4: Navigation script, page composition and browser tests

**Files:**
- Modify: `src/components/SlideNav.astro` (script), `src/pages/index.astro`, `tests/e2e/slideshow.spec.ts` (rewrite), and other `tests/e2e/*.spec.ts` only where they assume page-level vertical scrolling

**Interfaces:**
- Consumes: `currentSlideX`, `navKey`, `wheelStep`, `counterText` (Task 1); `Deck`, `Slide` (Task 2); `SlideNav`, `TabBar` (Task 3); `SLIDES`, `SECTION_FIRST_SLIDE`.
- **Script behaviour:** exactly spec §6, with these pinned details:
  - On a current-slide change, reset `scrollTop = 0` on every slide **except** the current one (Review Focus 1).
  - On `resize`, `deck.scrollTo({ left: current * deck.clientWidth, behavior: 'auto' })` (Review Focus 4).
  - Wheel listener on the deck with `{ passive: false }`. Ignore it when a `dialog[open]` exists. "Can scroll" for the current slide means `scrollTop + clientHeight < scrollHeight - 1` (down) or `scrollTop > 0` (up). During the 700ms cooldown, consumed wheel at an edge is `preventDefault`ed and dropped (Review Focus 2).
  - `page-next` / `page-prev` move slides only at the edge; otherwise do nothing and let the browser scroll the focused slide.
  - After `goTo`, call `slides[i].focus({ preventScroll: true })`.
  - The arrows call `goTo(current ± 1)`, and their `hidden` state is set by index and only when the viewport is ≥ 640px (`matchMedia`).
  - The hint is updated on each slide's `scroll` and on slide change.
  - Deep link: before anything else, resolve `location.hash` to an index (via `#slide-N` or `SECTION_FIRST_SLIDE` legacy ids read from `[data-section]`/anchor spans), `scrollTo` it with `'auto'`, then enable hash rewriting.
- **index.astro:**
  ```
  <TabBar …/>
  <Deck> {10 <Slide>} </Deck>
  <SlideNav slides={SLIDES}/>
  Lightbox / VideoModal / Reveal
  ```
  Update the grid classes to the spec §4 column counts (`grid--4` = 4/2/1 at 1200/640, `grid--3` = 3/2/1). Beyond Work uses `grid--4`.

- [ ] **Step 1:** Rewrite `tests/e2e/slideshow.spec.ts` (both projects unless noted):
  - `each slide fills the deck`: for all 10 slides, the box equals the `[data-deck]` box within ±1. `document.scrollingElement.scrollHeight <= innerHeight + 1`, and `scrollWidth <= innerWidth`.
  - `keys move slides`: ArrowRight → `02 / 10` and `#slide-2`; End → `10 / 10`; ArrowLeft → `09 / 10`; Home → `01 / 10`. `history.length` is unchanged.
  - `arrows move slides` (desktop): next is visible and prev hidden on slide 1; click next → `02 / 10`; End → next hidden. On phones both are hidden.
  - `dot click moves to its slide`: click dot 7 → `07 / 10`, and dot 7 is `aria-current`.
  - `wheel at a short slide's edge moves on`: on slide 1 (desktop), `page.mouse.wheel(0, 120)` → `02 / 10`.
  - `wheel inside a tall slide scrolls it` (phone): at slide 4, wheel 120 → still `04 / 10`, and slide 4's `scrollTop > 0`.
  - `a long wheel burst moves one slide` (desktop): from slide 1, 10 × wheel 120 within ~300ms → `02 / 10`.
  - `pagedown scrolls inside then moves on` (phone, slide 4): PageDown → same slide, `scrollTop > 0`; repeat until the counter changes (≤ 15 presses) → `05 / 10`.
  - `more hint follows the slide's scroll` (phone, slide 4): `.slide__more` is visible; scroll slide 4 to its bottom → hidden.
  - `arriving does not reset the current slide mid-read`: scroll slide 8 down 300px programmatically while it is current; wait 500ms → `scrollTop` is still ≥ 300. Move to slide 9 and back → slide 8 `scrollTop === 0`.
  - `expanding a story keeps the slide and position` (phone): at slide 4, scroll 200px, click its `summary`, wait 400ms → still `04 / 10`, and `scrollTop >= 200`.
  - `resizing keeps the current slide`: at slide 5, set the viewport to the other size → `05 / 10`, and the slide box equals the deck box.
  - `swipe moves one slide` (phone): touch-drag right-to-left across 60% of the width → `02 / 10`.
  - `deep links`: `/#slide-4` → `04 / 10`; `/#events` → `07 / 10`.
  - `keys and wheel do nothing while a pop-up is open`: open the lightbox on slide 4; ArrowRight and wheel 120 → `04 / 10`.
  - `screen reader announcement once`: as in v1, End → the live region reads `Slide 10 of 10: Contact` with ≤ 2 mutations.
  - `reduced motion`: End → `10 / 10` within 300ms.
  - `without JS`: 10 slides, each fills the deck box; `[data-deck]` `scrollWidth > clientWidth`; the counter and arrows are hidden; dots are visible; clicking the Contact tab puts `#slide-10` in viewport.

  Update the other e2e files only where they rely on page-level vertical scrolling. The legacy `page.spec` 'no horizontal scroll' keeps checking `document.documentElement.scrollWidth <= innerWidth`.
- [ ] **Step 2:** Run `npx playwright test` → the new tests FAIL.
- [ ] **Step 3:** Implement the script and `index.astro`.
- [ ] **Step 4:** Run `npx playwright test`, `npx vitest run` and `npm run check` → all green (the YouTube tests may SKIP).
- [ ] **Step 5:** Take screenshots of all 10 slides at 390×844 and 1440×900 (reduced motion) and review them: no overlap with the dots, hint or arrows; centred short slides; readable tones. Run Lighthouse on mobile → all four categories ≥ 90.
- [ ] **Step 6:** Commit: `feat: horizontal full-screen slide deck`.
