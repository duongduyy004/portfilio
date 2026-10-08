# Slideshow Layout — Design

**Date:** 2026-10-08
**Status:** Approved in brainstorming, pending written-spec review
**Builds on:** `2026-10-08-portfolio-design.md` (content, components, visual system unchanged unless stated)

## 1. Purpose

Turn the one-page portfolio into a **slideshow-style browsing experience** for recruiters: each part of the portfolio fills the screen as a slide, and the page snaps slide to slide as you scroll or swipe. It is still one link and one document. Nothing is hidden behind clicks, and it works on phones and without JavaScript.

Out of scope: a presenter/deck mode (one slide at a time, fullscreen), animated slide transitions, horizontal carousels.

## 2. Decisions

| Topic | Decision |
|---|---|
| Purpose | Browsing as slides (not interview presenting) |
| Tall content | Split into ~10 slides; gentle (`proximity`) snapping, so taller slides scroll normally |
| Look | Alternating full-bleed background per slide |
| Technique | Native CSS scroll-snap + small plain-JS navigation layer |

## 3. Slides

Each slide is at least `100dvh` minus the tab bar height.

| # | id | Title (header) | Icon | Section | Tone | Content |
|---|---|---|---|---|---|---|
| 1 | `slide-1` | Thuy Anh Phi | 👋 | profile | lavender | `ProfileHeader` |
| 2 | `slide-2` | Top Posts · Careers page | 🔥 | top-posts | yellow | `HighlightCard` |
| 3 | `slide-3` | Top Posts | 🔥 | top-posts | mint | 4 × `PostCard` |
| 4 | `slide-4` | Experience · MOR Software | 📌 | experience | pink | `RoleCard` (mor) |
| 5 | `slide-5` | Experience · Future Media | 📌 | experience | lilac | `RoleCard` (future-media) |
| 6 | `slide-6` | Experience · Meraces | 📌 | experience | lavender | `RoleCard` (meraces) |
| 7 | `slide-7` | Events | 🎉 | events | yellow | `EventGrid` |
| 8 | `slide-8` | Videos | 🎬 | videos | mint | 6 × `VideoEmbed` + photography |
| 9 | `slide-9` | Beyond Work | 🌱 | beyond-work | pink | 3 × `ActivityCard` + `EducationList` |
| 10 | `slide-10` | Contact | 💌 | contact | lilac | `ContactCard` |

- Slide 1 has no separate slide header: `ProfileHeader` already carries the `<h1>`. Every other slide has an `<h2>` header with the gradient-ring icon.
- Tones cycle lavender → yellow → mint → pink → lilac. Token values: lavender `#F3EFFF` (= `--bg`), yellow `#FFE45C`, mint `#3DDCB0`, pink `#FF7AB6`, lilac `#CBBEFF`. Text placed directly on a tone (slide headers, the counter) is `--ink`, which passes WCAG AA on every tone. Muted (`--muted`) text appears only inside white cards, because it fails AA on mint. Cards stay white with ink borders.
- **Legacy anchors:** `#top-posts`, `#experience`, `#events`, `#videos`, `#beyond-work` and `#contact` remain valid, as alias anchors on each section's first slide.

## 4. Navigation

- **Tab bar (kept, all sizes):** Top Posts · Experience · Events · Videos · Beyond Work · Contact. Each tab links to its section's first slide (`#slide-2`, `#slide-4`, `#slide-7`, `#slide-8`, `#slide-9`, `#slide-10`). The tab of the current slide's section has `aria-current="true"` (Experience stays current across slides 4–6, Top Posts across 2–3). On slide 1 no tab is current.
- **Counter:** at the right end of the tab bar, `NN / 10` (zero-padded, e.g. `04 / 10`), `aria-live="polite"`.
- **Dot rail (≥ 900px only):** 10 dots fixed to the right edge, vertically centred. Each dot is a link to its slide with an accessible name equal to the slide title, and a visible label on hover/focus. The current dot is filled ink and has `aria-current="true"`. Hidden below 900px.

## 5. Behaviour

- **Snap:** `html { scroll-snap-type: y proximity; scroll-padding-top: var(--tabbar-h); }`, `.slide { scroll-snap-align: start; }`.
- **Keyboard:** all slide keys are ignored while focus is in a form field, `<video>` or `<iframe>`, while a `<dialog>` is open, or when a modifier (Ctrl/Alt/Meta) is held. `Space` / `Shift+Space` are also ignored while focus is on a link, button or `<summary>`, because Space activates them there. The arrow, Page and Home/End keys still work after clicking a tab or dot.
  - `ArrowDown`, `PageDown`, `Space`: next slide.
  - `ArrowUp`, `PageUp`, `Shift+Space`: previous slide.
  - `Home` / `End`: first / last slide.
  - If the current slide's bottom is below the viewport, "next" scrolls by one viewport (minus the tab bar) within the slide instead of jumping. "Previous" mirrors this when the slide's top is above the snap line.
  - The handler calls `preventDefault()` only when it acts.
- **Current slide:** the slide whose top is the last one at or above 40% of the viewport height. At page bottom it is the last slide. It drives the counter, the dots, the tab `aria-current` and `history.replaceState` to `#slide-N` (no history entries; no update while the page is still loading a hash).
- **Deep links:** loading `#slide-N` or a legacy section anchor lands on that slide (native anchor behaviour + `scroll-padding-top`).
- **Reveal animations:** unchanged mechanism (`data-reveal` + IntersectionObserver), so they play as each slide arrives.
- **Reduced motion:** snapping stays; programmatic scrolls use `behavior: 'auto'`; reveal animations stay off (existing behaviour).
- **No JavaScript:** snapping, backgrounds, full-height slides and tab anchors work. The counter, dots and keyboard shortcuts are absent (the dot rail and counter are not rendered visible without JS).
- **Print:** `scroll-snap-type: none`, `min-height: auto`, `break-before: page` on every slide after the first.
- **Modals:** Lightbox and VideoModal unchanged. Slide keys are ignored while either is open.

## 6. Architecture

```
src/data/slides.ts          SLIDES: Slide[]; SECTION_FIRST_SLIDE map; TONES
src/components/Slide.astro  <section id="slide-N" class="slide slide--{tone}" data-slide data-section aria-labelledby>
src/components/SlideNav.astro  dot rail + the one tracking/keyboard script
src/components/TabBar.astro  counter element added; tracking script removed; tabs from SECTION_FIRST_SLIDE
src/pages/index.astro        10 <Slide>s composed from slides.ts + profile.ts
src/styles/global.css        snap rules, tone tokens, print rules
src/components/Section.astro deleted
```

- `slides.ts` exports:
  ```ts
  type Tone = 'lavender' | 'yellow' | 'mint' | 'pink' | 'lilac';
  interface SlideDef { n: number; id: string; title: string; icon: string; section: SectionId | 'profile'; tone: Tone; anchor?: string }
  export const SLIDES: SlideDef[];   // the table in §3; anchor = legacy section id on a section's first slide
  export const SECTION_FIRST_SLIDE: Record<SectionId, string>; // derived from SLIDES
  ```
  `SectionId` is the union of the existing `SECTIONS` ids in `types.ts`.
- `Slide.astro` props: `SlideDef` fields plus `hideHeader?: boolean` (slide 1). The legacy anchor is an empty `<span id={anchor} class="slide__anchor">` at the top of the slide.
- `SlideNav.astro` props: `{ slides: { n: number; title: string }[] }`.
- Existing components are reused unchanged. `profile.ts` is unchanged.

## 7. Testing

- **Unit (Vitest):**
  - `SLIDES` has 10 entries in the §3 order and tones cycle as specified.
  - `SECTION_FIRST_SLIDE` equals `{ top-posts: slide-2, experience: slide-4, events: slide-7, videos: slide-8, beyond-work: slide-9, contact: slide-10 }`.
  - `Slide` renders the id, `data-section`, the tone class and an `h2` labelling the section (no `h2` with `hideHeader`).
  - `TabBar` hrefs follow `SECTION_FIRST_SLIDE`.
- **Browser (Playwright, mobile 390 + desktop 1440):**
  - 10 `[data-slide]` in order, each ≥ viewport − tab bar tall.
  - `End` → counter `10 / 10`; `Home` → `01 / 10`.
  - `PageDown` from slide 1 → slide 2 current, counter `02 / 10`, URL hash `#slide-2`.
  - On a slide taller than the viewport, `ArrowDown` scrolls within it first (current slide unchanged).
  - The Experience tab is `aria-current` on slides 4, 5 and 6.
  - Dot click → slide current (desktop); dots hidden on mobile.
  - `/#slide-4` and `/#events` load on the right slide.
  - With JS off: all slides visible and full height; tab anchors navigate.
  - Reduced motion: keyboard navigation uses instant scrolling.
  - Space while the video modal is open does not change slide.
  - Existing suites pass; selectors assuming six `main section` elements and the old tab-highlight tests are updated.
- Lighthouse mobile ≥ 90 in all four categories; screenshots of every slide at 390 and 1440 reviewed.
