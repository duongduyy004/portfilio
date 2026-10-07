# Thuy Anh Phi Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-page "Social Creator" portfolio site for Thuy Anh Phi (Employer Branding & Internal Communication), built with Astro and deployed to Vercel.

**Architecture:** Static Astro site. All content lives in one typed data file (`src/data/profile.ts`). Only `src/pages/index.astro` reads it and passes props to small, presentational `.astro` components. Interactivity (tab highlight, counters, lightbox, click-to-load video) is plain JS in component `<script>` blocks, and every one degrades to fully visible content without JS. Photos come out of the source `.pptx` through a one-off script and are optimised by `astro:assets`.

**Tech Stack:** Astro 5, TypeScript, `@fontsource/space-grotesk`, Vitest + Astro Container API (component tests), Playwright (browser tests), Python 3 + Pillow (media extraction), `ffmpeg-static` (video transcode), Lighthouse CLI.

**Spec:** `docs/superpowers/specs/2026-10-08-portfolio-design.md`

## Global Constraints

- Every number shown on the site must be one the deck states. Use the exact strings listed in Task 3.
- English only. No dark mode, blog, CMS, contact form or analytics.
- Colours (CSS custom properties in `src/styles/global.css`): `--bg #F3EFFF`, `--card #FFFFFF`, `--ink #16131F`, `--accent #7B5CFF`, `--pink #FF7AB6`, `--mint #3DDCB0`, `--yellow #FFE45C`, `--muted #5C5670`.
- Card motif: `border: 2px solid var(--ink)`, radius 16–22px, `box-shadow: 0 4px 0 var(--ink)`.
- Font: Space Grotesk 400/600/700, self-hosted via `@fontsource/space-grotesk`. No Google Fonts link.
- Mobile-first. 16px side gutter under 640px, content max-width 1100px, **no horizontal page scroll at 320px and up**.
- Accent colours are never used as text colour on white. All text meets WCAG AA.
- Components take data via props only. Only `index.astro` imports `profile.ts`.
- A missing URL never renders a dead `href`. It renders the "coming soon" state from Task 4.
- `.gitignore` already excludes `*.pptx`, `*.mov`, `.superpowers/`, `node_modules/`, `dist/`, `.astro/`, `.vercel/`. Keep it that way.
- Commit after every task. Each commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **No JavaScript** (blocked or failed): every section, every stat's final value and every role's full text (via `<details>`) must still be readable. Pinned by the e2e test `works without JS` in Task 11.
2. **Narrow phones (320px)** with long words like "Communication" and stats like "687,370": the page must not scroll sideways. Pinned by `no horizontal scroll` at 320/390/1440 in Task 11.
3. **Missing links** (most URLs are pending): cards must show "coming soon" and not be focusable as links. Pinned by the `linkState` unit test (Task 4) and the PostCard/VideoEmbed render tests (Tasks 6, 9).
4. **Reduced motion:** the counters must show final values immediately, with no count-up. Pinned by the e2e test `reduced motion shows final stats` in Task 11.
5. **Keyboard-only use of the lightbox:** Enter opens it, Esc closes it, and focus returns to the photo that opened it. Pinned by the e2e test `lightbox keyboard` in Task 11.

---

## File Map

```
astro.config.mjs            site URL, image service defaults
vitest.config.ts            getViteConfig() from astro/config
playwright.config.ts        webServer = `npm run preview`, projects: mobile 390, desktop 1440
package.json                scripts: dev, build, preview, check, test, test:e2e, media
scripts/extract_media.py    pptx → src/assets/media/*.{jpg,png}
scripts/transcode.mjs       deck videos → public/video/*.mp4 + posters
src/styles/global.css       tokens, reset, base typography, .card, .chip, .btn, .sr-only
src/layouts/Base.astro      <html>, <head> meta/OG, font import, global.css
src/data/types.ts           content types
src/data/profile.ts         all content
src/lib/stat.ts             parseStat()
src/lib/link.ts             linkState()
src/components/*.astro      one per spec component
src/pages/index.astro       composition
tests/unit/*.test.ts        Vitest (lib + data + component render)
tests/e2e/*.spec.ts         Playwright
public/favicon.svg, public/og-image.png, public/video/*
```

---

### Task 1: Scaffold Astro project with tooling, tokens and base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro` (temporary "Hello" body), `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; ogImage?: string }`, default slot = page body. CSS classes `.card`, `.chip`, `.chip--pink|--mint|--yellow`, `.btn`, `.btn--primary`, `.sr-only`, `.container`. npm scripts `build`, `check`, `test`, `test:e2e`.

- [ ] **Step 1:** Run `npm create astro@latest . -- --template minimal --typescript strict --install --no-git --skip-houston`. The folder isn't empty (pptx/mov/docs), so answer "continue" if prompted. Then run `npm i @fontsource/space-grotesk` and `npm i -D vitest @playwright/test ffmpeg-static lighthouse`, then `npx playwright install chromium`.
- [ ] **Step 2:** Write `tests/unit/smoke.test.ts` to render `Base.astro` through the Container API (`experimental_AstroContainer`) with `title: "T"`, and assert the HTML contains `<title>T</title>`, `lang="en"` and `name="viewport"`.
- [ ] **Step 3:** Run `npx vitest run tests/unit/smoke.test.ts`. Expected: FAIL (Base.astro missing).
- [ ] **Step 4:** Implement `global.css` with the Global Constraints tokens and classes, and `Base.astro` with charset, viewport, title, description and canonical (`Astro.site`). Add OG/Twitter tags (`og:title`, `og:description`, `og:image` defaulting to `/og-image.png`, `og:type=website`, `twitter:card=summary_large_image`), import `@fontsource/space-grotesk/{400,600,700}.css`, and set `body { background: var(--bg); color: var(--ink) }`. In `astro.config.mjs` set `site: "https://thuyanhphi.vercel.app"`. Add the `vitest.config.ts` that uses `getViteConfig`. Add scripts `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"check": "astro check"` (run `npm i -D @astrojs/check typescript` if prompted).
- [ ] **Step 5:** Run `npx vitest run` → PASS. Run `npm run check && npm run build` → 0 errors.
- [ ] **Step 6:** Commit with the message `chore: scaffold Astro project with tokens and base layout`.

---

### Task 2: Media extraction and video transcode

**Files:**
- Create: `scripts/extract_media.py`, `scripts/transcode.mjs`, `tests/unit/media.test.ts`
- Output (committed): `src/assets/media/*`, `public/video/*`

**Interfaces:**
- Produces: these exact files in `src/assets/media/` (later tasks import them by these names):

| Output name | Deck media | Use |
|---|---|---|
| `portrait.png` (keep alpha, max 800px) | image7.png | avatar |
| `mor-fb-insights.jpg` | image18.png | Top Posts highlight |
| `mor-content-library.jpg` | image19.png | Top Posts |
| `mor-trip-group.jpg` | image20.jpeg | Events / MOR |
| `mor-trip-street.jpg` | image21.jpeg | Events |
| `mor-birthday.jpg` | image23.png | Events / MOR |
| `mor-sports-mc.jpg` | image24.JPG | Events / MOR |
| `mor-pickleball.jpg` | image25.JPG | Events |
| `fm-trend-sheet.jpg` | image29.png | Future Media |
| `fm-yt-stats.jpg` | image30.png | Future Media |
| `fm-tiktok-1.jpg` | image31.png | Future Media / Videos |
| `fm-tiktok-2.jpg` | image32.png | Future Media / Videos |
| `fm-tiktok-3.jpg` | image36.png | Videos |
| `fm-boysday-1.jpg` | image37.png | Events |
| `fm-boysday-2.jpg` | image38.png | Events |
| `meraces-yt-stats.jpg` | image28.png | Meraces |
| `meraces-shorts.jpg` | image27.jpeg | Meraces |
| `meraces-jobad.jpg` | image33.png | Meraces |
| `meraces-threads.jpg` | image34.png | Meraces |
| `buddy-1.jpg` | image43.jpeg | Beyond Work |
| `buddy-2.jpg` | image45.jpeg | Beyond Work |
| `ndc-club.jpg` | image47.jpeg | Beyond Work |
| `hallym.jpg` | image10.jpeg | Beyond Work |
| `insta-vocab.jpg` | image57.jpeg | Videos & Creative |
| `photo-1.jpg`, `photo-2.jpg` | image50.png, image52.png | Videos & Creative |

All JPGs: RGB, longest side ≤ 2000px, quality 85. `public/video/edits.mp4` + `edits.jpg` come from `media1.mp4` (poster image56.jpeg). `public/video/dance.mp4` + `dance.jpg` come from `media2.mov` (poster image60.png).

- [ ] **Step 1:** Write `tests/unit/media.test.ts` asserting that each output name above exists, that every `.jpg` is ≤ 2000px on its longest side (read the size with `image-size`, installed via `npm i -D image-size`), and that each `public/video/*.mp4` exists and is ≤ 10 MB (10\_485\_760 bytes).
- [ ] **Step 2:** Run `npx vitest run tests/unit/media.test.ts` → FAIL (files missing).
- [ ] **Step 3:** Implement `scripts/extract_media.py <pptx> <outdir>` with the table above as a dict. Use `zipfile` and Pillow, flattening RGBA to RGB on white for JPGs only. Implement `scripts/transcode.mjs <pptx>`, which unzips the two videos to a temp dir and runs `ffmpeg-static` with `-vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart`. If the output exceeds 10 MB, retry with `-crf 32`. It also writes the two posters at ≤ 1280px. Add the npm script `"media": "python scripts/extract_media.py \"Portfolio Phi Thuy Anh - Internal Communication (2026).pptx\" src/assets/media && node scripts/transcode.mjs \"Portfolio Phi Thuy Anh - Internal Communication (2026).pptx\""`.
- [ ] **Step 4:** Run `npm run media`, then `npx vitest run tests/unit/media.test.ts` → PASS.
- [ ] **Step 5:** Commit the scripts, the test and the generated media: `feat: extract deck media and transcode videos`.

---

### Task 3: Content types and profile data

**Files:**
- Create: `src/data/types.ts`, `src/data/profile.ts`, `tests/unit/profile.test.ts`

**Interfaces:**
- Consumes: media filenames from Task 2 (import as `ImageMetadata`).
- Produces (`types.ts`):
```ts
export interface Stat { value: string; label: string }            // value e.g. "+267%"
export interface Photo { src: ImageMetadata; alt: string; caption?: string }
export interface Post { title: string; views: string; image: Photo; url?: string; detail?: string }
export interface Role { id: string; company: string; title: string; dates?: string;
  bullets: string[]; metrics: Stat[]; photos: Photo[]; story: string[] }
export interface EventItem { title: string; org: string; caption: string; photo: Photo }
export interface Video { title: string; kind: 'youtube' | 'tiktok' | 'file' | 'link';
  url?: string; src?: string; poster: Photo | string; caption?: string }
export interface Activity { title: string; role: string; text: string; photo?: Photo }
export interface Education { school: string; detail: string; years: string }
export interface Contact { email: string; phone: string; linkedin?: string; cv?: string }
export interface Profile { name: string; headline: string; bio: string; skills: string[];
  avatar: Photo; stats: Stat[]; highlight: { title: string; stats: Stat[]; text: string };
  posts: Post[]; roles: Role[]; events: EventItem[]; videos: Video[];
  activities: Activity[]; education: Education[]; contact: Contact }
export const SECTIONS = [
  { id: 'top-posts', label: 'Top Posts' }, { id: 'experience', label: 'Experience' },
  { id: 'events', label: 'Events' }, { id: 'videos', label: 'Videos' },
  { id: 'beyond-work', label: 'Beyond Work' }, { id: 'contact', label: 'Contact' },
] as const;
```
- Produces: `export const profile: Profile` in `profile.ts`.

- [ ] **Step 1:** Write `tests/unit/profile.test.ts` with these exact assertions:
  - `profile.name === "Thuy Anh Phi"`, `profile.headline === "Employer Branding & Internal Communication"`
  - `profile.stats.map(s => s.value)` equals `["6M+", "+267%", "160K"]`
  - `profile.highlight.stats.map(s => s.value)` equals `["687,370", "+209%", "49,110", "+135%", "+50%"]`
  - `profile.posts.map(p => p.views)` equals `["160K", "93K", "66K", "54K+"]`
  - `profile.roles.map(r => r.id)` equals `["mor", "future-media", "meraces"]`
  - Metric values include `"1,451"`, `"446,065"`, `"6M+"` on future-media and `"128,552"`, `"100+"`, `"5"` on meraces
  - `profile.contact.email === "thuyanhphi.work@gmail.com"`, `profile.contact.phone === "083-883-1319"`
  - Every `url` anywhere in `profile` (walk the object recursively) is either `undefined` or starts with `https://`
  - Every `Photo.alt` is a non-empty string
- [ ] **Step 2:** Run `npx vitest run tests/unit/profile.test.ts` → FAIL.
- [ ] **Step 3:** Write `types.ts` as above. Write `profile.ts` using copy from the deck (slides 2–27), tightened for the web. Role bullets come from slides 4/10/15. `story` comes from the case-study slides 5–9 / 11–14 / 16–18. Put events as listed in spec §3.4, activities as in §3.6 and education as in §3.6. The deck has no photo for the Meraces Happy Hour/Halloween/Year-End events, so they stay out of `events` (an `EventItem` requires a photo) and are covered in the Meraces role's `story` text instead. Leave every unknown URL as `url: undefined, // TODO(link)`, plus `linkedin` and `cv`. Leave `dates` out (TODO(dates)).
- [ ] **Step 4:** Run the test → PASS, then `npm run check` → 0 errors.
- [ ] **Step 5:** Commit: `feat: add typed profile content from deck`.

---

### Task 4: Pure helpers `parseStat` and `linkState`

**Files:**
- Create: `src/lib/stat.ts`, `src/lib/link.ts`, `tests/unit/lib.test.ts`

**Interfaces:**
- Produces: `parseStat(value: string): { prefix: string; number: number; decimals: number; suffix: string; grouping: boolean } | null` and `linkState(url?: string): { href: string; external: true } | { href: null; label: 'coming soon' }`

- [ ] **Step 1:** Write the tests:
  - `parseStat("+267%")` → `{prefix:"+", number:267, decimals:0, suffix:"%", grouping:false}`
  - `parseStat("6M+")` → `{prefix:"", number:6, decimals:0, suffix:"M+", grouping:false}`
  - `parseStat("687,370")` → `{prefix:"", number:687370, decimals:0, suffix:"", grouping:true}`
  - `parseStat("54K+")` → number 54, suffix "K+"
  - `parseStat("13.3K")` → number 13.3, decimals 1, suffix "K"
  - `parseStat("Hallym")` → `null`
  - `linkState(undefined)` and `linkState("")` → `{href:null, label:"coming soon"}`
  - `linkState("https://youtube.com/x")` → `{href:"https://youtube.com/x", external:true}`
  - `linkState("javascript:alert(1)")` → coming soon (only `https:` is accepted)
- [ ] **Step 2:** Run `npx vitest run tests/unit/lib.test.ts` → FAIL.
- [ ] **Step 3:** Implement both. `parseStat` uses the regex `/^([+\-]?)([\d,]+(?:\.\d+)?)(.*)$/`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add stat parsing and link-state helpers`.

---

### Task 5: Section, TabBar, StatCounter, ProfileHeader

**Files:**
- Create: `src/components/Section.astro`, `TabBar.astro`, `StatCounter.astro`, `ProfileHeader.astro`, `tests/unit/header.test.ts`

**Interfaces:**
- Consumes: `Stat`, `Photo`, `SECTIONS` (Task 3); `parseStat` (Task 4).
- Produces:
  - `Section` props `{ id: string; title: string; icon: string /* emoji */ }`, slot = body. Renders `<section id aria-labelledby>` with `<h2>` inside a gradient-ring icon header. Adds `scroll-margin-top` equal to the tab bar height.
  - `TabBar` props `{ sections: readonly {id,label}[] }`. Renders a sticky `<nav aria-label="Sections">` containing links to `#id`. It is horizontally scrollable on its own (`overflow-x:auto`) without making the page scroll. Its script uses an IntersectionObserver to set `aria-current="true"` on the visible section's link.
  - `StatCounter` props `{ stat: Stat }`. Renders `<span data-count>` holding the **final** value text plus the label. Its script, only when `matchMedia('(prefers-reduced-motion: reduce)')` is false and the element first intersects, animates from 0 to the final value over 1.2s using `parseStat`. It leaves values where `parseStat` returns null untouched.
  - `ProfileHeader` props `{ name, headline, bio, skills: string[], avatar: Photo, stats: Stat[], cvUrl?: string }`. Shows the avatar via `<Image>` in a gradient ring, the name as `<h1>`, the headline, bio, chips cycling yellow/mint/pink, the stats as StatCounters, a Contact button (`href="#contact"`), and a Download CV button only when `cvUrl` is set.

- [ ] **Step 1:** Write `header.test.ts` (Container API) asserting the following:
  - ProfileHeader renders exactly one `<h1>` containing "Thuy Anh Phi"
  - ProfileHeader renders "6M+", "+267%" and "160K" in the server HTML
  - ProfileHeader renders no "Download CV" when `cvUrl` is undefined
  - TabBar renders six links with `href="#top-posts"` … `href="#contact"`
  - Section renders `id="events"` and an `h2` whose id matches `aria-labelledby`
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the four components per the Interfaces block.
- [ ] **Step 4:** Run → PASS. Run `npm run check` → 0 errors.
- [ ] **Step 5:** Commit: `feat: add profile header, tab bar, stat counter, section`.

---

### Task 6: PostCard and Top Posts highlight

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/HighlightCard.astro`, `tests/unit/posts.test.ts`

**Interfaces:**
- Consumes: `Post`, `Stat`, `Photo`; `linkState`.
- Produces: `PostCard` props `{ post: Post }`. It is a `.card` with an image (`<Image>`, `widths=[320,640]`, lazy loading), the title and a "▶ {views}" badge. When `linkState` gives an href, the whole card is an `<a target="_blank" rel="noopener">` with an accessible name of "{title}, {views} views, opens in new tab". Otherwise it is an `<article>` with a muted "Link coming soon" footer and no `<a>`. `HighlightCard` props `{ title: string; stats: Stat[]; text: string; image: Photo }`.

- [ ] **Step 1:** Tests: a PostCard with `url: undefined` contains no `<a` and contains "Link coming soon". A PostCard with `url: "https://facebook.com/p/1"` contains `href="https://facebook.com/p/1"` and `rel="noopener"`. HighlightCard renders all 5 highlight values.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add post and highlight cards`.

---

### Task 7: RoleCard

**Files:**
- Create: `src/components/RoleCard.astro`, `tests/unit/role.test.ts`

**Interfaces:**
- Consumes: `Role`.
- Produces: `RoleCard` props `{ role: Role }`. It is a `.card` "pinned post" with a 📌 label, company, title, dates when present, `<ul>` bullets, a metrics row of `StatCounter`s and a photo strip of up to 3 `<Image>`s. Then comes `<details><summary>Read the full story</summary>{story paragraphs}</details>`.

- [ ] **Step 1:** Tests: rendering the MOR role contains a `<details>` and a `<summary>`, every `story` paragraph's text, and a `<li>` count equal to `bullets.length`. No dates text appears when `dates` is undefined.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add role card with expandable story`.

---

### Task 8: EventGrid and Lightbox

**Files:**
- Create: `src/components/EventGrid.astro`, `src/components/Lightbox.astro`, `tests/unit/events.test.ts`

**Interfaces:**
- Consumes: `EventItem`.
- Produces:
  - `EventGrid` props `{ events: EventItem[] }`. A responsive grid (1 column, 2 from 640px, 3 from 960px). Each item is a `<button type="button" data-lightbox data-full={optimised large src} data-caption>` wrapping a thumbnail plus a caption chip. Without JS the button still shows the image and caption.
  - `Lightbox` (no props, rendered once per page). A `<dialog id="lightbox">` with `<img>`, a caption and a close button labelled "Close". Its script opens it on a `[data-lightbox]` click via `showModal()`, closes on Esc (native), backdrop click or the close button, and returns focus to the opening button on `close`. Use `getImage()` from `astro:assets` in EventGrid to produce `data-full` at width 1600.

- [ ] **Step 1:** Tests: EventGrid with 3 events renders 3 `button[data-lightbox]`, each with a non-empty `alt`. Lightbox renders a `<dialog` containing a button with the accessible name "Close".
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add event grid and lightbox`.

---

### Task 9: VideoEmbed

**Files:**
- Create: `src/components/VideoEmbed.astro`, `tests/unit/video.test.ts`

**Interfaces:**
- Consumes: `Video`; `linkState`.
- Produces: `VideoEmbed` props `{ video: Video }`. By `kind`:
  - `file`: `<video controls preload="none" playsinline poster>` with an MP4 `<source>`.
  - `youtube` with a URL: a poster button "Play {title}". On click, the script replaces it with an `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen title>`. The id is parsed from `watch?v=`, `youtu.be/` or `/shorts/` URLs.
  - `tiktok` with a URL: the same pattern with iframe `https://www.tiktok.com/player/v1/{numeric id}`.
  - `link`, or youtube/tiktok without a URL: a poster card that links out when `linkState` gives an href, otherwise "coming soon".
  - Without JS, youtube/tiktok posters fall back to `<a href={url}>`, because the button sits inside a `<noscript>`-safe pattern: render an `<a>` and let the script upgrade it to a button.

- [ ] **Step 1:** Tests: `kind:'file'` renders `<video` with `preload="none"` and `src="/video/dance.mp4"`. `kind:'youtube', url:'https://youtu.be/abc123'` server HTML contains no `<iframe` and does contain `href="https://youtu.be/abc123"` plus `data-embed="https://www.youtube-nocookie.com/embed/abc123?autoplay=1"`. `kind:'tiktok', url: undefined` contains "coming soon" and no `<a`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement (put the id parsing in `src/lib/embed.ts` as `embedUrl(kind, url): string | null` and unit-test it in the same file).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add click-to-load video embed`.

---

### Task 10: ActivityCard, EducationList, ContactCard

**Files:**
- Create: `src/components/ActivityCard.astro`, `EducationList.astro`, `ContactCard.astro`, `tests/unit/contact.test.ts`

**Interfaces:**
- Consumes: `Activity`, `Education`, `Contact`; `linkState`.
- Produces: `ActivityCard {activity}`, `EducationList {items: Education[]}`, and `ContactCard {contact: Contact}`. ContactCard shows a "Let's work together" heading, `mailto:` and `tel:+84838831319` links (convert the leading 0 to +84 and strip dashes), LinkedIn via `linkState`, and the CV button only when `cv` is set.

- [ ] **Step 1:** Tests: ContactCard renders `href="mailto:thuyanhphi.work@gmail.com"` and `href="tel:+84838831319"`, with no LinkedIn `<a` when `linkedin` is undefined. EducationList renders "Foreign Trade University" and "2021 – 2025".
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add activity, education and contact components`.

---

### Task 11: Compose the page and add browser tests

**Files:**
- Modify: `src/pages/index.astro`
- Create: `tests/e2e/page.spec.ts`

**Interfaces:**
- Consumes: everything above. Section order and icons: top-posts 🔥, experience 📌, events 🎉, videos 🎬, beyond-work 🌱, contact 💌. Videos section = `profile.videos` grid followed by the Instagram vocab and photo items.

- [ ] **Step 1:** Write `page.spec.ts` (run against `npm run build && npm run preview`):
  - `sections in order`: the ids of `main section` equal the `SECTIONS` order.
  - `tab highlight`: clicking the "Events" tab means `#events` is in the viewport and that tab has `aria-current="true"`.
  - `no horizontal scroll`: at widths 320, 390 and 1440, `document.documentElement.scrollWidth <= window.innerWidth`.
  - `works without JS` (`javaScriptEnabled: false`): text "+267%", "687,370" and "6M+" are visible. Opening the first `summary` reveals its story text. Each video poster is a link or a "coming soon" card.
  - `reduced motion shows final stats` (`reducedMotion: 'reduce'`): immediately after load, the hero stat reads "+267%".
  - `lightbox keyboard`: focus the first event button and press Enter, and the dialog is open. Press Escape, the dialog is closed, and the active element is that same button.
  - `video click-to-load`: no `iframe` exists on load. When a YouTube URL is present in the data, clicking its poster creates an iframe whose `src` contains `youtube-nocookie.com`. If no YouTube URL exists yet, `test.skip` with the reason "no youtube url in profile yet".
- [ ] **Step 2:** Run `npm run test:e2e` → FAIL (page still "Hello").
- [ ] **Step 3:** Implement `index.astro`: `<Base>` → `<ProfileHeader>` → `<TabBar>` → `<main>` with six `<Section>`s → `<Lightbox />`. Use responsive grids per section, with Top Posts at 1/2/4 columns.
- [ ] **Step 4:** Run `npm run test:e2e` → all PASS (the video test may SKIP with the stated reason). Run `npx vitest run` → PASS.
- [ ] **Step 5:** Take screenshots with Playwright at 390 and 1440 (`page.screenshot({fullPage:true})` to `.superpowers/shots/`) and look at them. Fix any overlap, clipping or uneven spacing, then re-run the e2e tests.
- [ ] **Step 6:** Commit: `feat: compose portfolio page with browser tests`.

---

### Task 12: Favicon, OG image, Lighthouse and link check

**Files:**
- Create: `public/favicon.svg`, `public/og-image.png`, `scripts/og.mjs`, `tests/e2e/meta.spec.ts`

**Interfaces:**
- Consumes: `Base.astro` OG props (Task 1).

- [ ] **Step 1:** Write `meta.spec.ts`. The `og:image` content ends with `/og-image.png` and that URL returns 200 with `image/png`. `link[rel=icon]` resolves with 200. Every `a[href^="http"]` on the page has `rel` containing `noopener`, and there is no `a[href=""]` or `a[href="#"]`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Create `favicon.svg` (the letters "TA" on a `#7B5CFF` rounded square). Create `scripts/og.mjs`, which uses Playwright to screenshot a 1200×630 render of the profile header on `--bg`, and saves `public/og-image.png`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Lighthouse: run `npm run preview` in the background, then `npx lighthouse http://localhost:4321 --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --chrome-path="<playwright chromium path>" --chrome-flags="--headless" --output=json --output-path=.superpowers/lh.json`. Expected: every category ≥ 0.90. If any falls below, fix the cause it reports (usually image sizes or contrast) and re-run.
- [ ] **Step 6:** Commit: `feat: add favicon, OG image and meta checks`.

---

### Task 13: Deploy to GitHub and Vercel (needs the user)

`gh` isn't installed on this machine, and publishing is outward-facing, so **stop and confirm with the user before each external action.**

- [ ] **Step 1:** Ask the user for the GitHub account/repo name and whether the repo should be public or private. Ask them to create it, or to install `gh` and run `! gh auth login`.
- [ ] **Step 2:** `git remote add origin <url>`, then `git push -u origin main` (rename the branch to `main` first if needed).
- [ ] **Step 3:** Ask the user to import the repo in Vercel (Framework preset: Astro), or to run `! npx vercel login` and then `npx vercel --prod`.
- [ ] **Step 4:** Verify the live URL returns 200 and shows the `<h1>` "Thuy Anh Phi". If the final domain differs from `thuyanhphi.vercel.app`, update `site` in `astro.config.mjs`, then rebuild and push.
- [ ] **Step 5:** Report the live URL plus the list of `TODO(link)`/`TODO(dates)` items still pending (`git grep -n "TODO("`).
