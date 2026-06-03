"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, WifiOff } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import {
  startSession,
  sendChat,
  fetchOfflinePack,
  reportOfflineAttempt,
  localFaqAnswer,
  PACK_CACHE_KEY,
  type Lang,
  type OfflineFaqEntry,
} from "@/lib/chatApi";

type Msg = { role: "user" | "ai"; content: string; offline?: boolean };

const TEXT: Record<Lang, {
  title: string;
  subtitle: string;
  placeholder: string;
  welcome: string;
  disclaimer: string;
  offlineLocal: string;
  offlineNone: string;
  error: string;
  send: string;
  open: string;
}> = {
  en: {
    title: "AflaChat Assistant",
    subtitle: "Ask about aflatoxin & food safety",
    placeholder: "Type your question…",
    welcome:
      "Hello! I'm the AflaChat Assistant. Ask me anything about aflatoxin, food preservation, and crop safety.",
    disclaimer: "AI answers may have limitations. Consult a local expert for specific advice.",
    offlineLocal: "You're offline — answer from saved guidance:",
    offlineNone:
      "You're offline and I don't have a saved answer for that. Please reconnect and try again.",
    error: "Something went wrong. Please try again.",
    send: "Send",
    open: "Chat with AflaChat",
  },
  sw: {
    title: "Msaidizi wa AflaChat",
    subtitle: "Uliza kuhusu sumukuvu na usalama wa chakula",
    placeholder: "Andika swali lako…",
    welcome:
      "Habari! Mimi ni Msaidizi wa AflaChat. Niulize chochote kuhusu sumukuvu, uhifadhi wa chakula na usalama wa mazao.",
    disclaimer: "Majibu ya AI yanaweza kuwa na mapungufu. Wasiliana na mtaalamu kwa ushauri sahihi.",
    offlineLocal: "Hauko mtandaoni — jibu kutoka kwa maelezo yaliyohifadhiwa:",
    offlineNone:
      "Hauko mtandaoni na sina jibu lililohifadhiwa kwa hilo. Tafadhali unganisha tena ujaribu.",
    error: "Hitilafu imetokea. Tafadhali jaribu tena.",
    send: "Tuma",
    open: "Ongea na AflaChat",
  },
};

const INITIAL_SUGGESTIONS: Record<Lang, string[]> = {
  en: ["What is aflatoxin?", "How do I prevent it in maize?", "Which crops are affected?"],
  sw: ["Sumukuvu ni nini?", "Naizuiaje kwenye mahindi?", "Mazao gani huathiriwa?"],
};

export default function ChatWidget() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const t = TEXT[lang];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS[lang]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);

  const sessionId = useRef<string | null>(null);
  const pack = useRef<OfflineFaqEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Seed welcome message + reset suggestions when language changes.
  useEffect(() => {
    setMessages([{ role: "ai", content: TEXT[lang].welcome }]);
    setSuggestions(INITIAL_SUGGESTIONS[lang]);
  }, [lang]);

  // Track connectivity.
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

  // Load cached offline pack immediately, then refresh from backend when online.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(PACK_CACHE_KEY);
      if (cached) pack.current = JSON.parse(cached);
    } catch {
      /* ignore */
    }
    if (navigator.onLine) {
      fetchOfflinePack()
        .then((entries) => {
          pack.current = entries;
          localStorage.setItem(PACK_CACHE_KEY, JSON.stringify(entries));
        })
        .catch(() => {
          /* keep cache */
        });
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const ask = useCallback(
    async (raw?: string) => {
      const message = (raw ?? input).trim();
      if (!message || loading) return;

      setInput("");
      setSuggestions([]);
      setMessages((prev) => [...prev, { role: "user", content: message }]);
      setLoading(true);

      // Offline path: answer from cached pack, or show offline message.
      if (!navigator.onLine) {
        const local = localFaqAnswer(message, lang, pack.current);
        setMessages((prev) => [
          ...prev,
          local
            ? { role: "ai", content: `${t.offlineLocal}\n\n${local}`, offline: true }
            : { role: "ai", content: t.offlineNone, offline: true },
        ]);
        reportOfflineAttempt();
        setLoading(false);
        return;
      }

      try {
        if (!sessionId.current) sessionId.current = await startSession(lang);
        const res = await sendChat(sessionId.current, lang, message);
        setMessages((prev) => [...prev, { role: "ai", content: res.answer }]);
        if (res.suggestions?.length) setSuggestions(res.suggestions);
      } catch {
        // Network/server error → try the offline pack before giving up.
        const local = localFaqAnswer(message, lang, pack.current);
        setMessages((prev) => [
          ...prev,
          local
            ? { role: "ai", content: `${t.offlineLocal}\n\n${local}`, offline: true }
            : { role: "ai", content: t.error },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, lang, t],
  );

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label={t.open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary/40"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[34rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-fade-up">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {t.title}
              </p>
              <p className="truncate text-xs text-white/80">{t.subtitle}</p>
            </div>
            {!online && (
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                <WifiOff size={12} /> offline
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-3 py-4">
            <p className="mx-auto max-w-[90%] rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-700">
              {t.disclaimer}
            </p>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-white"
                      : m.offline
                        ? "rounded-bl-sm border border-amber-200 bg-amber-50 text-zinc-800"
                        : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 bg-white px-3 py-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-secondary/40 bg-accent px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-secondary hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border border-zinc-300 bg-muted/50 px-4 py-2 text-sm text-zinc-800 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
            <button
              type="submit"
              aria-label={t.send}
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"
      style={{ animationDelay: delay }}
    />
  );
}
