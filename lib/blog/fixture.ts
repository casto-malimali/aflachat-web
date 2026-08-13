// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT                                             ║
// ║  Copied from backend/src/blog/schema/nodes.ts by `npm run sync:blog-schema` ║
// ║  Edit the source in the backend, then re-run the sync.                    ║
// ║  sha256: 45e9f057c11a4bef1658e0d2a5f9f968fcabb7686146769dbe04cea382d221d2  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// THE shared fixture: one post exercising every supported node and mark.
//
// Copied into the web and mobile repos by `npm run sync:blog-schema` alongside
// nodes.ts, and used by:
//   backend          HTML generation + sanitisation tests
//   aflachat-web     PostContent snapshot test
//   aflatoxin-master PostRenderer snapshot test
//
// If you add a node type to nodes.ts, add it HERE too. All three surfaces are
// tested against this document, so a node missing from the fixture is a node
// nobody is proving they can render.
// ─────────────────────────────────────────────────────────────────────────────

import type { BlogDoc } from './nodes';

export const ALL_NODES_FIXTURE: BlogDoc = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Drying maize safely' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Dry maize to ' },
        { type: 'text', text: '13% moisture', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' before storage. ' },
        { type: 'text', text: 'Never', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' store it damp. ' },
        { type: 'text', text: 'Old advice', marks: [{ type: 'strike' }] },
        { type: 'text', text: ' — see the ' },
        {
          type: 'text',
          text: 'storage guide',
          marks: [
            {
              type: 'link',
              attrs: { href: 'https://example.com/guide', target: '_blank', rel: 'noopener noreferrer' },
            },
          ],
        },
        { type: 'text', text: ' and the ' },
        {
          type: 'text',
          text: 'internal checklist',
          marks: [{ type: 'link', attrs: { href: '/services' } }],
        },
        { type: 'text', text: '. Underlined ', marks: [] },
        { type: 'text', text: 'warning', marks: [{ type: 'underline' }] },
        { type: 'text', text: ' and inline ' },
        { type: 'text', text: 'moisture_meter', marks: [{ type: 'code' }] },
        { type: 'text', text: '.' },
      ],
    },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Before storage' }] },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Dry on a raised rack' }] },
          ],
        },
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Never dry on bare soil' }] },
            // Nested list — exercises recursion in every renderer.
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Use a tarpaulin' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sort the grain' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test the moisture' }] }],
        },
      ],
    },
    { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'A note' }] },
    {
      type: 'blockquote',
      attrs: { cite: 'https://example.com/source' },
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Dry grain is safe grain.' }] },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'bash' },
      content: [{ type: 'text', text: 'moisture --check maize.csv\necho done' }],
    },
    { type: 'horizontalRule' },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step' }] }],
            },
            {
              type: 'tableHeader',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Target' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Moisture' }] }],
            },
            {
              type: 'tableCell',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '13%' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              // Merged cell — exercises colspan handling.
              type: 'tableCell',
              attrs: { colspan: 2 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Store off the floor' }] }],
            },
          ],
        },
      ],
    },
    {
      // A figure whose caption carries two independent links — the requirement
      // that drove the custom node in the first place.
      type: 'figure',
      attrs: {
        src: '/media/blog/2026/08/example.jpg',
        alt: 'Maize drying on a raised rack',
        width: 1200,
        height: 800,
        align: 'center',
        href: 'https://example.com/photo',
      },
      content: [
        { type: 'text', text: 'Photo by ' },
        {
          type: 'text',
          text: 'Jane Doe',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/jane' } }],
        },
        { type: 'text', text: ' / ' },
        {
          type: 'text',
          text: 'Source',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/source' } }],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Line one' },
        { type: 'hardBreak' },
        { type: 'text', text: 'Line two' },
      ],
    },
  ],
};

/**
 * Hostile input for sanitisation tests. Every one of these must be neutralised
 * by the time content reaches a reader.
 */
export const XSS_FIXTURE: BlogDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'click me',
          marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'data uri',
          marks: [{ type: 'link', attrs: { href: 'data:text/html,<script>alert(1)</script>' } }],
        },
      ],
    },
    {
      type: 'figure',
      attrs: {
        src: 'x" onerror="alert(1)',
        alt: 'attempted breakout',
        align: 'center',
      },
      content: [{ type: 'text', text: '</figcaption><script>alert(1)</script>' }],
    },
  ],
};
