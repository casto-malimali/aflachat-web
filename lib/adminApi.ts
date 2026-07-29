// Client for the AflaChat admin analytics API (the /api/analytics/* routes,
// gated by a bearer session token issued at login — see lib/authApi.ts).

import { apiRequest, AuthError } from "./http";

/** Re-exported under the historical name so existing call sites keep working. */
export const AdminAuthError = AuthError;

const adminFetch = <T>(path: string) => apiRequest<T>(`/api/analytics${path}`);

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

/** A submission from the public Contact page (POST /api/contact on the backend). */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
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
  /** Not under /api/analytics — this is a distinct resource. */
  contactSubmissions: () =>
    apiRequest<{ submissions: ContactSubmission[] }>("/api/contact/submissions").then(
      (r) => r.submissions,
    ),
  updateContactStatus: (id: string, status: ContactSubmission["status"]) =>
    apiRequest<{ submission: ContactSubmission }>(`/api/contact/submissions/${id}`, {
      method: "PATCH",
      body: { status },
    }).then((r) => r.submission),
};
