# Thuy Anh Phi — Portfolio Website Design

**Date:** 2026-10-08
**Status:** Approved in brainstorming, pending written-spec review

## 1. Purpose

A personal portfolio website for **Thuy Anh Phi**, used when applying for **Employer Branding / Internal Communication** roles. Built by a developer on her behalf.

- **Audience:** recruiters and hiring managers clicking a link from a CV, email or LinkedIn, often on mobile, typically spending ~30 seconds.
- **Success:** within 30 seconds a visitor sees (1) headline results, (2) real work samples, (3) an obvious way to make contact.
- **Language:** English only.
- **Content source:** `Portfolio Phi Thuy Anh - Internal Communication (2026).pptx` (28 slides). Every number on the site must be stated in the deck; no invented metrics.

## 2. Decisions

| Topic | Decision |
|---|---|
| Visual style | **C · Social Creator** (social-profile metaphor, neo-brutalist cards) |
| Navigation | One long scrolling page; sticky tab bar jumps to sections |
| Work samples | Link/embed real public posts; links provided later, placeholders until then |
| Stack | **Astro** static site |
| Hosting | **Vercel**, auto-deploy from a GitHub repo |

Out of scope (YAGNI): dark mode, blog, CMS, contact form, analytics, multi-language.

## 3. Page structure

Sticky tab bar labels: **Top Posts · Experience · Events · Videos · Beyond Work · Contact**.

1. **Profile header**
   - Avatar: portrait cut-out (deck `image7.png`) in a pink→purple→mint gradient ring.
   - Name "Thuy Anh Phi"; subtitle "Employer Branding & Internal Communication".
   - Bio line (adapted from deck slide 2).
   - Skill chips: Content strategy · Events & MC · Video editing · Recruitment.
   - Stat counters: **6M+** views · **+267%** reach · **160K** top post.
   - Buttons: **Contact** (scrolls to Contact), **Download CV** (PDF in `public/`; hidden until a PDF is provided).

2. **Top Posts** — MOR Software Careers Facebook page
   - Highlight card: 687,370 total views (+209%), 49,110 engagements (+135%), +50% messaging conversations, no paid promotion.
   - Post cards: 160K, 93K, 66K, 54K+ views. The best post: 13.3K engagements, 100K unique viewers, 99 new followers.
   - Each card links to the real post when a URL is supplied.

3. **Experience** — "pinned posts", one card per role, newest first:
   - **MOR Software JSC** — Employer Branding Executive (slides 4–9)
   - **Future Media Technology Investment Co., Ltd** — Social Media Channel Administrator (slides 10–14)
   - **Meraces Limited Company** — Content Marketing Intern (slides 15–18)

   Card shows: company, role, dates (if supplied), 3–4 bullets, a metrics row, a photo strip. A `<details>` expander reveals the full case-study text.

4. **Events** — photo grid with captions: Ha Long company trip (3 branches, 3 days), Hanoi 8th anniversary, Internal Sports Games (MC), Boy's Day (Future Media), Meraces Happy Hour / Halloween / Year-End Party. Tap opens a lightbox.

5. **Videos & Creative** — YouTube/TikTok embeds (lazy, click-to-load), her personal edits, dance video, link to Instagram vocabulary page.

6. **Beyond Work** — FTU Buddy Program; NDC Music Club (Head of Event Communications); Education: Foreign Trade University, International Business Administration (2021–2025); Hallym University exchange, English Language & Literature (2022).

7. **Contact** — "Let's work together" card: thuyanhphi.work@gmail.com (mailto), 083-883-1319 (tel), LinkedIn (placeholder until supplied).

Copy is taken from the deck and tightened for the web.

## 4. Visual system

- **Colours:** background `#F3EFFF`; cards `#FFFFFF`; ink `#16131F`; primary accent `#7B5CFF`; chips/highlights pink `#FF7AB6`, mint `#3DDCB0`, yellow `#FFE45C`; muted text `#5C5670`.
- **Card motif:** 2px ink border, 16–22px radius, solid offset shadow `0 4px 0 #16131F`.
- **Type:** Space Grotesk (400/600/700), self-hosted via `@fontsource`.
- **Layout:** mobile-first; 1 column on phone, 2–4 column grids from tablet up; max content width ~1100px; 16px side gutter on mobile; no horizontal scroll (the tab bar scrolls horizontally on its own).
- **Contrast:** all text meets WCAG AA. Accent colours sit behind ink text and are never used as text colour on white.

## 5. Behaviour

- Sticky tab bar; active tab tracks the visible section (IntersectionObserver).
- Stat counters count up once on first view; skipped under `prefers-reduced-motion`.
- Experience expanders use native `<details>`/`<summary>` (no JS required).
- Video embeds: poster thumbnail + play button; iframe injected only on click.
- Lightbox: native `<dialog>`; closes on Esc, backdrop click or close button; keyboard focus is managed.
- All interactive behaviour is plain JS in small Astro `<script>` blocks, with no UI framework.

## 6. Architecture

```
src/
  data/profile.ts        # single source of truth for all content (typed)
  components/
    ProfileHeader.astro
    TabBar.astro
    StatCounter.astro
    PostCard.astro
    RoleCard.astro
    EventGrid.astro
    VideoEmbed.astro
    Lightbox.astro
    ContactCard.astro
    Section.astro         # section wrapper: id, heading, gradient-ring icon
  layouts/Base.astro      # <head>, meta/OG tags, fonts, global CSS
  pages/index.astro       # composes sections from profile.ts
  styles/global.css       # tokens (CSS custom properties) + base styles
  assets/media/           # deck images, optimised by astro:assets at build
public/
  favicon.svg, og-image.png, cv.pdf (when supplied), video/*.mp4 + posters
scripts/
  extract-media.py        # one-off: pulls selected media out of the .pptx
```

- **Data contract:** `profile.ts` exports typed objects (`Profile`, `Stat`, `Post`, `Role`, `EventItem`, `Video`, `Activity`, `Contact`). Optional `url` fields: when absent, the component renders a muted, non-clickable "link coming soon" state instead of a dead link.
- **Components** receive data through props only and never import `profile.ts` directly; only `index.astro` does.
- **Placeholders** are explicit: `url: undefined` plus a `// TODO(link)` comment, so the outstanding items are easy to grep.

## 7. Media pipeline

- `scripts/extract-media.py` copies the chosen deck images (by media filename) into `src/assets/media/` with descriptive names.
- Photos go through `astro:assets` `<Image>`/`<Picture>`: AVIF/WebP, responsive `srcset`, lazy-loaded below the fold, and explicit dimensions to prevent layout shift.
- Videos: `Media1.mov` and the deck's embedded videos are transcoded with ffmpeg to H.264 MP4 (≤ 720p, target ≤ 10 MB each) plus a JPEG poster, then placed in `public/video/`. Long-form work is linked or embedded from YouTube/TikTok rather than self-hosted.
- `.gitignore` excludes `*.pptx`, `*.mov`, `.superpowers/`, `node_modules/`, `dist/`.

## 8. SEO and sharing

- `<title>` "Thuy Anh Phi — Employer Branding & Internal Communication"; meta description; canonical URL.
- Open Graph and Twitter card tags with a 1200×630 `og-image.png` (profile card style) so links preview well on LinkedIn, Zalo and email.

## 9. Testing and verification

- `astro check` (types) and `astro build` must pass with no errors.
- Lighthouse (mobile) on the production build: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
- Screenshots at 390px and 1440px reviewed visually: no overflow, no overlap, no horizontal scroll.
- Link check: every `href` is either valid or deliberately in the "coming soon" state.
- Keyboard pass: tab order, focus visibility, lightbox focus trap and Esc.

## 10. Deployment

- Initialise a git repo; push to a GitHub repository (the account will be confirmed with the user before creating it).
- Connect the repo to Vercel (Astro preset, static output). Every push to `main` triggers a redeploy.
- Default URL `*.vercel.app`; a custom domain is optional later.

## 11. Open inputs (non-blocking)

These have placeholders until supplied:

- URLs for the top Facebook posts, the YouTube channel, TikTok videos and the Instagram vocabulary page
- LinkedIn URL
- CV PDF
- Employment dates for each role (the deck does not state them)
