"use client";

// Fires the fire-and-forget view increment once per mount.
//
// Deliberately silent: the endpoint is rate-limited by IP and always answers
// 202, and a failed count must never surface as an error on an article page.

import { useEffect, useRef } from "react";
import { API_BASE } from "@/lib/blog/serverApi";

export function ViewCounter({ slug }: { slug: string }) {
  const counted = useRef(false);

  useEffect(() => {
    // React 18+ mounts effects twice in dev; without this the count doubles.
    if (counted.current) return;
    counted.current = true;

    fetch(`${API_BASE}/api/blog/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Counting is best-effort.
    });
  }, [slug]);

  return null;
}
