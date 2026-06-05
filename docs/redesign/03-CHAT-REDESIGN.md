# AflaChat — Chat Experience Specification

Redesign of `components/ChatWidget.tsx`. Keeps the working backend client
(`lib/chatApi.ts`: `startSession`, `sendChat`, `fetchOfflinePack`, `localFaqAnswer`,
`reportOfflineAttempt`) and the bilingual/offline model — adds modern AI-chat UX, full
accessibility, and mobile-first layout. Reference quality bar: ChatGPT, Linear, Claude,
Slack/Discord composer ergonomics.

---

## 1. Layout

### Desktop (≥ `sm`) — floating panel
```
                                   ┌─────────────────────────────┐
                                   │ ◉ Bot  AflaChat Assistant ⟳ ✕│  header (bg-primary)
                                   │        Ask about aflatoxin…  │
                                   ├─────────────────────────────┤
                                   │  ⚠ AI answers may have…(once)│  collapsible disclaimer
                                   │                              │
                                   │  ◉ Hello! I'm the AflaChat…  │  AI bubble (surface)
                                   │                              │
                                   │           Your question →    │  user bubble (primary)
                                   │                              │
                                   │  ◉ ▍(streaming…)  📋 ⟳ 👍 👎  │  AI bubble + actions
                                   │                              │  ← scroll region, aria-live
                                   ├─────────────────────────────┤
                                   │ [What is aflatoxin?] [How…]  │  suggestion chips
                                   ├─────────────────────────────┤
                                   │ ＋ │ Type your question…  │ ➤ │  composer
                                   └─────────────────────────────┘
                              ( ◉ )  ← launcher FAB, bottom-right
```
- Panel: `w-[24rem] h-[36rem] max-h-[80vh]`, `rounded-2xl`, `shadow-xl`, anchored
  `bottom-24 right-5`. Entrance: scale+fade from launcher origin (framer-motion, reduced-motion → instant).

### Mobile (< `sm`) — full-screen sheet
- Panel becomes `inset-0` full-bleed sheet (`rounded-none`), header gets a back/close affordance,
  composer pinned to safe-area bottom (`pb-[env(safe-area-inset-bottom)]`).
- Body scroll locked while open.
- This replaces today's awkward floating `w-[22rem]` panel on small screens.

### (Optional) Conversation sidebar — future
For multi-conversation history (Slack/Discord pattern): a left rail listing past sessions
with **search**, **pinned** chats, and date grouping. Out of scope for v1 (the widget is
single-thread); spec'd here for the roadmap. Persist threads in `localStorage`
(`aflachat_threads_v1`) keyed by `sessionId`.

---

## 2. Message UI

| Element | Spec |
|---|---|
| **AI bubble** | `bg-surface border border-border rounded-xl rounded-bl-sm`, avatar (`Bot`) in `accent` chip to the left, max-w 85%. Markdown-rendered. |
| **User bubble** | `bg-primary text-primary-foreground rounded-xl rounded-br-sm`, right-aligned, max-w 85%. |
| **Offline bubble** | AI bubble + `border-warning/40 bg-warning/5`, prefixed with a `CloudOff` chip "Saved guidance". |
| **Message grouping** | Consecutive same-sender bubbles: collapse avatar + tighten gap to `space-y-1`; new sender or >2min gap → full gap `space-y-4` + avatar. Show a timestamp on hover / at group end (`text-xs text-muted-foreground`). |
| **Typing indicator** | 3 bouncing dots **with** visually-hidden text "Assistant is typing" for SR. |
| **Streaming cursor** | Blinking `▍` appended while tokens arrive (reduced-motion → static). |
| **Reactions/receipts** | Lightweight: a "✓ sent" micro-state on user msgs; 👍/👎 on AI msgs (see §4). Full emoji reactions are future. |
| **Rich content** | Markdown via `react-markdown` + `remark-gfm` + **`rehype-sanitize` (required)**: headings, bold/italic, lists, links (`target=_blank rel=noopener`, render with `ArrowUpRight`), inline code + fenced code blocks (mono, `surface-2` bg, copy button), tables (scrollable). Image/link previews: future. |

---

## 3. AI chat features

| Feature | Implementation |
|---|---|
| **Streaming responses** | Prefer SSE/chunked: add `sendChatStream(sessionId, lang, message, onToken)` to `chatApi.ts` (backend `/api/chat/stream`). Until backend supports it, **simulate** by revealing the returned `answer` in word chunks via `requestAnimationFrame` so the UX is ready. Append tokens to the last AI message; show streaming cursor; disable composer send while streaming; allow **Stop**. |
| **Message regeneration** | `RefreshCw` action on the last AI bubble re-sends the prior user message; replaces (or stacks as a variant of) the answer. |
| **Copy** | `Copy`→`Check` (2s) on every AI bubble; copies raw markdown. |
| **Feedback 👍/👎** | On every AI bubble. **Wire to backend** — the admin dashboard already charts `quality.feedback.up/down` (`app/admin/page.tsx:191`) but nothing sends it. Add `sendFeedback(messageId, "up"|"down")` → `/api/feedback`. `messageId` is already returned by `sendChat` (`ChatResponse.messageId`). |
| **Markdown** | §2. |
| **Suggested prompts** | Initial `INITIAL_SUGGESTIONS` per lang (keep) + server `res.suggestions` after each turn (keep). Re-surface initial suggestions on "new chat". Render as horizontally scrollable chips with `secondary-foreground` text (fix the white-on-emerald hover, audit §6). |
| **Quick actions** | Header: **New chat** (`SquarePen` → reset thread + session), **Minimize/Close** (`X`). |
| **Conversation history** | Persist current thread to `localStorage` (`aflachat_thread_v1`) on each message; restore on open so refresh doesn't wipe context. Clear on "new chat". |
| **Token-efficient rendering** | Virtualize only if a thread exceeds ~100 msgs (unlikely v1); memoize `MessageBubble`; markdown-parse once per message and cache. |

---

## 4. Feedback & offline data flow (wire the dormant plumbing)

```
sendChat() → { answer, messageId, suggestions, usedContext }
   render AI bubble (markdown)
   bubble actions:
     👍 → sendFeedback(messageId,"up")     ─┐
     👎 → sendFeedback(messageId,"down")    ├─ admin "Answer quality" panel
     ⟳  → regenerate(lastUserMessage)       │
     📋 → copy(markdown)                    ─┘
offline path → localFaqAnswer() + reportOfflineAttempt()  (already wired ✓ — admin "Offline attempts")
unanswered  → when answer is empty/fallback, POST /api/events/unanswered  (admin "Unanswered" KPI)
```
This closes the loop between the widget and the four admin metrics that currently have no producer
in the web client: **feedback up/down**, **unanswered**, (offline already produced).

---

## 5. Accessibility (this is where the current widget fails hardest)

| Requirement | Spec |
|---|---|
| **Dialog semantics** | Panel = `role="dialog"` `aria-modal="true"` `aria-labelledby={titleId}`. Launcher = `aria-haspopup="dialog"` `aria-expanded={open}` `aria-controls={panelId}`. |
| **Focus management** | On open → focus the composer input. On close → return focus to the launcher. **Focus trap** inside the panel while open (Tab cycles within). |
| **Escape** | Closes the panel (and on mobile, the sheet). |
| **Live region** | Message scroll container `aria-live="polite"` `aria-atomic="false"` so new AI messages are announced; streaming announces the final message once (don't spam per token — set `aria-busy` during stream, announce on completion). |
| **Names** | Launcher `aria-label` (already ✓). All icon-only actions (`Copy`, `RefreshCw`, `ThumbsUp/Down`, `New chat`) need `aria-label`. Typing indicator needs SR text. |
| **Input** | `text-base` (16px) to prevent iOS zoom; `enterKeyHint="send"`; `aria-label` or visible label; `maxLength={500}` (keep) with a live `... / 500` counter for SR via `aria-describedby`. |
| **Contrast** | Bubbles, chips, disclaimer all per design tokens (AA). Fix `hover:text-white` on emerald chips. |
| **Reduced motion** | Bounce/stream/entrance all gated by `prefers-reduced-motion`. |

---

## 6. Visual design (21st.dev-grade, on-brand)

- **Header:** `bg-primary` with a subtle top sheen (`from-white/10`) ; avatar in `bg-white/15` ring.
- **Body:** `bg-surface-2/40`; soft, not stark white.
- **Bubbles:** `shadow-xs`, generous `px-3.5 py-2.5`, `leading-relaxed`, `rounded-xl` with one
  tucked corner toward the sender.
- **Glass launcher (optional):** keep solid `bg-primary` FAB (better contrast than glass on
  busy hero images) with `shadow-lg` and a gentle pulse ring on first load to invite engagement
  (once per session, reduced-motion off).
- **Gradients:** reserve for the empty-state hero inside the panel ("Ask me about aflatoxin")
  using `text-gradient`; keep bubbles solid for readability.
- **Animations (framer-motion, dynamic import):** panel scale-in 150ms; messages slide-up-fade
  20ms stagger; chips fade; all `whileTap` micro-press on buttons.
- **Dark mode:** inherits tokens — bubbles use `surface`/`primary`, no extra work.

---

## 7. Component breakdown (replaces the single 285-line file)

```
components/chat/
  ChatWidget.tsx        state owner: open, messages, session, online, streaming; renders Launcher + Panel
  ChatLauncher.tsx      FAB; aria-expanded/controls; pulse-once
  ChatPanel.tsx         Dialog wrapper (role, focus trap, Esc, mobile sheet vs desktop panel)
  ChatHeader.tsx        avatar, title/subtitle, online badge, New-chat, Close
  MessageList.tsx       scroll region, aria-live, grouping, auto-scroll
  MessageBubble.tsx     memoized; markdown; per-message actions (copy/regenerate/feedback)
  Markdown.tsx          react-markdown + remark-gfm + rehype-sanitize config
  TypingIndicator.tsx   dots + SR text
  SuggestionChips.tsx   horizontal scroll chips
  Composer.tsx          textarea(auto-grow) + send/stop; enterKeyHint; counter
hooks/
  useChat.ts            ask/regenerate/stop, optimistic user msg, offline branch, persistence
  useFocusTrap.ts       reusable (also Navbar dropdown / Dialog)
  useOnlineStatus.ts    extracted from current effect
lib/chatApi.ts          + sendChatStream(), sendFeedback(), reportUnanswered()
```

### Public open/close event (for CTAs elsewhere)
Let marketing CTAs (Services closing band, Home "Learn how") open the assistant:
```ts
// ChatWidget listens:
useEffect(() => {
  const open = () => setOpen(true);
  window.addEventListener("aflachat:open", open);
  return () => window.removeEventListener("aflachat:open", open);
}, []);
// any CTA:
<Button onClick={() => window.dispatchEvent(new Event("aflachat:open"))}>Ask the assistant</Button>
```

---

## 8. Acceptance checklist (v1)

- [ ] `role="dialog"`/`aria-modal`, focus moves to input on open, returns on close, focus trapped, `Esc` closes.
- [ ] `aria-live` announces AI replies; typing indicator has SR text.
- [ ] Markdown rendered + **sanitized**; code blocks have copy buttons.
- [ ] Streaming (real or simulated) with Stop; composer disabled mid-stream.
- [ ] Copy / Regenerate / 👍 / 👎 on AI bubbles; feedback POSTs `messageId` to backend.
- [ ] Thread persisted across refresh; "New chat" resets thread + session.
- [ ] Full-screen sheet < `sm`, body scroll locked, 16px input (no iOS zoom), safe-area padding.
- [ ] Offline path intact (cached pack + `reportOfflineAttempt`), warning-styled bubbles.
- [ ] All motion gated by `prefers-reduced-motion`.
- [ ] No white text on emerald; all contrast AA.
</content>
