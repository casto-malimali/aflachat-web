# AflaChat Web — UI/UX Audit

> Scope audited: `app/(site)/*` (home, services, contact, download, privacy, terms),
> `app/admin/*`, and `components/*` (Navbar, Footer, ChatWidget, PlayStoreButton,
> LanguageContext, ThemeContext). Stack: **Next.js 16 · React 19 · Tailwind CSS v4 · lucide-react 0.577**.

---

## 0. Cross-cutting issues (fix these first — they affect every page)

### 0.1 🔴 BLOCKER — 62 broken/dangling utility classes from `remove-dark-mode.js`
A regex in `remove-dark-mode.js` stripped `dark:` prefixes but left orphaned
fragments. These are **invalid Tailwind classes that render as nothing**, so the
intended styling silently disappears.

Confirmed counts (`grep`):

| File | Broken tokens |
|---|---|
| `app/(site)/privacy/page.tsx` | 25 |
| `components/Navbar.tsx` | 13 |
| `app/(site)/contact/page.tsx` | 12 |
| `app/(site)/terms/page.tsx` | 8 |
| `app/(site)/page.tsx` | 4 |

Examples (real, from the source):
```html
<!-- Navbar.tsx:32 -->
class="bg-white/90 -zinc-950/90 backdrop-blur-lg ... border-b border-zinc-100 -zinc-800/50 py-3"
<!-- page.tsx:133 -->
class="py-20 px-6 bg-zinc-50 -zinc-950/50 border-t border-zinc-100 -zinc-800"
<!-- contact/page.tsx:33 -->
class="p-4 bg-accent -primary/20 text-primary rounded-2xl ..."
```
`-zinc-950/90`, `-zinc-800/50`, `-primary/20`, `-secondary`, `-zinc-400` etc. are
not utilities — they do nothing. **Action:** delete every dangling `-color` token.
See `04-IMPLEMENTATION.md §1`.

### 0.2 🔴 Dead dark-mode infrastructure shipped to users
- `ThemeProvider` (`components/ThemeContext.tsx`) is mounted in `app/layout.tsx`,
  writes `localStorage.theme`, toggles `.dark` on `<html>` — but **no toggle UI exists**
  and **all `dark:` variants were stripped**. It is 53 lines of dead code that still
  runs on every page load and can flash an inert state.
- `tailwind.config.js` sets `darkMode: "class"` and `content: ["./app/**", ...]`, but
  this is **Tailwind v4**, configured via `@theme` in `app/globals.css` (`@import "tailwindcss"`).
  The JS config is **not loaded** (no `@config` directive). Its `content` paths are also
  stale (`app/page.tsx` — the file now lives at `app/(site)/page.tsx`).
- `remove-dark-mode.js` itself references pre-route-group paths (`app/page.tsx`,
  `app/contact/page.tsx`). It is stale and destructive — **delete it.**

**Decision required:** ship light-only (remove the dead infra) *or* reintroduce real
dark mode via tokens. The design system in `02-DESIGN-SYSTEM.md` provides both palettes
so dark mode becomes a 1-line opt-in later. Recommendation: **light-only now**, dark via tokens later.

### 0.3 🟠 Typography never actually renders as designed
`app/layout.tsx:6-10` documents that fonts are *not* loaded via `next/font` (offline-build
concern). `globals.css` only declares CSS variables:
```css
--font-poppins: "Poppins", "Segoe UI", system-ui, sans-serif;
```
There is **no `@font-face` and no webfont download**, so on any machine without Poppins/Inter
installed (i.e. almost all visitors) every heading falls back to Segoe UI / system. The
"premium serif/Poppins" identity is invisible in production. Two token names also compete:
`@theme` defines `--font-heading`, but components hardcode `var(--font-poppins,...)`.
**Action:** self-host Poppins + Inter as static `.woff2` via `next/font/local` (no network
at build) — see `04-IMPLEMENTATION.md §3`.

### 0.4 🟠 Inline `style={{fontFamily}}` repeated 20+ times
Every heading carries `style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}`.
This is unmaintainable and bypasses the design system. Replace with a single `font-heading`
utility (Tailwind `font-*` token) + a `<Heading>` primitive.

### 0.5 🟠 Accessibility gaps present on every page
- **No skip-to-content link**; `<main>` has no `id`.
- **No global `:focus-visible` ring** — keyboard focus is nearly invisible on links/cards.
- **No `prefers-reduced-motion`** guard — `animate-fade-up`, `animate-bounce`, `animate-pulse`
  always run.
- Decorative hero images use descriptive `alt` ("Maize field") while sitting behind a 60%
  scrim as pure background — should be `alt=""` + `role` handled, or moved to CSS background.

### 0.6 🟡 No design primitives / component library
There is no `Button`, `Card`, `Container`, `Section`, `Badge`, `Input`, or `Heading`
component. Patterns are copy-pasted: the "eyebrow pill", the "`w-12 h-1` accent rule", the
"numbered card", the gradient blur. This is the single biggest scalability risk. See
`02-DESIGN-SYSTEM.md §Component Library`.

---

## 1. Home — `app/(site)/page.tsx`

**Current:** Full-bleed hero (bg image + `bg-zinc-900/60` scrim) → How It Works (3 numbered
cards) → quote banner → Benefits (checklist + image card) → Trust bar (5 icon tiles).

| Area | Findings |
|---|---|
| **UX** | • "Learn how" button (`:40`) has **no `href`/`onClick`** — dead CTA. • No anchor/scroll to the "How It Works" section it implies. • Hero is `min-h-[92vh]` with no scroll affordance; the second CTA competes with PlayStore badge with no clear hierarchy. • Stat cards are `hidden lg:flex` — mobile/tablet users lose the "24/7 · Free · Bilingual" proof entirely. |
| **UI** | • `text-gradient` is defined as `@apply text-primary` (a *solid* color) — the "gradient" word is a misnomer; the headline "Protection" looks flat, not the intended accent. • Trust-bar section has the broken `-zinc-950/50` / `-zinc-800` artifacts (0.1). • Inconsistent vertical rhythm: sections use `py-28`, `py-20`, `h-80`, `py-24` with no scale. • Emerald-on-emerald text (`text-emerald-200`/`text-emerald-100`) on `bg-primary/60` is **low contrast**. |
| **A11y** | • Decorative bg images have content `alt`. • Numbered "01/02/03" are `text-zinc-100` decorative numerals with no contrast concern (good) but the `<h3>` order is fine. • Dead button is not focusable to anything. |
| **Mobile** | • Stat proof hidden. • Hero text `text-5xl` is fine; CTAs stack (good). • Trust grid `grid-cols-2` ok. |

**Redesign**
1. Make "Learn how" a real anchor: `<a href="#how">` with smooth scroll (already `scroll-smooth`).
2. Show a **condensed stat row** on mobile (inline under CTAs) instead of hiding it.
3. Replace `.text-gradient` with a real gradient (`bg-gradient-to-r from-secondary to-emerald-300 bg-clip-text text-transparent`) — see design system.
4. Add a `<Section>` wrapper enforcing a single spacing scale (`py-20 md:py-28`).
5. Add a subtle scroll-down chevron (respecting reduced-motion).

---

## 2. Services — `app/(site)/services/page.tsx`

**Current:** Image hero banner → responsive 3-col grid of 5 service cards (icon + number + title + desc).

| Area | Findings |
|---|---|
| **UX** | • 5 cards in a 3-col grid leaves a lopsided 2-card last row — fine, but no visual anchor/CTA at the end ("Talk to the assistant" → open ChatWidget would convert). • Cards are non-interactive (no link), yet styled with strong `hover:` affordances implying clickability — a **deceptive affordance**. |
| **UI** | • Clean, but identical pattern to Home's "How It Works" with slightly different paddings (`p-8`, icon `w-14` vs `w-12`) — should share one `<FeatureCard>`. • Hero overlay `bg-zinc-900/60` + `text-zinc-300` is acceptable AA. |
| **A11y** | • Hero `<h1>` good. • Cards: decorative numerals fine. • Hover-only feedback (no focus state because not focusable). |
| **Mobile** | • Grid collapses to 1 col — good. Hero `h-[50vh] min-h-[340px]` ok. |

**Redesign:** Extract `<FeatureCard>`; either make cards real links to a detail/anchor or
remove the clickable affordance; add a closing CTA band that opens the ChatWidget
(`window.dispatchEvent(new Event("aflachat:open"))` — see chat spec).

---

## 3. Contact — `app/(site)/contact/page.tsx`

| Area | Findings |
|---|---|
| **UX** | • 🔴 **Form is fake** (`handleSubmit` just `setSubmitted(true)` then resets after 5s) — no network call, no persistence, messages are silently lost. Either wire it (Formspree/Resend/backend `/api/contact`) or remove it. • No inline validation messaging beyond native `required`. • No loading/disabled state on submit. |
| **UI** | • 12 broken-class artifacts (`bg-accent -primary/20`, `text-zinc-600 -zinc-400`, `bg-zinc-50 -zinc-800`). Inputs intended a tinted bg + dark variant; currently just `bg-zinc-50`. • `mailto:` href has a leading space: `href="mailto: chogop@..."` (`:38`) — breaks in some clients. |
| **A11y** | • 🔴 **Labels not associated** with inputs — `<label>` has no `htmlFor`, inputs have no `id`. Screen readers can't link them. • `placeholder` is used as the only persistent hint on some fields. • No `aria-live` on the success state swap. |
| **Mobile** | • `text-lg` inputs + `px-6 py-4` are touch-friendly (good). • Two-column collapses well. |

**Redesign:** Use **React Hook Form + Zod**; associate labels (`htmlFor`/`id`); add error
text with `aria-describedby`; real submission with pending/success/error states announced
via `aria-live="polite"`; fix the `mailto:` space.

---

## 4. Download — `app/(site)/download/page.tsx`

| Area | Findings |
|---|---|
| **UX** | • Strong page — hero + animated phone mockup + 3 steps. • The decorative phone mockup is `hidden lg:flex` (fine). • Single clear CTA (PlayStore) — good focus. |
| **UI** | • The phone mockup hardcodes a chat preview that **duplicates** the real ChatWidget styling but with different bubble radii/colors — they should share tokens so the preview matches the product. • `bg-primary/80` over the photo is heavy; emerald text on it is low-ish contrast. |
| **A11y** | • Steps numerals decorative (ok). • Phone mockup is purely decorative but built from many divs with text — consider `aria-hidden`. |
| **Mobile** | • Mockup hidden on mobile (ok). Requirements checklist reads well. |

**Redesign:** Drive the mockup from the same bubble tokens as ChatWidget; `aria-hidden` the
mockup; keep as-is otherwise (best page in the set).

---

## 5. Privacy & Terms — `app/(site)/privacy|terms/page.tsx`

| Area | Findings |
|---|---|
| **UI/UX** | • Privacy has **25** broken-class artifacts (the worst file) — large chunks of intended styling are dead. • Long-form legal text with (likely) no max prose width / TOC / anchor links. |
| **A11y** | • Needs proper heading hierarchy and a readable measure (`max-w-prose`, ~65ch). |

**Redesign:** Wrap body in a `prose` container (`max-w-[68ch]`, `leading-relaxed`), add a
sticky section TOC on desktop, "last updated" stamp, and fix all artifacts.

---

## 6. ChatWidget — `components/ChatWidget.tsx`  (the flagship, on the feature branch)

Solid foundation: bilingual, online/offline fallback, suggestions, typing dots, session
handling via `lib/chatApi.ts`. But several real gaps vs. modern AI chat UX:

| Area | Findings |
|---|---|
| **UX** | • **No streaming** — answers appear in one block (`sendChat` returns full text). • **No copy / regenerate / feedback (👍👎)** actions, yet the admin dashboard *charts* `feedback.up/down` and `unanswered` — the data plumbing exists but the widget never collects it. • **No markdown rendering** — answers shown as `whitespace-pre-wrap` plain text; lists/bold/links/code arrive raw. • No conversation history/persistence (refresh wipes the thread). • No "new chat" reset. • Suggestions vanish after first turn and never reappear contextually except from server `res.suggestions`. |
| **UI** | • Fixed `w-[22rem] h-[34rem]` panel — on small phones it's `max-w-[calc(100vw-2.5rem)]` but **not full-screen**, so it floats awkwardly; modern mobile chat goes full-bleed. • Launcher and panel both `z-50` (could collide); no entrance/exit transition on the panel beyond `animate-fade-up`. • Disclaimer banner repeats on every render at top of scroll area (should be once / collapsible). |
| **A11y** | • 🔴 **No focus management** — opening the panel doesn't move focus to the input; closing doesn't return focus to the launcher. • **No `Escape` to close.** • **No focus trap** within the open dialog. • Panel is not a labelled dialog (`role="dialog"` / `aria-modal` / `aria-labelledby` missing). • **No `aria-live`** region — screen readers don't announce incoming AI messages. • Typing indicator has no text alternative. |
| **Mobile** | • Should become a full-screen sheet under `sm`. • Input row is fine; needs `enterKeyHint="send"` and to avoid iOS zoom (`text-base`/16px on input). |

**Redesign:** Full spec in `03-CHAT-REDESIGN.md` (dialog semantics, focus trap, streaming,
markdown, copy/regenerate/feedback wired to the backend the admin already reads, mobile sheet).

---

## 7. Navbar — `components/Navbar.tsx`

| Area | Findings |
|---|---|
| **UX** | • Language dropdown does **not close on outside click or `Escape`** (only on selection or re-click). • Active route is not indicated (`aria-current`/styling). • Mobile menu doesn't lock body scroll and has no transition. |
| **UI** | • 13 broken-class artifacts (the scrolled state `-zinc-950/90`, hovers `-secondary`). The intended scrolled/dark treatments are dead. • Brand uses Playfair serif var that isn't loaded → falls back. |
| **A11y** | • Dropdown button missing `aria-expanded`/`aria-haspopup`. • Mobile toggle missing `aria-expanded`/`aria-controls` and an accessible name. • Menu not keyboard-dismissable. |
| **Mobile** | • Works, but no scroll lock + no focus handling when open. |

**Redesign:** `aria-current` active links; `aria-expanded`/`aria-controls` on toggles;
close lang menu on outside-click + `Escape`; lock scroll + animate mobile sheet; use a
real `<DropdownMenu>` primitive.

---

## 8. Footer — `components/Footer.tsx`

| Area | Findings |
|---|---|
| **UX/UI** | • Clean. Social links **all point to `#`** except email (`Twitter/Facebook/Instagram` have no real URLs). Either wire real handles or remove. • Brand here uses `--font-poppins` while Navbar brand uses Playfair — **inconsistent brand lockup**. |
| **A11y** | • Social `<a>` have `aria-label` (good). `#` hrefs are focus traps with no destination. |

**Redesign:** Wire or remove dead socials; unify the brand lockup into a shared `<Brand>` component.

---

## 9. Admin dashboard — `app/admin/*` + `components/admin/*`

| Area | Findings |
|---|---|
| **UX** | • Functional analytics: KPI grid, trend line, donut, bar lists, quality panel. • Range toggle (7/30/90) only drives the trend, not the KPIs — users may expect all cards to follow the range. • `onAuthError` does `window.location.reload()` — a blunt UX (no inline "session expired / re-auth" state). |
| **UI** | • Uses a **different palette** (`gray-*`, `#0ea5e9`, `#8b5cf6`, `#ec4899`) than the marketing site's emerald system — two design languages in one product. Should adopt the shared tokens (or be an intentionally distinct "console" theme — pick one and document it). • Hand-rolled `LineChart/Donut/BarList` — fine for now; migrate to a charting lib if interactivity grows. |
| **A11y** | • Charts are SVG with (need to verify) no text alternative / table fallback. • KPI accent colors must meet contrast for the value text. |
| **Mobile** | • `grid-cols-2 lg:grid-cols-4` KPIs ok; chart panels need horizontal scroll guards. |

**Redesign:** Adopt a tokenized **console theme** (neutral surfaces + the brand emerald as
the single accent); make range control scope explicit; add `<figure>`/table fallbacks to charts;
replace hard reload with an inline re-auth panel.

---

## Priority Matrix

| Priority | Item | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Remove 62 broken `-color` class artifacts (§0.1) | S | High (restores intended styling) |
| 🔴 P0 | Delete dead dark-mode infra: `ThemeContext`, `tailwind.config.js`, `remove-dark-mode.js` (§0.2) | S | High (correctness, bundle) |
| 🔴 P0 | Contact form: associate labels + real submission OR remove (§3) | M | High (a11y + data loss) |
| 🔴 P0 | ChatWidget a11y: dialog role, focus trap, Esc, aria-live (§6) | M | High |
| 🟠 P1 | Self-host Poppres/Inter via `next/font/local` (§0.3) | S | High (brand finally renders) |
| 🟠 P1 | Design tokens + primitives (`Button/Card/Section/Container/Badge/Heading`) (§0.6) | M | High (scalability) |
| 🟠 P1 | Global focus-visible + reduced-motion + skip link (§0.5) | S | High (a11y) |
| 🟠 P1 | Fix dead CTAs: Home "Learn how", Footer socials (§1, §8) | S | Medium |
| 🟠 P1 | ChatWidget: markdown + copy/regenerate/feedback wired to backend (§6) | M | High |
| 🟡 P2 | Mobile: show hero stats; full-screen chat sheet (§1, §6) | M | Medium |
| 🟡 P2 | Navbar: aria-current, dropdown Esc/outside-click, scroll lock (§7) | S | Medium |
| 🟡 P2 | ChatWidget streaming responses (§6) | M | Medium |
| 🟢 P3 | Admin: tokenized console theme, chart a11y, range scope (§9) | M | Medium |
| 🟢 P3 | Legal pages: prose container + TOC (§5) | S | Low |

## Roadmap (phased)

- **Phase 0 — Correctness (½ day):** P0 artifact cleanup, delete dead infra, fix `mailto:` space & dead CTAs. No visual redesign, pure bug-fix; safe to ship immediately.
- **Phase 1 — Foundation (1–2 days):** `next/font/local`, `globals.css` token system, primitives, global a11y (focus/skip/reduced-motion). Refactor pages onto primitives.
- **Phase 2 — Chat flagship (2–3 days):** ChatWidget redesign per `03-CHAT-REDESIGN.md`.
- **Phase 3 — Forms & polish (1 day):** RHF+Zod contact form, Navbar a11y, mobile stats.
- **Phase 4 — Admin (1–2 days):** tokenized console theme, chart accessibility.
</content>
</invoke>
