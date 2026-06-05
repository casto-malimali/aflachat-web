# AflaChat Web — UI/UX Redesign Package

Implementation-ready audit and redesign for the AflaChat marketing site + chat widget +
admin dashboard. Grounded in the actual codebase (Next.js 16 · React 19 · Tailwind v4 ·
lucide-react), not generic advice.

| Doc | Contents |
|---|---|
| [`01-AUDIT.md`](./01-AUDIT.md) | Per-page/component audit (Home, Services, Contact, Download, Privacy/Terms, ChatWidget, Navbar, Footer, Admin) → current issues, UX/UI/a11y problems, redesign per page. **Priority matrix + phased roadmap.** |
| [`02-DESIGN-SYSTEM.md`](./02-DESIGN-SYSTEM.md) | Full color system (light+dark HEX + usage), typography scale, 4px spacing, radius, elevation, Tailwind v4 `@theme` tokens + CSS variables, component-library structure, dependencies, **Lucide icon mapping**. |
| [`03-CHAT-REDESIGN.md`](./03-CHAT-REDESIGN.md) | Chat screen spec: layout (desktop panel + mobile sheet), message UI, streaming/markdown/copy/regenerate/feedback, full a11y (dialog/focus-trap/aria-live), component breakdown, acceptance checklist. |
| [`04-IMPLEMENTATION.md`](./04-IMPLEMENTATION.md) | Copy-paste code: Phase 0 artifact cleanup, font self-hosting, token install, primitive components (`Button`/`Section`/`FeatureCard`/`Field`), global a11y, verification commands. |

## TL;DR — top findings
1. 🔴 **62 broken Tailwind classes** (`-zinc-950/90`, `-primary/20`, …) left by `remove-dark-mode.js` across 5 files — intended styling silently missing.
2. 🔴 **Dead dark-mode infra** shipped (`ThemeContext` + Tailwind-v3 `tailwind.config.js` that v4 ignores) — delete.
3. 🟠 **Fonts never load** — Poppins/Inter referenced but not self-hosted, so the brand falls back to system everywhere.
4. 🔴 **Contact form is fake** (no submit) and **labels aren't associated** with inputs.
5. 🔴 **ChatWidget a11y gaps** — no dialog role, focus trap, Esc, or `aria-live`; plus missing markdown/copy/regenerate/feedback (the admin already charts feedback that nothing sends).
6. 🟠 **No design primitives** — every pattern is copy-pasted; no `Button`/`Card`/`Section`.

Start with **Phase 0** in `04-IMPLEMENTATION.md` — it's pure bug-fix, no visual redesign, safe to ship today.
</content>
