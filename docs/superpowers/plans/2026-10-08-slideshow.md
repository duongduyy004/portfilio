# Slideshow Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the one-page portfolio into 10 full-screen, colour-toned slides that snap gently on scroll, with a slide counter, a desktop dot rail and keyboard navigation.

**Architecture:** Native CSS scroll-snap (`y proximity`) on the document. `src/data/slides.ts` is the single source for slide order, titles, tones and section mapping. `Slide.astro` replaces `Section.astro`. One `SlideNav.astro` script tracks the current slide and handles keys, using pure helpers in `src/lib/slidenav.ts` so the logic is unit-testable. The existing content components are reused unchanged.

**Tech Stack:** Astro 7, TypeScript, Vitest + Astro Container API, Playwright (port 4322 preview).

**Spec:** `docs/superpowers/specs/2026-10-08-slideshow-design.md` (builds on `docs/superpowers/specs/2026-10-08-portfolio-design.md`)

## Global Constraints

- Slide order, ids, titles, icons, sections and tones are exactly spec §3. Tone hex values: lavender `#F3EFFF`, yellow `#FFE45C`, mint `#3DDCB0`, pink `#FF7AB6`, lilac `#CBBEFF`.
- Text directly on a tone is `--ink`. `--muted` text appears only inside white cards.
- `html { scroll-snap-type: y proximity; scroll-padding-top: var(--tabbar-h) }`, `.slide { scroll-snap-align: start; min-height: calc(100dvh - var(--tabbar-h)) }`.
- Counter format `NN / 10`, zero-padded. Dot rail only at `min-width: 900px`.
- URL updates use `history.replaceState` only, never `pushState`.
- Programmatic scrolls use `behavior: 'auto'` under `prefers-reduced-motion: reduce`, otherwise `'smooth'`.
- With JS off, the counter and dot rail are not visible. Everything else works.
- `profile.ts` and the content components (`ProfileHeader`, `HighlightCard`, `PostCard`, `RoleCard`, `EventGrid`, `VideoEmbed`, `ActivityCard`, `EducationList`, `ContactCard`, `Lightbox`, `VideoModal`, `Reveal`) are not modified.
- Legacy anchors `#top-posts #experience #events #videos #beyond-work #contact` must keep landing on their section's first slide.
- Each commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Expanding a role story on a phone** grows slide 4 past the screen. The reader must stay where they are, with no snap jump to slide 5. Pinned by e2e `expanding a story does not jump slides` (Task 5).
2. **Space on a focused `<summary>` or button** must toggle or activate it, not change the slide. Pinned by e2e `space on a summary toggles it` (Task 5).
3. **Arrow keys while the photo viewer is open** must not move slides behind the dialog. Pinned by e2e `keys do nothing while the lightbox is open` (Task 5).
4. **Browser Back after scrolling through slides** must leave the site or return to the previous page, not step through slides. Pinned by e2e `scrolling adds no history entries` (Task 5).
5. **Loading a legacy anchor (`/#events`)** must land on slide 7 and stay there. The hash-tracking script must not yank it elsewhere on load. Pinned by e2e `legacy anchors land on their slide` (Task 5).

---

### Task 1: Slide data

**Files:**
- Create: `src/data/slides.ts`, `tests/unit/slides.test.ts`

**Interfaces:**
- Consumes: `SECTIONS` from `src/data/types.ts` (ids `top-posts | experience | events | videos | beyond-work | contact`).
- Produces:
```ts
export type Tone = 'lavender' | 'yellow' | 'mint' | 'pink' | 'lilac';
export type SectionId = (typeof SECTIONS)[number]['id'];
export interface SlideDef { n: number; id: string; title: string; icon: string; section: SectionId | 'profile'; tone: Tone; anchor?: SectionId }
export const SLIDES: SlideDef[];
export const SECTION_FIRST_SLIDE: Record<SectionId, string>;
```

- [ ] **Step 1:** Write `tests/unit/slides.test.ts`:
  - `SLIDES.map(s => s.id)` equals `['slide-1', …, 'slide-10']`, and `n` equals index + 1.
  - `SLIDES.map(s => s.title)` equals `['Thuy Anh Phi', 'Top Posts · Careers page', 'Top Posts', 'Experience · MOR Software', 'Experience · Future Media', 'Experience · Meraces', 'Events', 'Videos', 'Beyond Work', 'Contact']`.
  - `SLIDES.map(s => s.tone)` equals `['lavender','yellow','mint','pink','lilac','lavender','yellow','mint','pink','lilac']`.
  - `SLIDES.map(s => s.section)` equals `['profile','top-posts','top-posts','experience','experience','experience','events','videos','beyond-work','contact']`.
  - `SECTION_FIRST_SLIDE` equals `{ 'top-posts': 'slide-2', experience: 'slide-4', events: 'slide-7', videos: 'slide-8', 'beyond-work': 'slide-9', contact: 'slide-10' }`.
  - `anchor` is set exactly on the first slide of each section, and equals that section id.
- [ ] **Step 2:** Run `npx vitest run tests/unit/slides.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `slides.ts` with the spec §3 values. Derive `anchor` and `SECTION_FIRST_SLIDE` from the first occurrence of each section, rather than hand-writing them.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add slide definitions`.

---

### Task 2: Slide component, tones and snapping CSS

**Files:**
- Create: `src/components/Slide.astro`, `tests/unit/slide.test.ts`
- Modify: `src/styles/global.css` (add tone tokens, snap and print rules)

**Interfaces:**
- Consumes: `SlideDef` (Task 1).
- Produces: `Slide` props `SlideDef & { hideHeader?: boolean }`, default slot. Renders:
```html
<section id="slide-N" class="slide slide--{tone}" data-slide data-section="{section}" data-title="{title}" aria-labelledby="slide-N-heading|undefined" aria-label="{title} (only when hideHeader)">
  {anchor && <span id={anchor} class="slide__anchor"></span>}
  <div class="slide__inner container"> [header: icon ring + <h2 id="slide-N-heading">] <slot/> </div>
</section>
```

- [ ] **Step 1:** Write `tests/unit/slide.test.ts` (Container API):
  - Rendering `SLIDES[6]` (events) gives `id="slide-7"`, `class` containing `slide--yellow`, `data-section="events"`, a `<span id="events"`, and an `<h2` whose id equals `aria-labelledby`, containing "Events".
  - Rendering `SLIDES[0]` with `hideHeader: true` gives no `<h2` and `aria-label="Thuy Anh Phi"`.
  - Slot content is rendered.
- [ ] **Step 2:** Run `npx vitest run tests/unit/slide.test.ts` → FAIL.
- [ ] **Step 3:** Implement `Slide.astro`, reusing the header markup and styles from `Section.astro` (gradient-ring icon with `data-reveal="spin"`). In `global.css`, add:
  - `--tone-lavender … --tone-lilac` and `.slide--{tone} { background: var(--tone-…) }`;
  - the snap rules from Global Constraints;
  - `.slide { display: flex; align-items: center; padding-block: 40px }`, with `.slide__inner` full width;
  - `.slide__anchor { position: absolute; top: 0 }` and `.slide { position: relative }`;
  - `@media print { html { scroll-snap-type: none } .slide { min-height: auto } .slide + .slide { break-before: page } }`.
- [ ] **Step 4:** Run → PASS. Run `npm run check` → 0 errors.
- [ ] **Step 5:** Commit: `feat: add Slide component with tones and snapping`.

---

### Task 3: Slide navigation logic (pure helpers)

**Files:**
- Create: `src/lib/slidenav.ts`, `tests/unit/slidenav.test.ts`

**Interfaces:**
- Produces:
```ts
/** index of the current slide: the last slide whose top <= 40% of viewport; last slide when atBottom */
export function currentSlide(tops: number[], viewportH: number, atBottom: boolean): number;
export type NavKey = 'next' | 'prev' | 'first' | 'last';
/** map a key event to an action; null when the key must be left to the browser */
export function navKey(e: { key: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean },
                       focus: { tag: string; dialogOpen: boolean }): NavKey | null;
/** what 'next'/'prev' should do on the current slide: scroll within it by `step` px, or go to a slide index */
export function stepTarget(action: 'next' | 'prev', slide: { top: number; bottom: number }, viewportH: number,
                           tabbarH: number, index: number, count: number): { scrollBy: number } | { goTo: number };
export function counterText(index: number, count: number): string; // counterText(3, 10) === '04 / 10'
```

- [ ] **Step 1:** Write the tests:
  - `currentSlide([-900, -100, 300, 1200], 800, false) === 2` (40% of 800 = 320, and the last top ≤ 320 is 300). Also `currentSlide([0, 900], 800, false) === 0`, and `currentSlide([-2000, -900], 800, true) === 1`.
  - `navKey`:
    - ArrowDown, PageDown and Space map to `'next'`;
    - ArrowUp, PageUp and Shift+Space map to `'prev'`;
    - Home maps to `'first'` and End to `'last'`;
    - any key with ctrl, alt or meta held gives `null`;
    - `dialogOpen: true` gives `null`;
    - tag `INPUT`, `TEXTAREA`, `SELECT`, `VIDEO` or `IFRAME` gives `null` for every key;
    - tag `A`, `BUTTON` or `SUMMARY` gives `null` for Space and Shift+Space, but ArrowDown still gives `'next'`;
    - an unrelated key (`'a'`) gives `null`.
  - `stepTarget`, with tabbarH 60 and viewportH 800:
    - `('next', {top: 60, bottom: 1500}, 800, 60, 3, 10)` gives `{ scrollBy: 740 }`, because the bottom is below the viewport;
    - `('next', {top: 60, bottom: 790}, …, 3, 10)` gives `{ goTo: 4 }`;
    - `('next', …, 9, 10)` with a fitting slide gives `{ goTo: 9 }` (clamped);
    - `('prev', {top: -500, bottom: 700}, …, 3, 10)` gives `{ scrollBy: -740 }`, because the top is above the snap line;
    - `('prev', {top: 60, …}, …, 3, 10)` gives `{ goTo: 2 }`;
    - `('prev', …, 0, 10)` gives `{ goTo: 0 }`.
  - `counterText(0, 10) === '01 / 10'` and `counterText(9, 10) === '10 / 10'`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/slidenav.test.ts` → FAIL.
- [ ] **Step 3:** Implement. In `stepTarget`, "bottom below viewport" means `slide.bottom > viewportH + 1`, and "top above snap line" means `slide.top < tabbarH - 1`. The scroll step is `viewportH - tabbarH`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add slide navigation helpers`.

---

### Task 4: SlideNav component and TabBar update

**Files:**
- Create: `src/components/SlideNav.astro`
- Modify: `src/components/TabBar.astro` (hrefs, counter element, remove tracking script), `tests/unit/header.test.ts` (TabBar and Section tests)
- Test: `tests/unit/slidenav-render.test.ts`

**Interfaces:**
- Consumes: `SLIDES`, `SECTION_FIRST_SLIDE` (Task 1), and `currentSlide`, `navKey`, `stepTarget`, `counterText` (Task 3).
- Produces:
  - `TabBar` props `{ sections: readonly {id,label}[]; firstSlide: Record<SectionId,string>; total: number }`. Each tab is `<a href="#{firstSlide[id]}" data-tab-section={id}>`, plus `<span class="tabbar__counter" data-slide-counter aria-live="polite" hidden>01 / {total}</span>`.
  - `SlideNav` props `{ slides: { n: number; id: string; title: string }[] }`. Renders `<nav class="slidenav" aria-label="Slides" hidden>` containing a list of `<a href="#{id}" class="slidenav__dot" data-dot="{n}"><span class="slidenav__label">{title}</span></a>`.
  - **The script:**
    - removes `hidden` from the counter and the rail;
    - recomputes the current slide on `scroll` (rAF-throttled) and `resize` using `currentSlide`;
    - when the current slide changes, updates the counter text, the dot `aria-current`, the tab `aria-current` (via the slide's `data-section`, with none for `profile`) and `history.replaceState(null, '', '#' + id)`;
    - skips the hash update during the first 500ms after load, or until the first user scroll, whichever comes first;
    - handles keys on `keydown` with `navKey`/`stepTarget`, calling `preventDefault` only when acting;
    - scrolls with `scrollBy` or `scrollIntoView({ behavior })` per Global Constraints.

- [ ] **Step 1:** Update `tests/unit/header.test.ts`:
  - The TabBar test now renders with `firstSlide: SECTION_FIRST_SLIDE, total: 10` and expects the hrefs `['slide-2','slide-4','slide-7','slide-8','slide-9','slide-10']`, plus a `data-slide-counter` containing `01 / 10`.
  - Delete the `Section` describe block (moved to `slide.test.ts`).

  Write `tests/unit/slidenav-render.test.ts`: SlideNav with `SLIDES` renders 10 `data-dot` links, `href="#slide-1"` … `#slide-10`, each label text equal to its title, and a `<nav` with `hidden`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/header.test.ts tests/unit/slidenav-render.test.ts` → FAIL.
- [ ] **Step 3:** Implement `TabBar` and `SlideNav` per Interfaces.
  - Dot rail CSS: `position: fixed; right: 18px; top: 50%; translate: 0 -50%; z-index: 9`.
  - Dots are 14px circles, white with an ink border; the current one is filled ink.
  - Labels sit to the left of the dot, visible on `:hover`/`:focus-visible`, in a white pill with an ink border.
  - `@media (max-width: 899px) { .slidenav { display: none } }`.
- [ ] **Step 4:** Run → PASS. `npm run check` → 0 errors (index.astro still compiles: pass the new TabBar props there with `SECTION_FIRST_SLIDE` and `SLIDES.length`).
- [ ] **Step 5:** Commit: `feat: add slide nav (counter, dots, keys) and point tabs at slides`.

---

### Task 5: Recompose the page into slides and update the browser tests

**Files:**
- Modify: `src/pages/index.astro`, `tests/e2e/page.spec.ts`, `tests/e2e/reveal.spec.ts`, `tests/e2e/video-modal.spec.ts`, `tests/e2e/zoom.spec.ts`
- Delete: `src/components/Section.astro`
- Create: `tests/e2e/slideshow.spec.ts`

**Interfaces:**
- Consumes: everything above. Slide 1 = `<Slide {...SLIDES[0]} hideHeader>` wrapping `ProfileHeader`. `ProfileHeader` itself is unchanged; its `.container` padding is fine inside `.slide__inner`.

- [ ] **Step 1:** Update the existing e2e selectors to the slide ids:
  - `page.spec`: 'sections in order' becomes the `[data-slide]` ids `slide-1…slide-10`; 'tab highlight' clicks the Events tab and expects `#slide-7` in viewport plus that tab `aria-current`; `#videos .video__media` becomes `#slide-8 .video__media`; `#top-posts .post` becomes `#slide-3 .post`.
  - `reveal.spec`: `#events li` becomes `#slide-7 li`.
  - `video-modal.spec` and `zoom.spec`: `#videos` becomes `#slide-8`.

  Write `tests/e2e/slideshow.spec.ts` (both projects unless noted):
  - `ten full-height slides`: 10 `[data-slide]`, each `height >= innerHeight - tabbarHeight - 1`.
  - `keyboard moves between slides`: press End → counter `10 / 10`; Home → `01 / 10`; from the top, PageDown → `02 / 10` and `location.hash === '#slide-2'`.
  - `arrow scrolls within a tall slide first` (mobile): go to `#slide-4`; if the slide is taller than the viewport, ArrowDown keeps the counter at `04 / 10` and increases `scrollY`.
  - `experience tab stays current across role slides`: for slides 4, 5 and 6, scroll to each and expect the Experience tab `aria-current="true"`.
  - `dot click jumps` (desktop): click dot 7 → counter `07 / 10`. On mobile, `.slidenav` is not visible.
  - `deep link to a slide`: goto `/#slide-4` → counter `04 / 10`.
  - **Review Focus tests:**
    - `legacy anchors land on their slide`: goto `/#events`, wait 800ms → counter `07 / 10`, and `#slide-7` is in viewport.
    - `expanding a story does not jump slides` (mobile): at `#slide-4`, click its `summary` → wait 600ms → counter still `04 / 10`.
    - `space on a summary toggles it`: focus slide 4's `summary`, press Space → `details[open]`, counter unchanged.
    - `keys do nothing while the lightbox is open`: open the first `[data-lightbox]` on slide 4, press ArrowDown → counter unchanged.
    - `scrolling adds no history entries`: record `history.length`, press PageDown 3 times → `history.length` unchanged.
  - `space does not change slide while the video modal is open`: open the dance video, press Space → counter unchanged.
  - `reduced motion uses instant scrolling` (`reducedMotion: 'reduce'`): press End, and the counter reads `10 / 10` within 100ms.
  - `without JS` (`javaScriptEnabled: false`): 10 slides are visible, `.slidenav` and `[data-slide-counter]` are not visible, and clicking the Contact tab brings `#slide-10` into the viewport.
- [ ] **Step 2:** Run `npx playwright test` → the new and updated tests FAIL (page not recomposed).
- [ ] **Step 3:** Recompose `index.astro`:
  - map `SLIDES` to `<Slide>` wrappers with the content in spec §3;
  - render `<TabBar sections={SECTIONS} firstSlide={SECTION_FIRST_SLIDE} total={SLIDES.length} />` after slide 1 and before `<main>` (slides 2–10 inside `<main>`), so the tab bar stays sticky;
  - add `<SlideNav slides={SLIDES} />`;
  - remove the old `Section` import and the `icons` map;
  - delete `Section.astro`.
- [ ] **Step 4:** Run `npx playwright test` → all pass (the YouTube tests may still SKIP). Run `npx vitest run` → all pass. Run `npm run check` → 0 errors.
- [ ] **Step 5:** Take screenshots of every slide at 390×844 and 1440×900 (reduced motion, scroll each into view), and review them: no overlap, no clipped text, tone contrast, the dot rail not covering cards (if it overlaps at 1440, add `padding-right: 56px` to `.slide__inner` at ≥ 900px). Run Lighthouse on mobile (4322 preview) → all four categories ≥ 90.
- [ ] **Step 6:** Commit: `feat: recompose portfolio into snapping slides`.
