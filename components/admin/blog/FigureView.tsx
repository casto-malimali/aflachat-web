"use client";

// The editable rendering of a `figure` node.
//
// The caption is a NodeViewContent, which means it is real TipTap inline
// content — so bold, italic and (the point of the exercise) link marks all
// work inside it, and a caption can read "Photo by Jane Doe / Source" with two
// independent hyperlinks.

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { AlignCenter, AlignLeft, Link2, Link2Off, Maximize2 } from "lucide-react";
import type { FigureAlignment } from "@/lib/blog/nodes";

const ALIGN_OPTIONS: { value: FigureAlignment; label: string; icon: typeof AlignLeft }[] = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align centre", icon: AlignCenter },
  { value: "full", label: "Full width", icon: Maximize2 },
];

const ALIGN_CLASS: Record<FigureAlignment, string> = {
  left: "mr-auto max-w-md",
  center: "mx-auto max-w-2xl",
  full: "w-full",
};

export function FigureView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, align, href } = node.attrs as {
    src: string;
    alt: string;
    align: FigureAlignment;
    href: string | null;
  };

  const [linkOpen, setLinkOpen] = useState(false);
  const [draftHref, setDraftHref] = useState(href ?? "");

  return (
    <NodeViewWrapper
      as="figure"
      data-align={align}
      className={`group relative my-6 ${ALIGN_CLASS[align]} ${
        selected ? "ring-2 ring-primary/60 rounded-xl" : ""
      }`}
    >
      {/* Floating controls — only while the figure is selected or hovered. */}
      <div
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        contentEditable={false}
      >
        {ALIGN_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={align === value}
            onClick={() => updateAttributes({ align: value })}
            className={`rounded-md p-1.5 transition-colors ${
              align === value ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <span className="mx-0.5 h-5 w-px bg-zinc-200" />

        <button
          type="button"
          title={href ? "Edit image link" : "Add image link"}
          aria-label={href ? "Edit image link" : "Add image link"}
          onClick={() => {
            setDraftHref(href ?? "");
            setLinkOpen((v) => !v);
          }}
          className={`rounded-md p-1.5 transition-colors ${
            href ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100"
          }`}
        >
          <Link2 className="h-4 w-4" />
        </button>

        {href && (
          <button
            type="button"
            title="Remove image link"
            aria-label="Remove image link"
            onClick={() => updateAttributes({ href: null })}
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <Link2Off className="h-4 w-4" />
          </button>
        )}
      </div>

      {linkOpen && (
        <div
          className="absolute right-2 top-12 z-10 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
          contentEditable={false}
        >
          <label className="mb-1 block text-xs font-semibold text-zinc-600" htmlFor="figure-href">
            Image links to
          </label>
          <input
            id="figure-href"
            value={draftHref}
            onChange={(e) => setDraftHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateAttributes({ href: draftHref.trim() || null });
                setLinkOpen(false);
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            External links get <code>rel=&quot;noopener noreferrer&quot;</code> automatically.
          </p>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- editor canvas, not
          a public page: sizes are unknown until the author picks an image, and
          next/image cannot render an arbitrary uploaded src here. */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-xl border border-zinc-200 object-cover"
      />

      {/*
        The caption. `as="figcaption"` keeps the DOM semantic, and because this
        is NodeViewContent the text inside carries real marks — including links.
      */}
      <NodeViewContent<"figcaption">
        as="figcaption"
        className="mt-2 text-center text-sm text-zinc-500 empty:before:text-zinc-400 empty:before:content-['Write_a_caption…'] [&_a]:text-primary [&_a]:underline"
      />

      {!alt && (
        <p className="mt-1 text-center text-xs font-semibold text-amber-600" contentEditable={false}>
          Missing alt text — this image cannot be saved until it is described.
        </p>
      )}
    </NodeViewWrapper>
  );
}
