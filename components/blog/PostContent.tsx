// The canonical renderer for post content.
//
// Walks contentJson and maps each node to a component. Deliberately NOT
// dangerouslySetInnerHTML: the stored HTML is sanitised, but rendering from the
// JSON means the website, the admin preview and (in shape) the mobile renderer
// all agree on what each node looks like, and an unknown node degrades to
// nothing rather than injecting markup.
//
// Used by both the public /blog pages and the admin preview, so what the author
// sees really is what ships.

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogDoc, BlogNode, ContentNode, FigureAlignment, TextNode } from "@/lib/blog/nodes";

function isText(node: BlogNode): node is TextNode {
  return node.type === "text";
}

/** Wraps a text node in an element per mark, innermost first. */
function renderText(node: TextNode, key: string): ReactNode {
  let out: ReactNode = node.text;

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong>{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "underline":
        out = <u>{out}</u>;
        break;
      case "strike":
        out = <s>{out}</s>;
        break;
      case "code":
        out = (
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em] text-zinc-800">{out}</code>
        );
        break;
      case "link": {
        const attrs = mark.attrs as { href?: string; target?: string | null; rel?: string | null };
        const href = attrs?.href ?? "#";
        // Internal links go through next/link for client-side navigation;
        // external ones keep the rel/target the backend normalised onto them.
        out = href.startsWith("/") ? (
          <Link href={href} className="text-forest-moss-700 underline underline-offset-2">
            {out}
          </Link>
        ) : (
          <a
            href={href}
            target={attrs?.target ?? undefined}
            rel={attrs?.rel ?? "noopener noreferrer"}
            className="text-forest-moss-700 underline underline-offset-2"
          >
            {out}
          </a>
        );
        break;
      }
      default:
        // An unknown mark renders its text unstyled rather than dropping it.
        break;
    }
  }

  return <span key={key}>{out}</span>;
}

const FIGURE_CLASS: Record<FigureAlignment, string> = {
  left: "mr-auto max-w-md",
  center: "mx-auto",
  full: "w-full",
};

function Figure({ node, index }: { node: ContentNode; index: number }) {
  const attrs = (node.attrs ?? {}) as {
    src?: string;
    alt?: string;
    width?: number | null;
    height?: number | null;
    align?: FigureAlignment;
    href?: string | null;
    lqip?: string | null;
  };

  if (!attrs.src) return null;

  const align = attrs.align ?? "center";
  const width = attrs.width ?? 1200;
  const height = attrs.height ?? 800;

  const image = (
    <Image
      src={attrs.src}
      alt={attrs.alt ?? ""}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, 768px"
      // The backend stores a 20px blurred data URI on the media row; when the
      // author's document carries it we get an instant placeholder.
      {...(attrs.lqip ? { placeholder: "blur" as const, blurDataURL: attrs.lqip } : {})}
      className="h-auto w-full rounded-xl"
    />
  );

  return (
    <figure key={index} className={`my-8 ${FIGURE_CLASS[align]}`}>
      {attrs.href ? (
        <a href={attrs.href} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
      {(node.content?.length ?? 0) > 0 && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500">
          {renderNodes(node.content ?? [], `fig-${index}`)}
        </figcaption>
      )}
    </figure>
  );
}

function renderNodes(nodes: BlogNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, i) => renderNode(node, `${keyPrefix}-${i}`, i));
}

function renderNode(node: BlogNode, key: string, index: number): ReactNode {
  if (isText(node)) return renderText(node, key);

  const children = renderNodes(node.content ?? [], key);

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="my-4 leading-relaxed text-zinc-700">
          {children}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const id = headingId(node);
      const common = "font-heading font-black text-zinc-900 scroll-mt-24";
      if (level === 2)
        return (
          <h2 key={key} id={id} className={`${common} mt-10 mb-3 text-2xl`}>
            {children}
          </h2>
        );
      if (level === 3)
        return (
          <h3 key={key} id={id} className={`${common} mt-8 mb-2 text-xl`}>
            {children}
          </h3>
        );
      return (
        <h4 key={key} id={id} className={`${common} mt-6 mb-2 text-lg`}>
          {children}
        </h4>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="my-4 list-disc space-y-1 pl-6 text-zinc-700">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="my-4 list-decimal space-y-1 pl-6 text-zinc-700">
          {children}
        </ol>
      );

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          cite={(node.attrs?.cite as string) ?? undefined}
          className="my-6 border-l-4 border-forest-moss-300 bg-zinc-50 py-2 pl-4 italic text-zinc-600"
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          data-language={(node.attrs?.language as string) ?? undefined}
          className="my-6 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100"
        >
          <code>{children}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-8 border-zinc-200" />;

    case "hardBreak":
      return <br key={key} />;

    case "figure":
      return <Figure key={key} node={node} index={index} />;

    // Tables must scroll on narrow viewports rather than break the layout.
    case "table":
      return (
        <div key={key} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key}>{children}</tr>;

    case "tableHeader":
      return (
        <th
          key={key}
          colSpan={(node.attrs?.colspan as number) ?? undefined}
          rowSpan={(node.attrs?.rowspan as number) ?? undefined}
          className="border border-zinc-200 bg-zinc-50 p-2 text-left font-semibold"
        >
          {children}
        </th>
      );

    case "tableCell":
      return (
        <td
          key={key}
          colSpan={(node.attrs?.colspan as number) ?? undefined}
          rowSpan={(node.attrs?.rowspan as number) ?? undefined}
          className="border border-zinc-200 p-2 align-top"
        >
          {children}
        </td>
      );

    default:
      // A node type added later renders nothing rather than crashing the page.
      return null;
  }
}

/** Stable anchor for a heading, used by the table of contents. */
export function headingId(node: BlogNode): string {
  const text = collectText(node);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Flattens a node's text — used for heading ids and the ToC labels. */
export function collectText(node: BlogNode): string {
  if (isText(node)) return node.text;
  return (node.content ?? []).map(collectText).join("");
}

/** Every h2/h3 in the document, in order — the table of contents source. */
export function extractHeadings(doc: BlogDoc): { id: string; text: string; level: number }[] {
  return (doc.content ?? [])
    .filter((n): n is ContentNode => !isText(n) && n.type === "heading")
    .map((n) => ({
      id: headingId(n),
      text: collectText(n),
      level: (n.attrs?.level as number) ?? 2,
    }))
    .filter((h) => h.text.length > 0);
}

export function PostContent({ doc }: { doc: BlogDoc }) {
  return <div className="blog-content">{renderNodes(doc.content ?? [], "n")}</div>;
}
