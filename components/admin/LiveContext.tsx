"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { BASE_URL } from "@/lib/http";
import { getToken, onSessionChange } from "@/lib/session";

export type LiveEventType =
  | "session.created"
  | "session.ended"
  | "message.created"
  | "feedback.created"
  | "contact.created"
  | "contact.updated"
  | "offline.created"
  | "unanswered.created";

export type LiveStatus = "connecting" | "open" | "error";

type Listener = (payload: Record<string, unknown>) => void;

interface LiveContextValue {
  status: LiveStatus;
  subscribe: (type: LiveEventType, fn: Listener) => () => void;
}

const LiveContext = createContext<LiveContextValue | null>(null);

/**
 * Owns one EventSource connection to GET /api/analytics/stream for the whole
 * admin session — pages subscribe via `useLiveEvent` instead of each opening
 * their own connection. Reconnects automatically on login/logout (the token
 * is carried as a query param since native EventSource can't set headers).
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const listenersRef = useRef<Map<LiveEventType, Set<Listener>>>(new Map());

  useEffect(() => {
    let es: EventSource | null = null;

    const connect = () => {
      es?.close();
      const token = getToken();
      if (!token) {
        setStatus("error");
        return;
      }
      setStatus("connecting");
      es = new EventSource(`${BASE_URL}/api/analytics/stream?token=${encodeURIComponent(token)}`);
      es.onopen = () => setStatus("open");
      es.onerror = () => setStatus("error"); // EventSource retries on its own (see `retry:` from the server)

      const types: LiveEventType[] = [
        "session.created",
        "session.ended",
        "message.created",
        "feedback.created",
        "contact.created",
        "contact.updated",
        "offline.created",
        "unanswered.created",
      ];
      for (const type of types) {
        es.addEventListener(type, (e: MessageEvent) => {
          let payload: Record<string, unknown> = {};
          try {
            payload = JSON.parse(e.data);
          } catch {
            // ignore malformed payloads
          }
          listenersRef.current.get(type)?.forEach((fn) => fn(payload));
        });
      }
    };

    connect();
    const unsubscribeSession = onSessionChange(connect);

    return () => {
      unsubscribeSession();
      es?.close();
    };
  }, []);

  const subscribe = (type: LiveEventType, fn: Listener) => {
    if (!listenersRef.current.has(type)) listenersRef.current.set(type, new Set());
    listenersRef.current.get(type)!.add(fn);
    return () => {
      listenersRef.current.get(type)?.delete(fn);
    };
  };

  return <LiveContext.Provider value={{ status, subscribe }}>{children}</LiveContext.Provider>;
}

export function useLiveStatus(): LiveStatus {
  const ctx = useContext(LiveContext);
  return ctx?.status ?? "error";
}

/**
 * Subscribe to one or more live event types for the lifetime of the calling
 * component. `onEvent` is read via a ref so the subscription itself stays
 * stable across re-renders (only re-subscribes if the type list changes) —
 * callers don't need to memoize the handler they pass in.
 */
export function useLiveEvent(types: LiveEventType | LiveEventType[], onEvent: (payload: Record<string, unknown>) => void) {
  const ctx = useContext(LiveContext);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const typeList = Array.isArray(types) ? types : [types];
  const key = typeList.join(",");

  useEffect(() => {
    if (!ctx) return;
    const unsubs = typeList.map((type) => ctx.subscribe(type, (payload) => onEventRef.current(payload)));
    return () => unsubs.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, key]);
}
