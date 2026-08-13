"use client";

// Table of contents with scroll-spy. Client-side because it observes scroll
// position; the heading list itself is computed on the server and passed in,
// so nothing is re-derived in the browser.

import { useEffect, useState } from "react";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost heading currently in the upper part of the viewport wins,
        // which keeps the highlight stable while scrolling through a section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-28">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">On this page</p>
      <ul className="space-y-1.5 border-l border-zinc-200">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.75 + 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              aria-current={activeId === h.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-0.5 text-sm transition-colors ${
                activeId === h.id
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
              style={{ marginLeft: "-1px", paddingLeft: "0.75rem" }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
