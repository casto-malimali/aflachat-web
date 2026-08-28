"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Code,
  FileCode2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from "lucide-react";
import { blogExtensions } from "@/lib/blog/extensions";
import { uploadImage, mediaUrl } from "@/lib/blogApi";
import type { BlogDoc } from "@/lib/blog/nodes";
import {
  isMarkdown,
  markdownToHtml,
  insertMarkdownIntoEditor,
} from "@/lib/blog/markdownConverter";

interface Props {
  value: BlogDoc;
  onChange: (doc: BlogDoc) => void;
  /** Surfaces upload failures to the page so it can show them in context. */
  onError?: (message: string) => void;
}

const BLOCK_TYPES = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Quote", value: "blockquote" },
  { label: "Code block", value: "codeBlock" },
] as const;

type BlockType = (typeof BLOCK_TYPES)[number]["value"];

function currentBlock(editor: Editor): BlockType {
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  if (editor.isActive("heading", { level: 4 })) return "h4";
  if (editor.isActive("blockquote")) return "blockquote";
  if (editor.isActive("codeBlock")) return "codeBlock";
  return "paragraph";
}

function applyBlock(editor: Editor, value: BlockType) {
  const chain = editor.chain().focus();
  if (value === "paragraph") chain.setParagraph().run();
  else if (value === "blockquote") chain.toggleBlockquote().run();
  else if (value === "codeBlock") chain.toggleCodeBlock().run();
  else chain.toggleHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
}

/** Side effects a slash command may need beyond the editor itself. */
interface SlashContext {
  openFilePicker: () => void;
  openMarkdownModal: () => void;
}

/** Keyboard-first insertion menu, triggered by typing "/" in a paragraph. */
const SLASH_COMMANDS: {
  label: string;
  keywords: string[];
  icon: typeof ImageIcon;
  run: (e: Editor, ctx: SlashContext) => void;
}[] = [
  {
    label: "Image",
    keywords: ["image", "img", "photo", "picture"],
    icon: ImageIcon,
    run: (_e, ctx) => ctx.openFilePicker(),
  },
  {
    label: "Import Markdown",
    keywords: ["markdown", "md", "paste", "import"],
    icon: FileCode2,
    run: (_e, ctx) => ctx.openMarkdownModal(),
  },
  {
    label: "Table",
    keywords: ["table", "grid"],
    icon: TableIcon,
    run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    label: "Quote",
    keywords: ["quote", "blockquote"],
    icon: Quote,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code block",
    keywords: ["code", "codeblock", "pre"],
    icon: Code,
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: "Bullet list",
    keywords: ["list", "bullet", "ul"],
    icon: List,
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    keywords: ["ordered", "numbers", "ol"],
    icon: ListOrdered,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Divider",
    keywords: ["divider", "hr", "rule", "separator"],
    icon: Minus,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-primary/10 text-primary" : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BlogEditor({ value, onChange, onError }: Props) {
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

  // Markdown Import Modal state
  const [markdownModalOpen, setMarkdownModalOpen] = useState(false);
  const [markdownText, setMarkdownText] = useState("");
  const [markdownReplace, setMarkdownReplace] = useState(false);

  // Notification for actions (e.g. smart markdown conversion)
  const [notification, setNotification] = useState<string | null>(null);

  /** null when the slash menu is closed; otherwise the text typed after "/". */
  const [slashQuery, setSlashQuery] = useState<string | null>(null);

  const editor = useEditor({
    extensions: blogExtensions(),
    content: value,
    // Next renders this on the server first; without it React hydration warns.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none min-h-[26rem] px-6 py-5 outline-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:border-zinc-200 [&_td]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:p-2.5 [&_td]:p-2.5 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        // 1. Handle image file paste
        const file = Array.from(event.clipboardData?.files ?? [])[0];
        if (file?.type.startsWith("image/")) {
          event.preventDefault();
          void insertImage(file);
          return true;
        }

        // 2. Handle Markdown text paste
        const plainText = event.clipboardData?.getData("text/plain");
        if (plainText && isMarkdown(plainText)) {
          event.preventDefault();
          const html = markdownToHtml(plainText);
          if (editor) {
            editor.commands.insertContent(html);
            setNotification("✨ Markdown formatted automatically into WYSIWYG content");
            setTimeout(() => setNotification(null), 4000);
            return true;
          }
        }

        return false;
      },
      handleDrop: (_view, event) => {
        const file = Array.from((event as DragEvent).dataTransfer?.files ?? [])[0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void insertImage(file);
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON() as BlogDoc);
      updateSlashMenu(e);
    },
  });

  /**
   * Slash commands without the suggestion plugin: when the text immediately
   * before the cursor is `/word` at the start of an empty-ish paragraph, show
   * the menu filtered by `word`. Running a command deletes the typed trigger
   * first, so the "/image" text never survives into the document.
   */
  const updateSlashMenu = useCallback((e: Editor) => {
    const { $from, empty } = e.state.selection;
    if (!empty || $from.parent.type.name !== "paragraph") {
      setSlashQuery(null);
      return;
    }
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
    const match = /^\/(\w*)$/.exec(textBefore);
    setSlashQuery(match ? match[1] : null);
  }, []);

  const runSlashCommand = useCallback(
    (run: (e: Editor, ctx: SlashContext) => void) => {
      if (!editor || slashQuery === null) return;
      const { $from } = editor.state.selection;
      const from = $from.pos - (slashQuery.length + 1); // +1 for the "/"
      editor.chain().focus().deleteRange({ from, to: $from.pos }).run();
      run(editor, {
        openFilePicker: () => fileInputRef.current?.click(),
        openMarkdownModal: () => setMarkdownModalOpen(true),
      });
      setSlashQuery(null);
    },
    [editor, slashQuery],
  );

  /**
   * Uploads a file then inserts a figure for it, leaving the cursor in the
   * caption so the author can type immediately.
   */
  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploadPercent(0);
      try {
        const result = await uploadImage(file, setUploadPercent);
        const altSeed = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();

        editor
          .chain()
          .focus()
          .insertContent({
            type: "figure",
            attrs: {
              src: mediaUrl(result.media.path),
              alt: altSeed || "Image",
              width: result.media.width,
              height: result.media.height,
              align: "center",
            },
            content: [],
          })
          .run();
      } catch (err) {
        onError?.((err as Error).message);
      } finally {
        setUploadPercent(null);
      }
    },
    [editor, onError],
  );

  // Keep the editor in step when the document is replaced from outside
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  /** Opens the link popover, seeded from the mark under the cursor if any. */
  const openLinkEditor = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link") as { href?: string; target?: string };
    setLinkDraft(attrs.href ?? "");
    setLinkNewTab(attrs.target === "_blank" || !attrs.href);
    setLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = linkDraft.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href,
          target: linkNewTab ? "_blank" : null,
          rel: linkNewTab ? "noopener noreferrer" : null,
        })
        .run();
    }
    setLinkOpen(false);
  }, [editor, linkDraft, linkNewTab]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  }, [editor]);

  const handleApplyMarkdown = useCallback(() => {
    if (!editor || !markdownText.trim()) return;
    insertMarkdownIntoEditor(editor, markdownText, markdownReplace);
    setMarkdownModalOpen(false);
    setMarkdownText("");
    setNotification(
      markdownReplace
        ? "✨ Replaced document with formatted Markdown"
        : "✨ Inserted formatted Markdown into document",
    );
    setTimeout(() => setNotification(null), 4000);
  }, [editor, markdownText, markdownReplace]);

  if (!editor) return <div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {/* WYSIWYG Main Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white/95 px-3 py-2 backdrop-blur">
        <select
          value={currentBlock(editor)}
          onChange={(e) => applyBlock(editor, e.target.value as BlockType)}
          aria-label="Block type"
          className="mr-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm font-medium text-zinc-800 outline-none focus:border-primary"
        >
          {BLOCK_TYPES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <ToolbarButton title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolbarButton title="Link (Ctrl+K)" active={editor.isActive("link")} onClick={openLinkEditor}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Quote block" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolbarButton title="Insert image" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Insert table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Markdown Paste/Import Tool */}
        <button
          type="button"
          title="Paste / Import Markdown"
          onClick={() => setMarkdownModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-forest-moss-200 bg-forest-moss-50 px-2.5 py-1 text-xs font-bold text-forest-moss-800 transition-colors hover:bg-forest-moss-100 hover:border-forest-moss-300"
        >
          <FileCode2 className="h-3.5 w-3.5 text-forest-moss-600" />
          <span>Paste MD</span>
        </button>

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolbarButton title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        {uploadPercent !== null && (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-zinc-500">
            Uploading {uploadPercent}%
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200">
              <span
                className="block h-full bg-primary transition-all"
                style={{ width: `${uploadPercent}%` }}
              />
            </span>
          </span>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="flex items-center justify-between border-b border-forest-moss-200 bg-forest-moss-50 px-4 py-2 text-xs font-semibold text-forest-moss-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-forest-moss-600" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded p-1 text-forest-moss-600 hover:bg-forest-moss-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Link Editor Bar */}
      {linkOpen && (
        <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") setLinkOpen(false);
              }}
              placeholder="https://example.com"
              aria-label="Link URL"
              autoFocus
              className="min-w-[16rem] flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm outline-none focus:border-forest-moss-500"
            />
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
              />
              Open in new tab
            </label>
            <button
              type="button"
              onClick={applyLink}
              className="rounded-lg bg-forest-moss-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-moss-700"
            >
              Apply
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={removeLink}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Remove link
              </button>
            )}
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
            >
              Cancel
            </button>
          </div>
          {linkDraft && !/^(https?:\/\/|mailto:|\/|#)/i.test(linkDraft.trim()) && (
            <p className="mt-1 text-[11px] font-medium text-amber-600">
              Links must start with http://, https://, mailto:, / or # — the API rejects anything else.
            </p>
          )}
        </div>
      )}

      {/* Table Action Controls */}
      {editor.isActive("table") && (
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs">
          {[
            ["Add row", () => editor.chain().focus().addRowAfter().run()],
            ["Add column", () => editor.chain().focus().addColumnAfter().run()],
            ["Delete row", () => editor.chain().focus().deleteRow().run()],
            ["Delete column", () => editor.chain().focus().deleteColumn().run()],
            ["Toggle header", () => editor.chain().focus().toggleHeaderRow().run()],
            ["Merge cells", () => editor.chain().focus().mergeCells().run()],
            ["Split cell", () => editor.chain().focus().splitCell().run()],
            ["Delete table", () => editor.chain().focus().deleteTable().run()],
          ].map(([label, action]) => (
            <button
              key={label as string}
              type="button"
              onClick={action as () => void}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-medium text-zinc-600 hover:bg-zinc-100"
            >
              {label as string}
            </button>
          ))}
        </div>
      )}

      {/* Floating Bubble Menu on Selection */}
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        shouldShow={({ editor: e, from, to }) =>
          from !== to && !e.isActive("figure")
        }
      >
        <div className="flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg backdrop-blur">
          <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Link" active={editor.isActive("link")} onClick={openLinkEditor}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </BubbleMenu>

      {/* Slash Commands Dropdown */}
      {slashQuery !== null && (
        <div className="relative">
          <div className="absolute left-6 z-20 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
            {SLASH_COMMANDS.filter((c) =>
              c.keywords.some((k) => k.startsWith(slashQuery.toLowerCase())),
            ).map((c) => (
              <button
                key={c.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  runSlashCommand(c.run);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <c.icon className="h-4 w-4 text-zinc-400" />
                {c.label}
              </button>
            ))}
            {SLASH_COMMANDS.every(
              (c) => !c.keywords.some((k) => k.startsWith(slashQuery.toLowerCase())),
            ) && <p className="px-3 py-2 text-sm text-zinc-400">No matching command</p>}
          </div>
        </div>
      )}

      {/* Main WYSIWYG Content Area */}
      <EditorContent editor={editor} />

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = "";
        }}
      />

      {/* Markdown Paste / Import Modal */}
      {markdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-moss-100 text-forest-moss-700">
                  <FileCode2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-zinc-900">Paste or Import Markdown</h3>
                  <p className="text-xs text-zinc-500">
                    Paste raw Markdown text (headings, lists, tables, links, bold/italic, code blocks) to convert into rich WYSIWYG format.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMarkdownModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                value={markdownText}
                onChange={(e) => setMarkdownText(e.target.value)}
                placeholder={`# Topic Heading\n\nThis is a paragraph with **bold text** and [a link](https://example.com).\n\n## Subheading\n- Item 1\n- Item 2\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Data A | Data B |`}
                rows={10}
                className="w-full rounded-xl border border-zinc-200 p-3.5 font-mono text-xs text-zinc-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                autoFocus
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markdownReplace}
                    onChange={(e) => setMarkdownReplace(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                  />
                  <span>Replace entire article content (uncheck to insert at cursor)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkdownModalOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!markdownText.trim()}
                    onClick={handleApplyMarkdown}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Format & Insert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
