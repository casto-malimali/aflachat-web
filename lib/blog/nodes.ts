// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT                                             ║
// ║  Copied from backend/src/blog/schema/nodes.ts by `npm run sync:blog-schema` ║
// ║  Edit the source in the backend, then re-run the sync.                    ║
// ║  sha256: 744e37537434bab7b5c2d491c88ef1abe4b099f461eb251c5b268002be626635  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL blog content schema — the single source of truth for which TipTap
// nodes and marks exist, what attributes they carry, and how they serialise.
//
// This file is copied verbatim into the web and mobile repos by
// `npm run sync:blog-schema`, which stamps a checksum header into each copy and
// fails if one has drifted. Edit it HERE and re-run the sync — never edit a
// copy. Drift between the editor, the HTML generator, and the two renderers is
// the main failure mode of this feature.
//
// Consumers:
//   backend            derive.ts (generateHTML + sanitise), zod content validator
//   aflachat-web       admin TipTap editor + public React renderer
//   aflatoxin-master   native renderer + WebView fallback
// ─────────────────────────────────────────────────────────────────────────────

/** Marks allowed anywhere inline content is permitted. */
export const ALLOWED_MARKS = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
] as const;

/** Block + inline nodes allowed in a post body. */
export const ALLOWED_NODES = [
  'doc',
  'text',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
  // The caption is this node's own inline content — there is no separate
  // `figcaption` node. See the note on Figure in extensions.ts: ProseMirror
  // forbids a content hole that shares a parent with the <img>. The rendered
  // HTML still contains a real <figcaption> element.
  'figure',
] as const;

export type MarkType = (typeof ALLOWED_MARKS)[number];
export type NodeType = (typeof ALLOWED_NODES)[number];

/** h1 is the post title, rendered by the page — the body may only use h2–h4. */
export const HEADING_LEVELS = [2, 3, 4] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

/** Figure alignment, mapped to a layout class by each renderer. */
export const FIGURE_ALIGNMENTS = ['left', 'center', 'full'] as const;
export type FigureAlignment = (typeof FIGURE_ALIGNMENTS)[number];

/**
 * Languages offered in the code block dropdown. Anything else is stored as
 * null and rendered unhighlighted rather than rejected, so a paste from an
 * unsupported language does not fail validation.
 */
export const CODE_LANGUAGES = [
  'bash',
  'css',
  'html',
  'json',
  'javascript',
  'typescript',
  'python',
  'sql',
  'yaml',
] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

// ── Document types ───────────────────────────────────────────────────────────
// A structurally-typed mirror of TipTap's JSON output. Deliberately not
// imported from @tiptap/core so the mobile app can consume this file without
// pulling in the editor.

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

export interface Mark {
  type: MarkType;
  attrs?: LinkAttrs | Record<string, never>;
}

export interface LinkAttrs {
  href: string;
  target?: string | null;
  rel?: string | null;
}

export interface FigureAttrs {
  src: string;
  /** Required — enforced in the DTO validator, not only in the UI. */
  alt: string;
  width: number | null;
  height: number | null;
  align: FigureAlignment;
  /** When set, the <img> is wrapped in an <a>. */
  href?: string | null;
}

export interface ContentNode {
  type: Exclude<NodeType, 'text'>;
  attrs?: Record<string, unknown>;
  content?: BlogNode[];
}

export type BlogNode = TextNode | ContentNode;

export interface BlogDoc {
  type: 'doc';
  content: BlogNode[];
}

/** An empty document — the default for a new post. */
export const EMPTY_DOC: BlogDoc = { type: 'doc', content: [] };

// ── Structural rules ─────────────────────────────────────────────────────────
// Used by the recursive content validator and by the renderers when deciding
// whether a node's children are inline or block.

/** Nodes whose children are inline content (text + marks). */
export const INLINE_CONTENT_NODES: readonly NodeType[] = [
  'paragraph',
  'heading',
  'codeBlock',
  'figure', // its inline content is the caption
];

/** Nodes the native mobile renderer cannot render well — WebView fallback. */
export const WEBVIEW_FALLBACK_NODES: readonly NodeType[] = ['table'];

/** Hard limits, mirrored by the zod validator to reject pathological payloads. */
export const CONTENT_LIMITS = {
  /** Deepest permitted nesting of the node tree. */
  maxDepth: 20,
  /** Total nodes in one document. */
  maxNodes: 5_000,
  /** Longest single text node, in characters. */
  maxTextLength: 20_000,
} as const;

// ── Link handling ────────────────────────────────────────────────────────────

/** Only these schemes may appear in a link href or a figure href. */
export const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:'] as const;

/**
 * True when `href` points off-site and so must carry
 * rel="noopener noreferrer". Relative links are always internal.
 */
export function isExternalUrl(href: string, siteHost: string): boolean {
  try {
    return new URL(href, `https://${siteHost}`).host !== siteHost;
  } catch {
    return false;
  }
}

/**
 * Normalises a link mark's attributes: forces noopener/noreferrer on external
 * links and drops a target on internal ones. Applied on write, so stored
 * content is already correct and no renderer has to remember this rule.
 */
export function normaliseLinkAttrs(attrs: LinkAttrs, siteHost: string): LinkAttrs {
  const external = isExternalUrl(attrs.href, siteHost);
  return {
    href: attrs.href,
    target: external ? '_blank' : null,
    rel: external ? 'noopener noreferrer' : null,
  };
}

// ── HTML sanitisation ────────────────────────────────────────────────────────

/**
 * Allowlist for `sanitize-html`, applied to the output of generateHTML before
 * it is persisted. Kept in this file so it can never fall out of step with the
 * node list above: anything the schema can produce must be listed here, and
 * nothing else is permitted through.
 */
export const SANITIZE_OPTIONS = {
  allowedTags: [
    'p',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'hr',
    'br',
    'strong',
    'em',
    'u',
    's',
    'a',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'figure',
    'figcaption',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
    // data-align carries the figure's layout choice; without it here the
    // sanitiser silently drops alignment on every image.
    figure: ['class', 'data-align'],
    blockquote: ['cite'],
    pre: ['data-language'],
    code: ['class'],
    th: ['colspan', 'rowspan', 'style'],
    td: ['colspan', 'rowspan', 'style'],
  },
  // Column widths from the editor's table resizing are the only styles kept.
  allowedStyles: {
    th: { width: [/^\d+(?:px|%)$/] },
    td: { width: [/^\d+(?:px|%)$/] },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // A src/href with no scheme resolves against the site, which is fine; one
  // with a disallowed scheme (javascript:, data:) has the attribute stripped.
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard' as const,
};
