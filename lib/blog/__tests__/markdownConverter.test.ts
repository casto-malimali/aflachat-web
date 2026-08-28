import { describe, expect, it } from "vitest";
import { isMarkdown, markdownToHtml } from "../markdownConverter";

describe("markdownConverter", () => {
  describe("isMarkdown", () => {
    it("detects headings", () => {
      expect(isMarkdown("# Heading 1")).toBe(true);
      expect(isMarkdown("## Subheading")).toBe(true);
    });

    it("detects bold and italic text", () => {
      expect(isMarkdown("This has **bold text** in it")).toBe(true);
      expect(isMarkdown("This has *italic text* in it")).toBe(true);
      expect(isMarkdown("This has _italic text_ in it")).toBe(true);
    });

    it("detects lists", () => {
      expect(isMarkdown("- Bullet item 1\n- Bullet item 2")).toBe(true);
      expect(isMarkdown("1. First item\n2. Second item")).toBe(true);
    });

    it("detects blockquotes", () => {
      expect(isMarkdown("> A memorable quote from a study.")).toBe(true);
    });

    it("detects code blocks and inline code", () => {
      expect(isMarkdown("```javascript\nconsole.log(1);\n```")).toBe(true);
      expect(isMarkdown("Check the `myVariable` value.")).toBe(true);
    });

    it("detects links and images", () => {
      expect(isMarkdown("Check this [website](https://example.com) for details.")).toBe(true);
      expect(isMarkdown("![Alt](https://example.com/img.jpg)")).toBe(true);
    });

    it("detects markdown tables", () => {
      const table = `| Col 1 | Col 2 |\n| --- | --- |\n| Val 1 | Val 2 |`;
      expect(isMarkdown(table)).toBe(true);
    });

    it("returns false for plain sentences", () => {
      expect(isMarkdown("Just a regular sentence with no special markdown formatting.")).toBe(false);
      expect(isMarkdown("Another plain paragraph with numbers like 10 and 20.")).toBe(false);
    });
  });

  describe("markdownToHtml", () => {
    it("converts headings with normalized levels (H1 -> H2)", () => {
      const md = "# Top Level Title\n\n### Sub-section";
      const html = markdownToHtml(md);
      expect(html).toContain("<h2>Top Level Title</h2>");
      expect(html).toContain("<h3>Sub-section</h3>");
    });

    it("converts formatting marks (bold, italic, strikethrough, code)", () => {
      const md = "**Bold** and *Italic* and ~~Struck~~ and `Code`";
      const html = markdownToHtml(md);
      expect(html).toContain("<strong>Bold</strong>");
      expect(html).toContain("<em>Italic</em>");
      expect(html).toContain("<del>Struck</del>");
      expect(html).toContain("<code>Code</code>");
    });

    it("converts lists", () => {
      const md = "- Item A\n- Item B\n\n1. Step 1\n2. Step 2";
      const html = markdownToHtml(md);
      expect(html).toContain("<ul>");
      expect(html).toContain("<li>Item A</li>");
      expect(html).toContain("<ol>");
      expect(html).toContain("<li>Step 1</li>");
    });

    it("converts blockquotes and code blocks", () => {
      const md = "> Wisdom quote\n\n```python\nprint('hello')\n```";
      const html = markdownToHtml(md);
      expect(html).toContain("<blockquote>");
      expect(html).toContain("<pre><code");
    });

    it("converts markdown tables to HTML table elements", () => {
      const md = `| Crop | Moisture |\n| :--- | :--- |\n| Maize | 13.5% |`;
      const html = markdownToHtml(md);
      expect(html).toContain("<table>");
      expect(html).toContain("Crop</th>");
      expect(html).toContain("Maize</td>");
    });

    it("converts standalone images to figure elements with center alignment", () => {
      const md = "![Hermetic Bag](https://example.com/bag.jpg)";
      const html = markdownToHtml(md);
      expect(html).toContain('<figure data-align="center">');
      expect(html).toContain('<img src="https://example.com/bag.jpg" alt="Hermetic Bag"');
      expect(html).toContain("<figcaption>Hermetic Bag</figcaption>");
    });
  });
});
