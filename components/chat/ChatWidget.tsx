"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bot, MessageCircle, SquarePen, WifiOff, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/cn";
import {
  startSession,
  sendChat,
  sendFeedback,
  reportUnanswered,
  fetchOfflinePack,
  reportOfflineAttempt,
  localFaqAnswer,
  PACK_CACHE_KEY,
  type Lang,
  type OfflineFaqEntry,
} from "@/lib/chatApi";
import { useFocusTrap } from "./useFocusTrap";
import { MessageBubble, type Msg } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Composer } from "./Composer";

const STORE_KEY = "aflachat_thread_v1";

const TEXT: Record<Lang, {
  title: string; subtitle: string; placeholder: string; welcome: string; disclaimer: string;
  offlineLocal: string; offlineNone: string; error: string; send: string; stop: string;
  open: string; close: string; newChat: string; typing: string; copy: string; copied: string;
  regenerate: string; helpful: string; notHelpful: string; savedGuidance: string;
}> = {
  en: {
    title: "AflaChat Assistant",
    subtitle: "Ask about aflatoxin & food safety",
    placeholder: "Type your question…",
    welcome: "Hello! I'm the AflaChat Assistant. Ask me anything about aflatoxin, food preservation, and crop safety.",
    disclaimer: "AI answers may have limitations. Consult a local expert for specific advice.",
    offlineLocal: "You're offline — answer from saved guidance:",
    offlineNone: "You're offline and I don't have a saved answer for that. Please reconnect and try again.",
    error: "Something went wrong. Please try again.",
    send: "Send", stop: "Stop generating", open: "Chat with AflaChat", close: "Close chat",
    newChat: "New chat", typing: "Assistant is typing", copy: "Copy", copied: "Copied",
    regenerate: "Regenerate response", helpful: "Helpful", notHelpful: "Not helpful",
    savedGuidance: "Saved guidance",
  },
  sw: {
    title: "Msaidizi wa AflaChat",
    subtitle: "Uliza kuhusu sumukuvu na usalama wa chakula",
    placeholder: "Andika swali lako…",
    welcome: "Habari! Mimi ni Msaidizi wa AflaChat. Niulize chochote kuhusu sumukuvu, uhifadhi wa chakula na usalama wa mazao.",
    disclaimer: "Majibu ya AI yanaweza kuwa na mapungufu. Wasiliana na mtaalamu kwa ushauri sahihi.",
    offlineLocal: "Hauko mtandaoni — jibu kutoka kwa maelezo yaliyohifadhiwa:",
    offlineNone: "Hauko mtandaoni na sina jibu lililohifadhiwa kwa hilo. Tafadhali unganisha tena ujaribu.",
    error: "Hitilafu imetokea. Tafadhali jaribu tena.",
    send: "Tuma", stop: "Acha kujibu", open: "Ongea na AflaChat", close: "Funga gumzo",
    newChat: "Gumzo jipya", typing: "Msaidizi anaandika", copy: "Nakili", copied: "Imenakiliwa",
    regenerate: "Zalisha jibu upya", helpful: "Lasaidia", notHelpful: "Halisaidii",
    savedGuidance: "Maelezo yaliyohifadhiwa",
  },
};

const INITIAL_SUGGESTIONS: Record<Lang, string[]> = {
  en: ["What is aflatoxin?", "How do I prevent it in maize?", "Which crops are affected?"],
  sw: ["Sumukuvu ni nini?", "Naizuiaje kwenye mahindi?", "Mazao gani huathiriwa?"],
};

let idCounter = 0;
const uid = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ChatWidget() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const t = TEXT[lang];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS[lang]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [online, setOnline] = useState(true);

  const sessionId = useRef<string | null>(null);
  const pack = useRef<OfflineFaqEntry[]>([]);
  const abort = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevLang = useRef(lang);

  const titleId = useId();
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(panelRef, open, close);

  // ── Restore persisted thread on mount, else seed welcome ──
  useEffect(() => {
    let restored = false;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.lang === lang && Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages);
          sessionId.current = data.sessionId ?? null;
          setSuggestions([]);
          restored = true;
        }
      }
    } catch { /* ignore */ }
    if (!restored) {
      setMessages([{ id: uid(), role: "ai", content: TEXT[lang].welcome }]);
      setSuggestions(INITIAL_SUGGESTIONS[lang]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset thread when the language changes (after mount) ──
  useEffect(() => {
    if (prevLang.current === lang) return;
    prevLang.current = lang;
    abort.current = true;
    sessionId.current = null;
    setLoading(false);
    setStreaming(false);
    setMessages([{ id: uid(), role: "ai", content: TEXT[lang].welcome }]);
    setSuggestions(INITIAL_SUGGESTIONS[lang]);
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  }, [lang]);

  // ── Persist thread ──
  useEffect(() => {
    if (!messages.length) return;
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          lang,
          sessionId: sessionId.current,
          messages: messages.map((m) => ({ ...m, streaming: false })),
        }),
      );
    } catch { /* ignore */ }
  }, [messages, lang]);

  // ── Connectivity ──
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // ── Offline pack: cached first, refresh when online ──
  useEffect(() => {
    try {
      const cached = localStorage.getItem(PACK_CACHE_KEY);
      if (cached) pack.current = JSON.parse(cached);
    } catch { /* ignore */ }
    if (navigator.onLine) {
      fetchOfflinePack()
        .then((entries) => {
          pack.current = entries;
          localStorage.setItem(PACK_CACHE_KEY, JSON.stringify(entries));
        })
        .catch(() => { /* keep cache */ });
    }
  }, []);



  // ── Focus the composer when opening ──
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  // ── Auto-scroll ──
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const streamInto = useCallback(async (id: string, full: string) => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: full, streaming: false } : m)));
      return;
    }
    const tokens = full.split(/(\s+)/);
    let acc = "";
    for (const tok of tokens) {
      if (abort.current) break;
      acc += tok;
      const snapshot = acc;
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: snapshot } : m)));
      await sleep(18);
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: abort.current ? acc : full, streaming: false } : m)));
  }, []);

  const ask = useCallback(
    async (raw?: string, isRegen = false) => {
      const message = (raw ?? input).trim();
      if (!message || loading || streaming) return;

      if (!isRegen) setMessages((prev) => [...prev, { id: uid(), role: "user", content: message }]);
      setInput("");
      setSuggestions([]);
      setLoading(true);
      abort.current = false;

      // Offline → cached pack or offline message.
      if (!navigator.onLine) {
        const local = localFaqAnswer(message, lang, pack.current);
        setMessages((prev) => [
          ...prev,
          local
            ? { id: uid(), role: "ai", offline: true, content: `${t.offlineLocal}\n\n${local}` }
            : { id: uid(), role: "ai", offline: true, content: t.offlineNone },
        ]);
        reportOfflineAttempt();
        setLoading(false);
        return;
      }

      try {
        if (!sessionId.current) sessionId.current = await startSession(lang);
        const res = await sendChat(sessionId.current, lang, message);
        const answer = (res.answer ?? "").trim();
        setLoading(false);

        if (!answer) {
          reportUnanswered(sessionId.current, message);
          setMessages((prev) => [...prev, { id: uid(), role: "ai", content: t.error }]);
          return;
        }

        const id = uid();
        setMessages((prev) => [...prev, { id, role: "ai", content: "", streaming: true, messageId: res.messageId }]);
        setStreaming(true);
        await streamInto(id, answer);
        setStreaming(false);
        if (res.suggestions?.length) setSuggestions(res.suggestions);
      } catch {
        setLoading(false);
        const local = localFaqAnswer(message, lang, pack.current);
        setMessages((prev) => [
          ...prev,
          local
            ? { id: uid(), role: "ai", offline: true, content: `${t.offlineLocal}\n\n${local}` }
            : { id: uid(), role: "ai", content: t.error },
        ]);
      }
    },
    [input, loading, streaming, lang, t, streamInto],
  );

  // ── Allow CTAs anywhere to open the assistant ──
  useEffect(() => {
    const openHandler = () => setOpen(true);
    const askHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ question: string }>;
      const question = customEvent.detail?.question;
      setOpen(true);
      if (question) {
        setTimeout(() => {
          ask(question);
        }, 100);
      }
    };
    window.addEventListener("aflachat:open", openHandler);
    window.addEventListener("aflachat:ask", askHandler);
    return () => {
      window.removeEventListener("aflachat:open", openHandler);
      window.removeEventListener("aflachat:ask", askHandler);
    };
  }, [ask]);

  const regenerate = useCallback(() => {
    if (loading || streaming) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const idx = prev.map((m) => m.id).lastIndexOf(lastUser.id);
      return idx === -1 ? prev : prev.slice(0, idx + 1);
    });
    ask(lastUser.content, true);
  }, [messages, loading, streaming, ask]);

  const onFeedback = useCallback((msg: Msg, rating: "up" | "down") => {
    if (msg.messageId) sendFeedback(msg.messageId, rating);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, feedback: rating } : m)));
  }, []);

  const newChat = useCallback(() => {
    abort.current = true;
    setLoading(false);
    setStreaming(false);
    sessionId.current = null;
    setMessages([{ id: uid(), role: "ai", content: t.welcome }]);
    setSuggestions(INITIAL_SUGGESTIONS[lang]);
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [lang, t.welcome]);

  const lastAiId = [...messages].reverse().find((m) => m.role === "ai")?.id;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label={t.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/40"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-surface shadow-xl animate-fade-up",
            "inset-0 rounded-none",
            "sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[36rem] sm:max-h-[80vh] sm:w-[24rem] sm:rounded-2xl sm:border sm:border-border",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot size={20} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p id={titleId} className="truncate font-heading font-semibold">{t.title}</p>
              <p className="truncate text-xs text-white/80">{t.subtitle}</p>
            </div>
            {!online && (
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                <WifiOff size={12} aria-hidden /> offline
              </span>
            )}
            <button
              type="button"
              aria-label={t.newChat}
              title={t.newChat}
              onClick={newChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15"
            >
              <SquarePen size={18} />
            </button>
            <button
              type="button"
              aria-label={t.close}
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            aria-live="polite"
            aria-atomic="false"
            aria-busy={loading || streaming}
            className="flex-1 space-y-4 overflow-y-auto bg-surface-2/40 px-3 py-4"
          >
            <p className="mx-auto max-w-[90%] rounded-lg bg-warning/10 px-3 py-2 text-center text-[11px] text-warning">
              {t.disclaimer}
            </p>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                isLast={m.id === lastAiId}
                labels={t}
                onRegenerate={regenerate}
                onFeedback={(rating) => onFeedback(m, rating)}
              />
            ))}
            {loading && <TypingIndicator label={t.typing} />}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && !streaming && (
            <div className="flex flex-wrap gap-2 border-t border-border bg-surface px-3 py-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-secondary/40 bg-accent px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/15"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={() => ask()}
            onStop={() => { abort.current = true; }}
            streaming={streaming}
            placeholder={t.placeholder}
            sendLabel={t.send}
            stopLabel={t.stop}
            inputRef={inputRef}
          />
        </div>
      )}
    </>
  );
}
