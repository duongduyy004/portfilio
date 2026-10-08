# Modern Motion — Design

**Date:** 2026-10-08
**Status:** Approved in brainstorming, pending written-spec review
**Builds on:** `2026-10-08-slideshow-design.md` (v2 horizontal deck) and `2026-10-08-portfolio-design.md`

## 1. Purpose

Make the deck feel modern and alive with subtle, layered motion, without hurting readability, speed (Lighthouse ≥ 90, target 100) or accessibility. All seven effect families are in scope, kept subtle.

## 2. Decisions

| Topic | Decision |
|---|---|
| Scope | All effects (§3), subtle |
| Technique | Native CSS (scroll-driven animations, keyframes) + ~2 KB plain JS each for tilt, magnet and odometer; no libraries |
| Reduced motion | No animation at all; everything renders final |
| Unsupported browsers | Progressive: only the scroll-linked transition needs `animation-timeline: view()` |

## 3. Effects

### 3.1 Swipe-linked slide transitions
- Driven by each slide's horizontal visibility in the deck: `animation-timeline: view(inline)` on `.slide__inner` (the slide itself is the subject; its content animates).
- **Exit** (the slide moving out of view): `scale` 1 → 0.94, `opacity` 1 → 0.3, `filter: blur(0 → 4px)`. The blur applies only at ≥ 640px.
- **Entry:** the slide header translates from `40px` (in the direction of travel) to 0 over the first 40% of entry. Cards (`.slide__inner > :not(.slide__head)`) do the same from `80px`, so they trail the header.
- **Background wash:** each slide has a `::before` gradient from its tone to the next tone at its right edge, 48px wide, so tones blend across the boundary.
- Wrapped in `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`.

### 3.2 Heading reveal
- Applies to each slide's `<h2>` and the profile `<h1>`. Words are split at build time into `<span class="word" style="--w:N">word</span>`, with real spaces kept between spans.
- Keyframes: from `opacity: 0; filter: blur(8px); translate: 0 0.4em` to the final state, 600ms `cubic-bezier(.2,.7,.2,1)`, delay `calc(var(--w) * 60ms)`.
- Triggered with the existing reveal mechanism: the heading carries `data-reveal="words"`, and the word animation runs when the heading gets `.is-in` under `html.reveal-on`. Without JS, or under reduced motion, the words are visible.
- Accessible name unchanged: the heading text content is identical, because spans don't alter text.

### 3.3 Card tilt and shine
- Cards with `data-tilt` (post, role, event, video, activity, highlight, contact) tilt toward the pointer:
  - `rotateX/rotateY` up to `--tilt-max`, 6° by default and 2° for role, highlight and contact cards (`data-tilt="2"`);
  - `perspective(900px)`;
  - easing back on `pointerleave` (300ms transition).
- **Shine:** a `::after` radial-gradient highlight (white at 35% opacity → transparent) centred at `--gx/--gy` (pointer %), visible only while hovered.
- Only when `matchMedia('(hover: hover) and (pointer: fine)')` matches and reduced motion is off.
- **Transform rules:** the tilt is applied only while the pointer is over the card, via the `.is-tilting` class: `transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry))`. While tilting, it replaces the card's existing hover lift (`a.post:hover` translateY). The reveal drop-in is unaffected, because it uses `animation-fill-mode: backwards` and has finished before any hover.

### 3.4 Magnetic controls
- `data-magnet` on the deck arrows, the profile Contact button, the contact-card buttons, tabs and dots.
- Within a 64px radius of the element's centre (plus its half-size), the element translates toward the pointer by `min(6px, distance falloff)`, and springs back on leave (250ms transition).
- Uses the `translate` property (not `transform`), so it composes with the existing hover transforms.
- Same pointer and reduced-motion gating as tilt.

### 3.5 Odometer stats
- `StatCounter` renders:
  - `<span class="sr-only">{value}</span>`;
  - `<span class="odo" aria-hidden="true">`, made of columns from `digitColumns(value)`: digits become a vertical strip `0…9` translated to `-digit × 1em`, and static characters render as-is;
  - the existing `data-count` attribute stays on a wrapper for tests.
- **Animation:** when the stat's slide arrives (`.is-in` on the nearest `[data-reveal]` ancestor, or the stat itself in view), each digit strip transitions from `translateY(0)` to its final offset over 1.2s `cubic-bezier(.2,.8,.2,1)`, staggered 70ms left to right.
- **Final state** is the CSS default (strips at their final offset). Animation starts from 0 only when JS adds `.odo--armed` and then `.odo--run`. No JS / reduced motion → final digits immediately.
- Replaces the count-up script in `StatCounter.astro`.

### 3.6 Ambient blobs
- Each slide gets `<div class="slide__blobs" aria-hidden="true"><span></span><span></span><span></span></div>`:
  - absolutely positioned behind `.slide__inner`, with `pointer-events: none`;
  - blobs are 40–60vmax circles in tone-derived colours (`color-mix` of the tone with white or ink), `filter: blur(60px)`, `opacity: .18`;
  - they drift with `translate` and `scale` keyframes on 22s, 26s and 30s loops, `alternate`.
- At < 640px, the third blob is hidden.
- Blobs must not lower text contrast: the text sits on white cards or on the tone with ink text; blob opacity is capped at 0.2.

### 3.7 Ticker
- New `Ticker.astro` at the bottom of slide 1's content. It is an ink band, 44px tall, with white text and items separated by `✦`.
- Items: each `profile.stats` entry as "{value} {label}", followed by each `profile.skills` entry.
- Content duplicated once for a seamless loop: `translateX(0 → -50%)`, linear, 30s, infinite. `animation-play-state: paused` on hover.
- `aria-hidden="true"` (all facts are already on the page).
- Under reduced motion it is a static, horizontally scrollable band (no animation).

## 4. Architecture

```
src/styles/motion.css        transitions (3.1), word reveal (3.2), tilt/shine styles (3.3), odometer (3.5), blobs (3.6), ticker (3.7)
src/lib/motion.ts            splitWords, digitColumns, tiltFor, magnetOffset (pure)
src/components/SplitWords.astro  props { text: string } → word spans (used inside h1/h2)
src/components/Ticker.astro  props { items: string[] }
src/components/Motion.astro  single script: tilt + shine + magnet
src/components/StatCounter.astro  odometer markup + arming script (replaces count-up)
src/components/Slide.astro   blob layer; <h2 data-reveal="words"><SplitWords text={title}/></h2>
src/components/ProfileHeader.astro  <h1 data-reveal="words"><SplitWords/></h1>
src/pages/index.astro        Ticker in slide 1; <Motion/>; data-tilt / data-magnet on wrappers where components can't take them
src/layouts/Base.astro       imports motion.css
```

Content components may gain `data-tilt` / `data-magnet` attributes only. Their content and layout are unchanged.

Helper signatures:

```ts
export function splitWords(text: string): string[];   // trims, collapses whitespace, keeps punctuation attached
export type OdoCol = { digit: number } | { static: string };
export function digitColumns(value: string): OdoCol[]; // '+267%' → [{static:'+'},{digit:2},{digit:6},{digit:7},{static:'%'}]
export function tiltFor(px: number, py: number, rect: { left: number; top: number; width: number; height: number }, max: number):
  { rx: number; ry: number; gx: number; gy: number }; // rx/ry in deg within ±max; gx/gy in % 0–100
export function magnetOffset(dx: number, dy: number, radius: number, max: number): { x: number; y: number }; // 0 beyond radius; |offset| ≤ max
```

## 5. Testing

- **Unit:**
  - `splitWords('Top Posts · Careers page')` → `['Top','Posts','·','Careers','page']`; empty and whitespace-only input → `[]`.
  - `digitColumns` for `+267%`, `6M+`, `687,370` (commas static) and `13.3K` (dot static).
  - `tiltFor`: centre → 0/0, 50/50; corners → ±max; clamps outside the rect.
  - `magnetOffset`: 0 beyond the radius, ≤ max inside, direction preserved.
  - `SplitWords` renders N word spans with `--w` indices.
  - `StatCounter` renders sr-only text equal to the value, plus an aria-hidden odometer.
  - `Ticker` is aria-hidden with items duplicated.
- **Browser (390 and 1440):**
  - Every slide heading has word spans and ends with opacity 1.
  - Odometer: after a slide arrives, each digit strip's computed `translateY` equals `-digit em`, and the sr-only text equals the stat.
  - Desktop: hovering a `[data-tilt]` card and moving gives a non-identity transform; leaving returns it to identity. Mobile: never tilted.
  - Desktop: the pointer near the next arrow gives `translate` ≠ 0 with |x|, |y| ≤ 6; far away gives 0.
  - The ticker exists in slide 1, is aria-hidden, and its animation is paused on hover.
  - Blobs exist in every slide, are aria-hidden, and have `pointer-events: none`.
  - Chromium: at a deck position halfway between slides 2 and 3, slide 2's `.slide__inner` computed scale is < 1.
  - Reduced motion: no running animations (`document.getAnimations()` has no running animations apart from finished ones); headings and stats are final.
  - No JS: headings and stats are visible and final.
  - All existing suites green.
- Lighthouse mobile ≥ 90 in all four categories (target: no regression from 100). Screenshots plus a mid-swipe capture reviewed.
