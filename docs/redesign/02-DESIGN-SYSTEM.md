# AflaChat — Design System

Builds on the existing emerald identity (`--color-primary #064e3b`, `--color-secondary #10b981`)
already in `app/globals.css`, formalized into a complete, accessible token set. Designed for
**Tailwind CSS v4** (`@theme` in CSS — no `tailwind.config.js`).

---

## 1. Color System

Brand stays agricultural/trust-forward (deep forest + emerald). All text/background pairings
below meet **WCAG AA (≥4.5:1 for body, ≥3:1 for large text/UI)**.

| Token | Light HEX | Dark HEX | Usage |
|---|---|---|---|
| `primary` | `#064e3b` | `#34d399` | Primary actions, brand, headings-on-light. *On dark, the deep green is too low-contrast for text, so the primary role shifts to emerald-400.* |
| `primary-hover` | `#053e2f` | `#6ee7b7` | Hover/active for primary buttons |
| `primary-foreground` | `#ffffff` | `#022c22` | Text/icon on primary fill |
| `secondary` | `#10b981` | `#10b981` | Accents, links, focus, highlights |
| `secondary-foreground` | `#022c22` | `#022c22` | Text on secondary fill (✅ dark green on emerald passes AA; **never white on emerald for small text**) |
| `accent` | `#ecfdf5` | `#064e3b` | Subtle tinted surfaces, icon chips |
| `accent-foreground` | `#064e3b` | `#a7f3d0` | Text on accent |
| `gold` | `#b7973c` | `#d4af52` | Rare premium accent (awards, badges) — use sparingly |
| `success` | `#16a34a` | `#22c55e` | Positive feedback, confirmations |
| `warning` | `#d97706` | `#f59e0b` | Cautions, offline banner |
| `error` | `#dc2626` | `#f87171` | Errors, destructive, "unanswered" |
| `info` | `#0ea5e9` | `#38bdf8` | Neutral info, "Messages" KPI |
| `background` | `#ffffff` | `#0a0a0a` | Page background |
| `surface` | `#fdfcf7` | `#171717` | Cards, panels (warm off-white) |
| `surface-2` | `#f5f4ef` | `#262626` | Raised/secondary surface, inputs |
| `border` | `#e7e5e0` | `#2a2a2a` | Hairlines, dividers, input borders |
| `border-strong`| `#d4d2cc` | `#3f3f46` | Emphasized borders, focus base |
| `foreground` | `#18181b` | `#fafafa` | Primary text |
| `muted-foreground` | `#6b7280` | `#a1a1aa` | Secondary text, captions, labels |

**Usage guidelines**
- **One accent at a time.** Emerald (`secondary`) is the interactive accent; forest (`primary`) is fills/brand. Don't introduce the admin's `#8b5cf6`/`#ec4899` into the marketing site.
- **Text on emerald** must be `secondary-foreground` (deep green), never white — white-on-`#10b981` is ~1.9:1 and fails. The current chat suggestion `hover:bg-secondary hover:text-white` (ChatWidget:239) violates this.
- **Gold** is decorative only, never for text on white (≈3:1, fails body).
- The current `.text-gradient = @apply text-primary` is a flat color → replace with the real gradient utility in §7.

### CSS variables — drop-in `@theme` (replaces current block in `app/globals.css`)
```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-primary: #064e3b;
  --color-primary-hover: #053e2f;
  --color-primary-foreground: #ffffff;
  --color-secondary: #10b981;
  --color-secondary-foreground: #022c22;
  --color-accent: #ecfdf5;
  --color-accent-foreground: #064e3b;
  --color-gold: #b7973c;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error:   #dc2626;
  --color-info:    #0ea5e9;

  /* Neutrals / surfaces */
  --color-background:   #ffffff;
  --color-surface:      #fdfcf7;
  --color-surface-2:    #f5f4ef;
  --color-border:       #e7e5e0;
  --color-border-strong:#d4d2cc;
  --color-foreground:   #18181b;
  --color-muted-foreground: #6b7280;

  /* Typography */
  --font-heading: "Poppins", "Segoe UI", system-ui, sans-serif;
  --font-body:    "Inter", "Segoe UI", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  /* Type scale (see §2) */
  --text-xs: 0.75rem;   --text-xs--line-height: 1rem;
  --text-sm: 0.875rem;  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;    --text-base--line-height: 1.5rem;
  --text-lg: 1.125rem;  --text-lg--line-height: 1.75rem;
  --text-xl: 1.25rem;   --text-xl--line-height: 1.75rem;
  --text-2xl: 1.5rem;   --text-2xl--line-height: 2rem;
  --text-3xl: 1.875rem; --text-3xl--line-height: 2.25rem;
  --text-4xl: 2.25rem;  --text-4xl--line-height: 2.5rem;
  --text-5xl: 3rem;     --text-5xl--line-height: 1.1;
  --text-6xl: 3.75rem;  --text-6xl--line-height: 1.05;
  --text-7xl: 4.5rem;   --text-7xl--line-height: 1.0;

  /* Radius (see §5) */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;

  /* Elevation (see §6) */
  --shadow-xs: 0 1px 2px 0 rgb(6 78 59 / 0.04);
  --shadow-sm: 0 1px 3px 0 rgb(6 78 59 / 0.06), 0 1px 2px -1px rgb(6 78 59 / 0.06);
  --shadow-md: 0 4px 12px -2px rgb(6 78 59 / 0.08), 0 2px 6px -2px rgb(6 78 59 / 0.06);
  --shadow-lg: 0 12px 28px -6px rgb(6 78 59 / 0.12), 0 6px 12px -6px rgb(6 78 59 / 0.08);
  --shadow-xl: 0 24px 48px -12px rgb(6 78 59 / 0.18);
}

/* Dark palette — opt-in later by adding `dark` class to <html>.
   Ship light-only for now (see audit §0.2); keep this block commented or behind a flag. */
@layer base {
  .dark {
    --color-primary: #34d399;
    --color-primary-hover: #6ee7b7;
    --color-primary-foreground: #022c22;
    --color-accent: #064e3b;
    --color-accent-foreground: #a7f3d0;
    --color-success:#22c55e; --color-warning:#f59e0b; --color-error:#f87171; --color-info:#38bdf8;
    --color-background:#0a0a0a; --color-surface:#171717; --color-surface-2:#262626;
    --color-border:#2a2a2a; --color-border-strong:#3f3f46;
    --color-foreground:#fafafa; --color-muted-foreground:#a1a1aa;
  }
}
```

---

## 2. Typography System

Self-host **Poppins** (headings) and **Inter** (body) — see `04-IMPLEMENTATION.md §3`.
Scale is a 1.20–1.25 modular scale, responsive (clamp where it matters).

| Role | Font | Size (rem/px) | Weight | Line-height | Tracking | Usage |
|---|---|---|---|---|---|---|
| Display / H1 | Poppins | `clamp(2.5rem, 6vw, 4.5rem)` | 700 | 1.05 | -0.02em | Hero headline |
| H2 | Poppins | `clamp(2rem, 4vw, 3rem)` | 700 | 1.1 | -0.02em | Section titles |
| H3 | Poppins | 1.5rem / 24 | 700 | 1.2 | -0.01em | Card titles |
| H4 | Poppins | 1.25rem / 20 | 600 | 1.3 | -0.01em | Sub-headings |
| H5 | Poppins | 1.125rem / 18 | 600 | 1.4 | 0 | Minor headings |
| H6 / Eyebrow | Inter | 0.75rem / 12 | 700 | 1 | 0.15em (uppercase) | Section eyebrows ("WELCOME") |
| Body-lg | Inter | 1.125rem / 18 | 400 | 1.7 | 0 | Hero subcopy, lead paragraphs |
| Body | Inter | 1rem / 16 | 400 | 1.6 | 0 | Default text |
| Body-sm | Inter | 0.875rem / 14 | 400 | 1.6 | 0 | Card descriptions |
| Label | Inter | 0.75rem / 12 | 700 | 1.2 | 0.1em (uppercase) | Form labels |
| Input | Inter | 1rem / 16 | 400 | 1.5 | 0 | **16px min — prevents iOS zoom** |
| Button | Inter | 0.875rem / 14 | 600 | 1 | 0.01em | Buttons |
| Caption | Inter | 0.75rem / 12 | 400 | 1.4 | 0 | Disclaimers, meta |
| Code | JetBrains Mono | 0.875rem / 14 | 400 | 1.6 | 0 | Chat code blocks |

Utility: replace all inline `style={{fontFamily}}` with `font-heading` / `font-body`
(now valid Tailwind tokens because they're in `@theme`). A `<Heading level={1..6}>` primitive
encapsulates size+weight+tracking.

---

## 3. Spacing System (4px base)

| Token | px | rem | Typical use |
|---|---|---|---|
| `0.5` | 2 | 0.125 | hairline nudge |
| `1` | 4 | 0.25 | icon-to-text gap |
| `2` | 8 | 0.5 | tight inner padding |
| `3` | 12 | 0.75 | chip padding |
| `4` | 16 | 1 | default gap, card inner (mobile) |
| `6` | 24 | 1.5 | card padding |
| `8` | 32 | 2 | card padding (lg), grid gap |
| `12` | 48 | 3 | sub-section gap |
| `16` | 64 | 4 | section padding (mobile) |
| `20` | 80 | 5 | section padding (tablet) |
| `28` | 112 | 7 | section padding (desktop) |

**Section rhythm rule:** every top-level section uses `py-16 md:py-20 lg:py-28` and content
is wrapped in `max-w-7xl mx-auto px-6`. Codify as `<Section>` + `<Container>` so the current
mix of `py-28/py-24/py-20/h-80` disappears.

---

## 4. (reserved)

## 5. Border Radius System

| Token | Value | Usage |
|---|---|---|
| `sm` | 8px | Inputs, small buttons, chips, code inline |
| `md` | 12px | Buttons, dropdowns, small cards |
| `lg` | 16px | Cards, image frames |
| `xl` | 24px | Feature cards, panels, chat bubbles |
| `2xl` | 32px | Hero image frames, large CTA cards |
| `full` | 9999px | Pills, avatars, icon buttons, FAB launcher |

The codebase currently uses `rounded-2xl`, `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-3xl`
interchangeably — collapse onto these 6 tokens.

## 6. Elevation System

Shadows are tinted with the brand green (`rgb(6 78 59 / α)`) for cohesion, not flat black.

| Level | Token | Usage |
|---|---|---|
| 0 | none | Flush surfaces, page bg |
| 1 | `shadow-xs` | Hairline cards at rest, inputs |
| 2 | `shadow-sm` | Resting cards, navbar (scrolled) |
| 3 | `shadow-md` | Hover state of cards, dropdowns |
| 4 | `shadow-lg` | Popovers, chat panel, sticky CTAs |
| 5 | `shadow-xl` | Modals, chat full-screen sheet, hero stat cards |

**Surface hierarchy:** `background` → `surface` (cards) → `surface-2` (inputs/insets) →
overlay (`bg-foreground/60` scrims). **Modal/chat** sits above a `bg-foreground/40 backdrop-blur-sm` overlay.

---

## 7. Utility & helper classes (`@layer`)

Replace the current ad-hoc helpers (`.glass`, `.text-gradient`, `.card-classic`, `.section-divider`):

```css
@layer components {
  .text-gradient {            /* real gradient, replaces @apply text-primary */
    @apply bg-gradient-to-r from-secondary to-emerald-300 bg-clip-text text-transparent;
  }
  .eyebrow {                  /* the repeated "WELCOME" pill */
    @apply inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase
           tracking-widest text-secondary bg-secondary/10 border border-secondary/20 rounded-full;
  }
  .rule-accent { @apply w-12 h-1 rounded-full bg-primary; }  /* the w-12 h-1 bar */
  .glass { @apply bg-surface/80 backdrop-blur-md border border-border shadow-sm; }
  .card  { @apply bg-surface border border-border rounded-xl shadow-sm; }
}

@layer base {
  :where(a, button, input, textarea, select, [tabindex]):focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }
}
```

---

## 8. Component Library Structure

Greenfield primitives layer (the app currently has **none**). Plain React + Tailwind
(no shadcn dependency required, but the API mirrors shadcn so you can swap in later).

```
components/
  ui/                      ← design-system primitives (new)
    Button.tsx             variants: primary | secondary | ghost | outline; sizes: sm|md|lg; loading; asChild
    Card.tsx               Card, CardHeader, CardBody, CardFooter
    Container.tsx          max-w-7xl mx-auto px-6
    Section.tsx            py-16 md:py-20 lg:py-28 + optional eyebrow/title/rule
    Heading.tsx            level 1-6 → font-heading + scale
    Text.tsx               size + tone (default|muted)
    Badge.tsx              the "eyebrow" pill + status badges
    Input.tsx / Textarea.tsx / Field.tsx   label+control+error, RHF-ready, a11y-wired
    FeatureCard.tsx        icon + number + title + desc (Home/Services share this)
    IconChip.tsx           accent square holding a Lucide icon
    DropdownMenu.tsx       Esc + outside-click + roving focus (Navbar lang switcher)
    Dialog.tsx             role=dialog, focus trap, Esc, scroll-lock (chat sheet, modals)
    Skeleton.tsx / Spinner.tsx
    Brand.tsx              logo + "AflaChat" lockup (unify Navbar+Footer)
  layout/
    Navbar.tsx  Footer.tsx
  chat/                    ← see 03-CHAT-REDESIGN.md
    ChatWidget.tsx  ChatLauncher.tsx  ChatPanel.tsx  MessageBubble.tsx
    MessageList.tsx  Composer.tsx  SuggestionChips.tsx  TypingIndicator.tsx  Markdown.tsx
  admin/                   ← existing; retheme onto tokens
lib/
  cn.ts                    clsx + tailwind-merge helper
  translations.ts  chatApi.ts  adminApi.ts
```

### Recommended dependencies
| Package | Why |
|---|---|
| `clsx` + `tailwind-merge` | `cn()` for variant composition (tiny) |
| `class-variance-authority` | typed variants for `Button`/`Badge` (optional) |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Contact form (audit §3) |
| `react-markdown` + `remark-gfm` + `rehype-sanitize` | Chat markdown (audit §6) — **sanitize is mandatory** since content is model-generated |
| `framer-motion` | Panel/sheet transitions, list animation (respects reduced-motion) |
| `@radix-ui/react-dialog` *(optional)* | Battle-tested focus trap if you don't hand-roll `Dialog` |

> Keep the bundle lean: the site is content-light and ships to low-bandwidth users in Tanzania.
> `framer-motion` and `react-markdown` should be **dynamically imported into the ChatWidget only**, not the global bundle.

---

## 9. Lucide Icon Mapping

Already on `lucide-react@0.577`. Standard usage: `size={20}` inline, `strokeWidth={2}` (1.75 for large
decorative), `aria-hidden` when paired with text, `aria-label` when icon-only.

| Domain / Action | Icon | Notes |
|---|---|---|
| Dashboard / Overview | `LayoutDashboard` | admin home |
| Analytics / Trend | `TrendingUp` / `BarChart3` / `LineChart` | KPI + charts |
| Users / Sessions | `Users` / `UserRound` | admin sessions |
| Profile | `CircleUser` | account |
| Settings | `Settings` / `SlidersHorizontal` | config vs filters |
| Notifications | `Bell` / `BellRing` | alerts |
| Messages / Chat | `MessageCircle` (launcher) · `MessagesSquare` (service) · `Bot` (assistant avatar) | already used |
| Calendar | `CalendarDays` | scheduling |
| Payments | `CreditCard` / `Wallet` | n/a now, reserved |
| Reports | `FileBarChart` / `FileText` | admin export |
| Documents | `FileText` / `Files` | legal pages |
| Tasks | `CircleCheckBig` (was `CheckCircle2`) | use one check icon everywhere |
| Search | `Search` | chat/conversation search |
| Filters | `Filter` / `SlidersHorizontal` | admin range |
| Send | `Send` ✓ | chat composer |
| Close | `X` ✓ | dialogs |
| Navigation menu | `Menu` ✓ / `ChevronDown` ✓ | navbar |
| Language | `Globe` ✓ | lang switcher |
| Connectivity | `Wifi` / `WifiOff` ✓ | online state |
| Offline answer | `CloudOff` / `Archive` | saved-guidance badge |
| Copy | `Copy` → `Check` (on copied) | chat message action |
| Regenerate | `RefreshCw` ✓ | retry AI answer |
| Feedback up/down | `ThumbsUp` / `ThumbsDown` | wire to backend feedback |
| New chat | `SquarePen` / `Plus` | reset thread |
| Attachment | `Paperclip` | future |
| Voice | `Mic` | future |
| Emoji | `Smile` | future |
| External link | `ArrowUpRight` | footer/social |
| Arrow CTA | `ArrowRight` ✓ | hero "learn how" |
| Success | `CircleCheckBig` | confirmations |
| Warning | `TriangleAlert` | offline/caution |
| Error | `CircleAlert` | errors |
| Info | `Info` ✓ | service card |
| Domain: Agriculture | `Tractor` ✓ `Sprout` ✓ `Wheat` | trust bar |
| Domain: Education | `GraduationCap` ✓ | trust/services |
| Domain: Health | `HeartPulse` ✓ | trust bar |
| Domain: Trade | `Store` ✓ | trust bar |
| Domain: Safety | `ShieldCheck` ✓ / `Shield` ✓ | features |
| Speed | `Zap` ✓ | features |

**Consistency rules:** pick ONE check icon (`CircleCheckBig`) — code currently mixes
`CheckCircle2` (home/contact) and `CheckCircle` (download). Pick ONE message icon per role.
Never mix filled and outline styles (Lucide is all-outline — good, keep it).
</content>
