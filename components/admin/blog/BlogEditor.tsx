"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { blogExtensions } from "@/lib/blog/extensions";
import { uploadImage, mediaUrl } from "@/lib/blogApi";
import type { BlogDoc } from "@/lib/blog/nodes";

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
          "prose prose-zinc max-w-none min-h-[24rem] px-6 py-5 outline-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:border-zinc-200 [&_td]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:p-2 [&_td]:p-2",
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? [])[0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void insertImage(file);
        return true;
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
      run(editor, { openFilePicker: () => fileInputRef.current?.click() });
      setSlashQuery(null);
    },
    [editor, slashQuery],
  );

  /**
   * Uploads a file then inserts a figure for it, leaving the cursor in the
   * caption so the author can type immediately.
   *
   * Alt text is seeded from the filename because the API rejects a figure
   * without it — an empty alt would make the post unsaveable, and a weak
   * default the author can fix beats a hard block mid-flow.
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

  // Keep the editor in step when the document is replaced from outside — a
  // revision restore, for instance. Guarded against feeding back our own
  // onUpdate, which would reset the cursor on every keystroke.
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
          // The backend forces this on external links anyway; setting it here
          // keeps the editor's own DOM consistent with what gets stored.
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

  if (!editor) return <div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white/95 px-3 py-2 backdrop-blur">
        <select
          value={currentBlock(editor)}
          onChange={(e) => applyBlock(editor, e.target.value as BlockType)}
          aria-label="Block type"
          className="mr-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {BLOCK_TYPES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={openLinkEditor}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
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

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
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

      {/* Formatting menu that follows a text selection. */}
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        shouldShow={({ editor: e, from, to }) =>
          // Not for figures: those have their own controls in the node view.
          from !== to && !e.isActive("figure")
        }
      >
        <div className="flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
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
                  // mousedown, not click: clicking would blur the editor first
                  // and lose the selection the command needs.
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

      <EditorContent editor={editor} />

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
    </div>
  );
}
