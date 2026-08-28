import { marked } from "marked";
import type { Editor } from "@tiptap/core";

/**
 * Detects whether a string looks like Markdown rather than plain text.
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;

  const patterns = [
    /^#{1,6}\s+\S+/m, // Headings: # H1, ## H2, etc.
    /(\*\*|__)(?!\s)(.+?)(?<!\s)\1/, // Bold: **text** or __text__
    /(?<!\*)\*(?!\s|\*)(.+?)(?<!\s|\*)\*(?!\*)/, // Italic: *text*
    /(?<!_)_(?!\s|_)(.+?)(?<!\s|_)\_(?!_)/, // Italic: _text_
    /^>\s+\S+/m, // Blockquotes: > quote
    /^[-*+]\s+\[[ xX]\]\s+\S+/m, // Task lists: - [x] task
    /^(\s*[-*+]|\s*\d+\.)\s+\S+/m, // Lists: - item or 1. item
    /```[\s\S]*?```/, // Code blocks: ```code```
    /`[^`\n]+`/, // Inline code: `code`
    /!?\[([^\]]+)\]\(([^)]+)\)/, // Links/Images: [title](url)
    /^(\*{3,}|-{3,}|_{3,})$/m, // Horizontal rules: ---
    /\|(.+\|)+[\r\n]+\|(\s*[-:]+[-| :]*\|)+/, // Tables: | col | col |
    /~~(?!\s)(.+?)(?<!\s)~~/, // Strikethrough: ~~text~~
  ];

  return patterns.some((p) => p.test(trimmed));
}

/**
 * Converts Markdown to HTML specifically tailored for TipTap's schema.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Parse markdown into HTML string using marked
  let html = marked.parse(markdown, {
    gfm: true,
    breaks: false,
    async: false,
  }) as string;

  // 1. Normalize heading levels (schema allows H2, H3, H4)
  // h1 becomes h2 (h1 is reserved for the article page title)
  html = html.replace(/<h1(\b[^>]*)>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");
  // h5, h6 become h4
  html = html.replace(/<h5(\b[^>]*)>/gi, "<h4$1>").replace(/<\/h5>/gi, "</h4>");
  html = html.replace(/<h6(\b[^>]*)>/gi, "<h4$1>").replace(/<\/h6>/gi, "</h4>");

  // 2. Transform standalone markdown <img> into <figure> nodes for TipTap's Figure extension
  html = html.replace(
    /<p>\s*<img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?[^>]*>\s*<\/p>/gi,
    (_match, src, alt) => {
      const cleanAlt = alt || "Image";
      return `<figure data-align="center"><img src="${src}" alt="${cleanAlt}" /><figcaption>${cleanAlt}</figcaption></figure>`;
    },
  );

  // 3. Ensure external links have safe attributes
  html = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"${rest}>`;
    }
    return match;
  });

  return html;
}

/**
 * Inserts or replaces Markdown content directly into the TipTap editor instance.
 */
export function insertMarkdownIntoEditor(
  editor: Editor,
  markdown: string,
  replace = false,
): void {
  const html = markdownToHtml(markdown);
  if (!html) return;

  if (replace) {
    editor.chain().focus().setContent(html).run();
  } else {
    editor.chain().focus().insertContent(html).run();
  }
}
