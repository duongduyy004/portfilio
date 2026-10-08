# Slideshow Layout — Design (v2: horizontal deck)

**Date:** 2026-10-08
**Status:** Approved in brainstorming, pending written-spec review
**Builds on:** `2026-10-08-portfolio-design.md` (content, components, visual system unchanged unless stated)
**Supersedes:** v1 of this spec (vertical snapping slides, commit `f83dd3c`), already built on `feat/slideshow`. v2 reworks that branch.

## 1. Purpose

Turn the portfolio into a **horizontal, full-screen slide deck** on every screen size. Each slide is exactly one screen; visitors move sideways between slides. Layouts are responsive, and a slide whose content is taller than the screen scrolls vertically inside itself. It is still one link and one document, and it still works without JavaScript.

Out of scope: per-device re-splitting of slides, transition effects beyond the browser's smooth scroll, a separate presenter mode.

## 2. Decisions

| Topic | Decision |
|---|---|
| Direction | Horizontal, one slide = one screen, on all sizes |
| Overflow | Vertical scroll inside the slide, with a "↓ more" hint |
| Responsiveness | Grids adapt per breakpoint (§4) |
| Technique | Native horizontal scroll-snap + plain-JS navigation layer |

## 3. Frame

- **Tab bar:** fixed at the top, full width, height `--tabbar-h` (exact; the box is sized to it). Tabs and the `NN / 10` counter as in v1, plus the sr-only live region.
- **Deck:** `<main class="deck" data-deck>` fills the rest of the viewport (`height: calc(100dvh - var(--tabbar-h))`). It is a flex row with `overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; overscroll-behavior-x: contain`. The scrollbar is hidden when JS is on and visible when it is off.
- **Slide:** `flex: 0 0 100%; height: 100%; scroll-snap-align: start; scroll-snap-stop: always; overflow-y: auto; overscroll-behavior-y: contain`, plus the full-bleed tone background.
- **Page:** while the deck is active, the document does not scroll vertically (`html, body { height: 100%; overflow: hidden }`), so the deck is the only scroller.
- **Content position:** `.slide__inner` is vertically centred when it fits (`margin-block: auto` in a flex column) and top-aligned when it overflows. Padding is 32px top and 72px bottom (room for the dots).
- **"↓ more" hint:** a pill fixed at the slide's bottom centre, above the dots. It is visible only while the slide has more content below (`scrollTop + clientHeight < scrollHeight - 8`).

## 4. Slides and responsive grids

Same 10 slides, titles, icons, sections, tones and legacy anchors as v1 (`src/data/slides.ts`, unchanged).

| Slide | ≥ 1200px | 640–1199px | < 640px |
|---|---|---|---|
| 3 Top posts | 4 columns | 2 | 1 |
| 7 Events (7) | 4 columns | 2 | 1 |
| 8 Videos (6) + photography | 3 columns | 2 | 1 |
| 9 Beyond Work (3 + education) | 4 columns | 2 | 1 |
| 1, 2, 4–6, 10 | single card | single card | single card |

## 5. Navigation controls

- **Dots:** a horizontal row, centred at the bottom of the deck (fixed, 16px above its bottom edge), on all sizes. These are 10 links (`href="#slide-N"`) of 12px circles, white with an ink border; the current one is filled ink with `aria-current="true"`. A label pill shows on hover/focus at ≥ 640px. The row has a white pill background with an ink border so it stays readable on every tone.
- **Arrows:** ‹ › round buttons (`aria-label="Previous slide"` / `"Next slide"`) at the deck's left and right edges, vertically centred, shown at ≥ 640px only. The previous arrow is hidden on slide 1 and the next on slide 10.
- **Tabs:** link to their section's first slide; `aria-current` marks the current slide's section (none on slide 1).
- Without JS: the dots and tabs work as anchors. The counter and arrows are not shown.

## 6. Behaviour

- **Current slide:** `round(deck.scrollLeft / deck.clientWidth)`, clamped to 0..9. When it changes:
  - update the counter, dots, tabs and arrow visibility;
  - `history.replaceState` to `#slide-N` (not during the initial deep-link landing);
  - schedule the live announcement "Slide N of 10: {title}" 400ms after the slide settles;
  - reset the newly arrived slide's `scrollTop` to 0.
- **Go to slide i:** `deck.scrollTo({ left: i * deck.clientWidth, behavior })`, where `behavior` is `'auto'` under reduced motion and `'smooth'` otherwise.
- **Swipe and horizontal trackpad:** native scroll-snap.
- **Vertical wheel** (on the deck, not inside a `<dialog>`):
  - If the current slide can still scroll in the wheel's direction, the browser scrolls it natively and the accumulator resets.
  - Otherwise `deltaY` accumulates (normalised: `deltaMode` 1 ×16, 2 × slide height). At |accumulated| ≥ 50, move one slide in the sign's direction, reset, and ignore wheel input for 700ms (cooldown).
  - `preventDefault` is called only when consuming the wheel at an edge.
- **Keys** (all ignored while a `<dialog>` is open, while focus is in an `INPUT/TEXTAREA/SELECT/VIDEO/IFRAME`, or with Ctrl/Alt/Meta held):
  - `ArrowRight` → next slide, `ArrowLeft` → previous slide, `Home` → first, `End` → last.
  - `PageDown`, `Space` → **at the slide's bottom edge**, next slide; otherwise native (scroll inside the slide).
  - `PageUp`, `Shift+Space` → **at the slide's top edge**, previous slide; otherwise native.
  - `Space` / `Shift+Space` are left native when focus is on `A/BUTTON/SUMMARY`.
  - `ArrowUp` / `ArrowDown`: always native (scroll inside the slide).
- **Deep links:** on load, if `location.hash` is `#slide-N` or a legacy section id, scroll the deck to that slide with `behavior: 'auto'`. Hash rewriting starts after that landing.
- **Focus:** when a slide is reached by key, arrow, dot or tab, focus moves to the slide (`tabindex="-1"`, `preventScroll: true`) so subsequent ↓ / PageDown scroll it.
- **Reveal animations:** unchanged mechanism; the IntersectionObserver's default root sees slides entering horizontally and cards entering on vertical inner scroll.
- **Modals:** Lightbox and VideoModal unchanged; wheel and keys are ignored while either is open.
- **No JS:** the deck scrolls horizontally (visible scrollbar), dots and tabs are anchors, and the slides are full-screen with inner scroll. No arrows, counter, wheel mapping or key handling.
- **Print:** the deck becomes `display: block; height: auto; overflow: visible`, slides become `height: auto; overflow: visible; break-before: page`, and `html, body` scroll normally. The dots, arrows and hints are hidden.

## 7. Architecture

```
src/data/slides.ts          unchanged (SLIDES, SECTION_FIRST_SLIDE, Tone, SectionId)
src/lib/slidenav.ts         counterText (kept); currentSlideX, navKey (new map), wheelStep (new); stepTarget/currentSlide removed
src/components/Slide.astro  panel: tabindex=-1, inner scroll, "↓ more" hint, data-slide-scroll on the panel
src/components/Deck.astro   <main class="deck" data-deck> + slot + ‹ › arrow buttons
src/components/SlideNav.astro bottom dot row + the single navigation script
src/components/TabBar.astro fixed; counter + live region (unchanged markup)
src/pages/index.astro       TabBar + Deck(10 Slides) + SlideNav + Lightbox + VideoModal + Reveal
src/styles/global.css       deck/slide rules replace the v1 vertical-snap rules; print rules
```

Helper signatures:

```ts
export function currentSlideX(scrollLeft: number, deckWidth: number, count: number): number;
export type NavAction = 'next' | 'prev' | 'first' | 'last' | 'page-next' | 'page-prev';
// page-next / page-prev: PageDown/Space or PageUp/Shift+Space, which act only at the slide's edge (the caller checks)
export function navKey(e: KeyLike, focus: { tag: string; dialogOpen: boolean }): NavAction | null;
export function wheelStep(deltaY: number, canScrollDown: boolean, canScrollUp: boolean, accumulated: number):
  { consume: false; accumulated: 0 } | { consume: true; accumulated: number; move: -1 | 0 | 1 };
```

## 8. Testing

- **Unit:**
  - `currentSlideX`: rounding and clamping.
  - `navKey`: the full map, including Space on A/BUTTON/SUMMARY, ignored tags, dialog and modifiers.
  - `wheelStep`: native when the slide can scroll; accumulates at an edge; moves at ±50; direction sign.
  - `Slide`: panel attributes and the hint.
  - `Deck`: the arrow buttons and their labels.
  - `SlideNav`: 10 bottom dots.
- **Browser (390×844 and 1440×900):**
  - Every slide's box equals the deck's box (±1px); `document.scrollingElement.scrollHeight <= innerHeight`; no page-level horizontal overflow.
  - → / ← / End / Home move slides, and the counter, dot `aria-current`, tab `aria-current` and `#slide-N` update. History length is unchanged.
  - Arrows move slides (desktop); prev is hidden on slide 1 and next on slide 10; the arrows are hidden on phones.
  - Clicking a dot moves to its slide.
  - Wheel down at a short slide's bottom → next slide; wheel down mid-content on a tall slide → inner scroll, same slide.
  - PageDown on a tall slide scrolls inside, and at the bottom moves on.
  - The "↓ more" hint is visible on a tall slide and hidden at its end.
  - Arriving on a slide resets its `scrollTop` to 0.
  - A touch swipe (phone) moves exactly one slide.
  - `/#slide-4` and `/#events` open on slides 4 and 7.
  - Keys and wheel do nothing while the lightbox or video modal is open.
  - No JS: 10 full-deck slides, the deck is horizontally scrollable, the tabs navigate, and the counter and arrows are hidden.
  - Reduced motion: End reaches `10 / 10` within 300ms.
  - Live region: one announcement after End.
  - Existing suites pass, with selectors and vertical-scroll assumptions updated.
- Lighthouse mobile ≥ 90 in all four categories; screenshots of every slide at 390 and 1440 reviewed.
