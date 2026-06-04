// Client for the AflaChat admin analytics API (the /api/analytics/* routes,
// gated by the admin key). The key is held in sessionStorage only — it never
// ships in the bundle and is cleared when the tab closes or on logout.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

const KEY_STORAGE = "aflachat_admin_key";

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY_STORAGE);
}

export function setAdminKey(key: string): void {
  window.sessionStorage.setItem(KEY_STORAGE, key);
}

export function clearAdminKey(): void {
  window.sessionStorage.removeItem(KEY_STORAGE);
}

export class AdminAuthError extends Error {}

async function adminFetch<T>(path: string): Promise<T> {
  const key = getAdminKey();
  if (!key) throw new AdminAuthError("No admin key");
  const res = await fetch(`${BASE_URL}/api/analytics${path}`, {
    headers: { "x-admin-key": key },
    cache: "no-store",
  });
  if (res.status === 401) {
    clearAdminKey();
    throw new AdminAuthError("Invalid admin key");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Verifies a candidate key against the API and stores it on success. */
export async function verifyAndStoreKey(key: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/analytics/overview`, {
    headers: { "x-admin-key": key },
    cache: "no-store",
  });
  if (res.ok) {
    setAdminKey(key);
    return true;
  }
  return false;
}

// ── Response shapes ───────────────────────────────────────────────────────────
export type PlatformSplit = { web: number; android: number; ios: number; other: number };

export interface Overview {
  sessions: number;
  endedSessions: number;
  messages: number;
  userMessages: number;
  activeDays: number;
  avgSessionMs: number;
  avgMessagesPerSession: number;
  avgLatencyMs: number;
  communityFeedback: number;
  offlineAttempts: number;
  unanswered: number;
  platforms: PlatformSplit;
}

export interface SeriesPoint {
  day: string;
  sessions: number;
  messages: number;
  web: number;
  app: number;
}

export interface Languages {
  totals: { en: number; sw: number };
  byDay: Record<string, { en: number; sw: number }>;
}

export interface Topic {
  keyword: string;
  count: number;
}

export interface Quality {
  feedback: { up: number; down: number; total: number };
  answers: number;
  contextHitRate: number;
  unansweredCount: number;
  offlineAttempts: number;
}

export type SessionSource = "web" | "android" | "ios" | "other";

export interface SessionRow {
  id: string;
  language: "en" | "sw";
  platform: string | null;
  source: SessionSource;
  appVersion: string | null;
  geo: { lat: number; lng: number; accuracy?: number } | null;
  deviceHash: string | null;
  startedAt: string;
  endedAt: string | null;
  messages: number;
  userMessages: number;
  durationMs: number | null;
}

export interface TranscriptMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  usedContext: boolean;
  model: string | null;
  latencyMs: number | null;
  createdAt: string;
}

export interface SessionDetail {
  session: SessionRow;
  messages: TranscriptMessage[];
}

export interface CommunityFeedbackRow {
  deviceHash: string | null;
  message: string;
  language: "en" | "sw";
  createdAt: string;
}

export interface OfflineEventRow {
  deviceHash: string | null;
  region: string | null;
  createdAt: string;
}

export interface UnansweredRow {
  text: string;
  language: "en" | "sw";
  sessionId: string;
  createdAt: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const api = {
  overview: () => adminFetch<Overview>("/overview"),
  timeseries: (days = 30) =>
    adminFetch<{ series: SeriesPoint[] }>(`/timeseries?days=${days}`).then((r) => r.series),
  languages: () => adminFetch<Languages>("/languages"),
  topics: () => adminFetch<{ topics: Topic[] }>("/topics").then((r) => r.topics),
  quality: () => adminFetch<Quality>("/quality"),
  platforms: () => adminFetch<PlatformSplit>("/platforms"),
  sessions: (limit = 200) =>
    adminFetch<{ sessions: SessionRow[] }>(`/sessions?limit=${limit}`).then((r) => r.sessions),
  sessionDetail: (id: string) => adminFetch<SessionDetail>(`/sessions/${id}`),
  feedback: (limit = 200) =>
    adminFetch<{ feedback: CommunityFeedbackRow[] }>(`/feedback?limit=${limit}`).then(
      (r) => r.feedback,
    ),
  events: (limit = 200) =>
    adminFetch<{ events: OfflineEventRow[] }>(`/events?limit=${limit}`).then((r) => r.events),
  unanswered: () =>
    adminFetch<{ unanswered: UnansweredRow[] }>("/unanswered").then((r) => r.unanswered),
};
