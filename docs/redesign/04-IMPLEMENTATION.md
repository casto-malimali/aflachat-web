# AflaChat — Implementation Guide (copy-paste ready)

Ordered by the roadmap in `01-AUDIT.md`. Each step is independently shippable.

---

## §1 — Phase 0: remove the 62 broken class artifacts (BLOCKER)

The artifacts match the pattern `(space)-<color>-...` left by `remove-dark-mode.js`. They are
always a stray token *after* a real class, e.g. `bg-white/90 -zinc-950/90` → keep `bg-white/90`,
delete ` -zinc-950/90`.

**Safe approach — review each, don't blind-regex** (some legit classes contain hyphens like
`-translate-y-2`, `-z-10`, `-right-8`, `[animation-delay:...]` which you must NOT touch):

Files & counts: `privacy/page.tsx` (25), `Navbar.tsx` (13), `contact/page.tsx` (12),
`terms/page.tsx` (8), `page.tsx` (4).

The dangling tokens to delete are specifically those starting with ` -zinc-`, ` -primary`,
` -secondary`, ` -emerald`, ` -white`, ` -gray`, ` -accent` that are **not** preceded by a
utility prefix and **not** `-translate`, `-z-`, `-right`, `-left`, `-top`, `-bottom`, `-mt`, `-mb`.

Concrete edits (representative):
```diff
- "bg-white/90 -zinc-950/90 backdrop-blur-lg shadow-sm border-b border-zinc-100 -zinc-800/50 py-3"
+ "bg-white/90 backdrop-blur-lg shadow-sm border-b border-zinc-100 py-3"

- "p-4 bg-accent -primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform"
+ "p-4 bg-accent text-primary rounded-2xl group-hover:scale-110 transition-transform"

- "text-zinc-600 -zinc-400 hover:text-primary -secondary transition-colors"
+ "text-zinc-600 hover:text-primary transition-colors"

- "py-20 px-6 bg-zinc-50 -zinc-950/50 border-t border-zinc-100 -zinc-800"
+ "py-20 px-6 bg-zinc-50 border-t border-zinc-100"
```
Then **delete the source of the problem**:
```bash
git rm remove-dark-mode.js
git rm tailwind.config.js        # unused in Tailwind v4 (see audit §0.2)
```
And remove dead dark-mode runtime:
```diff
// app/layout.tsx
- import { ThemeProvider } from "@/components/ThemeContext";
  ...
- <LanguageProvider><ThemeProvider>{children}</ThemeProvider></LanguageProvider>
+ <LanguageProvider>{children}</LanguageProvider>
```
```bash
git rm components/ThemeContext.tsx   # 53 lines of dead code, no consumer/toggle
```
Also fix the `mailto:` space (`contact/page.tsx:38`): `"mailto: chogop@..."` → `"mailto:chogop@..."`.

> Verify after: `grep -RnE '\s-(zinc|primary|secondary|emerald|white|gray|accent)' app components` returns nothing
> (except legit `-translate`/`-z`/positional which won't match this pattern), then `npm run build`.

---

## §2 — Phase 0: fix dead CTAs

```diff
// app/(site)/page.tsx — "Learn how" button → real anchor
- <button className="flex items-center gap-2 ...">
-   {t.hero.learnHow}<ArrowRight .../>
- </button>
+ <a href="#how" className="flex items-center gap-2 ...">
+   {t.hero.learnHow}<ArrowRight .../>
+ </a>
  ...
- <section className="py-28 px-6 bg-white">   {/* How It Works */}
+ <section id="how" className="scroll-mt-24 py-28 px-6 bg-white">
```
Footer socials (`Footer.tsx`): replace `href="#"` with real URLs, or remove the dead icons
until accounts exist. `#` links are keyboard focus traps with no destination.

---

## §3 — Phase 1: self-host fonts (so the brand actually renders)

Download `Poppins` (400/600/700) and `Inter` (400/500/600/700) `.woff2` into
`app/fonts/`. Then use `next/font/local` — **no build-time network** (resolves the offline
concern noted in `app/layout.tsx`).

```ts
// app/fonts.ts
import localFont from "next/font/local";

export const poppins = localFont({
  variable: "--font-heading",
  display: "swap",
  src: [
    { path: "./fonts/Poppins-Regular.woff2",  weight: "400", style: "normal" },
    { path: "./fonts/Poppins-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-Bold.woff2",     weight: "700", style: "normal" },
  ],
});
export const inter = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "./fonts/Inter-Regular.woff2",  weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2",   weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2",     weight: "700", style: "normal" },
  ],
});
```
```diff
// app/layout.tsx
+ import { poppins, inter } from "./fonts";
- <html lang="en" className="scroll-smooth">
+ <html lang="en" className={`scroll-smooth ${poppins.variable} ${inter.variable}`}>
-   <body className="antialiased" style={{ fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}>
+   <body className="antialiased font-body">
```
Now `--font-heading`/`--font-body` are real fonts; the `@theme` tokens (design-system §1) map
Tailwind `font-heading`/`font-body` to them. **Then delete every inline
`style={{ fontFamily: "var(--font-poppins,...)" }}`** (20+ occurrences) and use `font-heading`.

---

## §4 — Phase 1: install the token system

Replace the `@theme` + helpers block in `app/globals.css` with the full token set and base
layer from `02-DESIGN-SYSTEM.md §1` and `§7`. Keep the existing keyframes (`fade-up`, `fade-in`).
This is backward-compatible: `primary`, `secondary`, `accent`, `surface`, `muted` keep their
current values, so existing markup keeps working while new tokens become available.

Add `lib/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
```

---

## §5 — Phase 1: primitives (examples)

`components/ui/Button.tsx`
```tsx
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:   "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md shadow-primary/20",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-95",
  outline:   "border border-border-strong text-foreground hover:bg-surface-2",
  ghost:     "text-foreground hover:bg-surface-2",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-base",
};

export function Button({
  variant = "primary", size = "md", loading, className, children, disabled, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight",
        "transition-all hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant], sizes[size], className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
```

`components/ui/Section.tsx` + `Container.tsx`
```tsx
export const Container = ({ className = "", ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mx-auto w-full max-w-7xl px-6 ${className}`} {...p} />
);

export function Section({ id, eyebrow, title, children, className = "" }: {
  id?: string; eyebrow?: string; title?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-16 md:py-20 lg:py-28 ${className}`}>
      <Container>
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        {title && (
          <>
            <div className="rule-accent mb-4" />
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
          </>
        )}
        {children}
      </Container>
    </section>
  );
}
```

`components/ui/FeatureCard.tsx` (Home "How It Works" + Services share this)
```tsx
import { cn } from "@/lib/cn";
export function FeatureCard({ icon, title, desc, num, className }: {
  icon: React.ReactNode; title: string; desc: string; num?: string; className?: string;
}) {
  return (
    <div className={cn(
      "group relative rounded-xl border border-border bg-surface p-8",
      "transition-all duration-300 hover:border-primary/30 hover:shadow-md", className,
    )}>
      {num && <span className="absolute right-7 top-6 select-none font-heading text-6xl font-black text-foreground/5">{num}</span>}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/10 bg-accent text-primary transition-colors group-hover:bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-3 font-heading text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
```

`components/ui/Field.tsx` (a11y-correct, fixes contact form)
```tsx
import { useId } from "react";
export function Field({ label, error, children }: {
  label: string; error?: string; children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId(); const errId = `${id}-err`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": error ? errId : undefined })}
      {error && <p id={errId} role="alert" className="px-1 text-sm text-error">{error}</p>}
    </div>
  );
}
```

---

## §6 — Phase 1: global a11y (in `app/(site)/layout.tsx`)

```diff
  <div className="flex flex-col min-h-screen">
+   <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
+     Skip to content
+   </a>
    <Navbar />
-   <main className="flex-grow pt-20">{children}</main>
+   <main id="main" className="flex-grow pt-20">{children}</main>
    <Footer /><ChatWidget />
  </div>
```
`:focus-visible` ring and `prefers-reduced-motion` come from the `@layer base` block in
design-system §7 — already global once `globals.css` is updated.

---

## §7 — Phase 2/3/4

- **Chat:** follow `03-CHAT-REDESIGN.md` §7 component split + §8 checklist.
- **Contact form:** RHF + Zod; wrap each control in `<Field>`; real POST to `/api/contact`
  (or Resend/Formspree); pending/success/error via `aria-live`.
- **Navbar:** add `aria-current` to active `Link` (compare `usePathname()`), `aria-expanded`/
  `aria-controls` on both toggles, close lang menu on `Esc`/outside-click (reuse `useFocusTrap`/
  a click-away hook), lock body scroll when mobile menu open.
- **Admin:** swap `gray-*`/ad-hoc hexes for tokens; keep emerald as the only accent or commit to
  a documented neutral "console" theme; add `<figure><figcaption>` + visually-hidden data tables
  to `LineChart/Donut/BarList`.

---

## Verification per phase
```bash
npm run lint && npm run build      # must pass after each phase
# Phase 0 regression: confirm no dangling color tokens remain
grep -RnE "\s-(zinc|primary|secondary|emerald|white|gray|accent)[-/]" app components
# Manual: keyboard-only pass (Tab through nav → cards → chat → composer; Esc closes chat)
# Lighthouse a11y ≥ 95 on /, /contact, and with chat open
```
</content>
