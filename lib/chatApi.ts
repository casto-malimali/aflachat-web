// Client for the AflaChat backend (chat + offline APIs).
// Base URL and app key come from public env vars so they can change per deploy.
// NOTE: the app key is not a true secret (it ships to the browser); it only
// deters casual abuse. Real protection is server-side rate limiting + rotation.

export type Lang = "en" | "sw";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev-app-key-change-me";

function headers(): HeadersInit {
  return { "Content-Type": "application/json", "x-app-key": APP_KEY };
}

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  usedContext: boolean;
  model: string;
  messageId: string;
}

export interface OfflineFaqEntry {
  id: string;
  language: Lang;
  question: string;
  answer: string;
  keywords: string[];
}

export async function startSession(language: Lang): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/session/start`, {
    method: "POST",
    headers: headers(),
    // Tag the source so the admin dashboard can split "website vs app" traffic.
    body: JSON.stringify({ language, platform: "web" }),
  });
  if (!res.ok) throw new Error(`session/start failed: ${res.status}`);
  const json = await res.json();
  return json.sessionId as string;
}

export async function sendChat(
  sessionId: string,
  language: Lang,
  message: string,
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sessionId, language, message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `chat failed: ${res.status}`);
  }
  return (await res.json()) as ChatResponse;
}

export async function fetchOfflinePack(): Promise<OfflineFaqEntry[]> {
  const res = await fetch(`${BASE_URL}/api/offline/faq-pack`, { headers: headers() });
  if (!res.ok) throw new Error(`offline pack failed: ${res.status}`);
  const json = await res.json();
  return (json.entries ?? []) as OfflineFaqEntry[];
}

export async function reportOfflineAttempt(region?: string): Promise<void> {
  await fetch(`${BASE_URL}/api/events/offline-attempt`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ region }),
  }).catch(() => {
    /* best-effort; ignore */
  });
}

/**
 * Send 👍/👎 on an AI answer. The admin dashboard already charts
 * `quality.feedback.up/down` — this is the producer the web client was missing.
 * Best-effort; never throws.
 */
export async function sendFeedback(messageId: string, rating: "up" | "down"): Promise<void> {
  await fetch(`${BASE_URL}/api/feedback`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ messageId, rating }),
  }).catch(() => {
    /* best-effort; ignore */
  });
}

/** Report that a question had no good answer (feeds the admin "Unanswered" KPI). */
export async function reportUnanswered(sessionId: string | null, message: string): Promise<void> {
  await fetch(`${BASE_URL}/api/events/unanswered`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sessionId, message }),
  }).catch(() => {
    /* best-effort; ignore */
  });
}

/**
 * Offline answer: keyword-overlap match against the cached FAQ pack — a small,
 * browser-side mirror of the backend's `searchContext`. Returns the best
 * matching answer for the active language, or null if nothing is relevant.
 */
export function localFaqAnswer(
  message: string,
  language: Lang,
  pack: OfflineFaqEntry[],
): string | null {
  if (!pack.length) return null;
  const q = message.toLowerCase();
  const words = q.split(/\W+/).filter((w) => w.length > 2);
  if (!words.length) return null;

  let best: { answer: string; score: number } | null = null;
  for (const e of pack) {
    if (e.language !== language) continue;
    const hay = `${e.question} ${e.answer} ${e.keywords.join(" ")}`.toLowerCase();
    let score = 0;
    if (e.question.toLowerCase().includes(q)) score += 10;
    for (const w of words) {
      if (e.keywords.some((k) => k.toLowerCase().includes(w))) score += 3;
      if (hay.includes(w)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { answer: e.answer, score };
  }
  return best ? best.answer : null;
}

export const PACK_CACHE_KEY = "aflachat_offline_pack_v1";
