/**
 * Snapshot + coverage tests for the web renderer, run against the SHARED
 * fixture (lib/blog/fixture.ts, generated from the backend).
 *
 * The same document drives the backend HTML generator and the mobile renderer,
 * so all three surfaces are proven against the full node set.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostContent, extractHeadings } from "../PostContent";
import { ALL_NODES_FIXTURE } from "@/lib/blog/fixture";

// next/image needs the Next runtime; a plain <img> is enough to assert that
// the figure renders its source, alt text and caption.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PostContent", () => {
  it("matches the snapshot for the full node set", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders every heading level the schema allows", () => {
    render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Drying maize safely");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Before storage");
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("A note");
  });

  it("gives headings stable ids for the table of contents", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.querySelector("#drying-maize-safely")).not.toBeNull();
    expect(container.querySelector("#before-storage")).not.toBeNull();
  });

  it("renders all inline marks", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.querySelector("strong")).toHaveTextContent("13% moisture");
    expect(container.querySelector("em")).toHaveTextContent("Never");
    expect(container.querySelector("u")).toHaveTextContent("warning");
    expect(container.querySelector("s")).toHaveTextContent("Old advice");
    expect(container.querySelector("code")).toHaveTextContent("moisture_meter");
  });

  it("renders lists, including nesting", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.querySelectorAll("ul").length).toBeGreaterThanOrEqual(2); // nested
    expect(container.querySelector("ol")).not.toBeNull();
    expect(screen.getByText("Use a tarpaulin")).toBeTruthy();
  });

  it("renders blockquote with its cite attribute", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const quote = container.querySelector("blockquote");
    expect(quote).toHaveTextContent("Dry grain is safe grain.");
    expect(quote?.getAttribute("cite")).toBe("https://example.com/source");
  });

  it("renders a code block carrying its language", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const pre = container.querySelector("pre");
    expect(pre?.getAttribute("data-language")).toBe("bash");
    expect(pre).toHaveTextContent("moisture --check maize.csv");
  });

  it("renders a horizontal rule and a hard break", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.querySelector("hr")).not.toBeNull();
    expect(container.querySelector("br")).not.toBeNull();
  });

  it("wraps tables so they scroll instead of breaking the layout", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.parentElement?.className).toContain("overflow-x-auto");
  });

  it("preserves a merged table cell", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    expect(container.querySelector("td[colspan='2']")).not.toBeNull();
  });

  it("renders the figure as semantic markup with the image inside its link", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const figure = container.querySelector("figure");
    expect(figure).not.toBeNull();

    const anchor = figure?.querySelector("a[href='https://example.com/photo']");
    expect(anchor?.querySelector("img")).not.toBeNull();
    expect(figure?.querySelector("img")?.getAttribute("alt")).toBe(
      "Maize drying on a raised rack",
    );
  });

  it("renders two independent links inside the caption", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const caption = container.querySelector("figcaption");
    const links = caption?.querySelectorAll("a") ?? [];

    // The requirement the custom figure node exists for.
    expect(links.length).toBe(2);
    expect(links[0].getAttribute("href")).toBe("https://example.com/jane");
    expect(links[1].getAttribute("href")).toBe("https://example.com/source");
  });

  it("keeps rel/target on external links and omits them internally", () => {
    const { container } = render(<PostContent doc={ALL_NODES_FIXTURE} />);
    const external = container.querySelector("a[href='https://example.com/guide']");
    expect(external?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(external?.getAttribute("target")).toBe("_blank");

    const internal = container.querySelector("a[href='/services']");
    expect(internal?.getAttribute("target")).toBeNull();
  });

  it("renders nothing for an unknown future node instead of crashing", () => {
    const doc = {
      type: "doc" as const,
      content: [
        { type: "paragraph", content: [{ type: "text" as const, text: "before" }] },
        { type: "mermaidDiagram", attrs: { code: "graph TD" }, content: [] },
        { type: "paragraph", content: [{ type: "text" as const, text: "after" }] },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<PostContent doc={doc as any} />);
    expect(screen.getByText("before")).toBeTruthy();
    expect(screen.getByText("after")).toBeTruthy();
  });
});

describe("extractHeadings", () => {
  it("lists headings in document order with their levels", () => {
    expect(extractHeadings(ALL_NODES_FIXTURE)).toEqual([
      { id: "drying-maize-safely", text: "Drying maize safely", level: 2 },
      { id: "before-storage", text: "Before storage", level: 3 },
      { id: "a-note", text: "A note", level: 4 },
    ]);
  });

  it("returns nothing for a document with no headings", () => {
    expect(extractHeadings({ type: "doc", content: [] })).toEqual([]);
  });
});
