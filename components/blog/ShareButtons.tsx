"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/**
 * Share links plus copy-to-clipboard. The native share sheet is used when the
 * browser offers one (mobile), falling back to the per-network links.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions — the share links still work.
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed the sheet.
        return;
      }
    }
    void copy();
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-zinc-500">Share</span>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
      >
        WhatsApp
      </a>
      <a
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
      >
        Facebook
      </a>

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
      >
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>

      <button
        type="button"
        onClick={share}
        aria-label="Share this article"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 sm:hidden"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
