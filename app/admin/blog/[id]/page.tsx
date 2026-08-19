"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  History,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Undo2,
  X,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { Badge, Button, ErrorState, Panel, Spinner } from "@/components/admin/ui";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";
import { CoverImageUploader } from "@/components/admin/blog/CoverImageUploader";
import { MediaLibrary } from "@/components/admin/blog/MediaLibrary";
import { RevisionPanel } from "@/components/admin/blog/RevisionPanel";
import { PostContent } from "@/components/blog/PostContent";
import {
  blogApi,
  type Category,
  type Media,
  type Post,
  type PostInput,
  type PostStatus,
  type Tag,
} from "@/lib/blogApi";
import { EMPTY_DOC, type BlogDoc } from "@/lib/blog/nodes";
import { extractPlainTextFromDoc, generateAutoSeo } from "@/lib/blog/autoSeo";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 20_000;

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

const STATUS_TONE: Record<PostStatus, "forest" | "amber" | "slate"> = {
  PUBLISHED: "forest",
  SCHEDULED: "amber",
  DRAFT: "slate",
  ARCHIVED: "slate",
};

export default function BlogEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState<BlogDoc>(EMPTY_DOC);
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [coverImage, setCoverImage] = useState<Media | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagSaving, setTagSaving] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [autoSeoNotification, setAutoSeoNotification] = useState<string | null>(null);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [preview, setPreview] = useState<"off" | "desktop" | "mobile">("off");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  // Held in a ref so the autosave timer always sees the latest values without
  // being torn down and recreated on every keystroke.
  const latest = useRef({ title, doc, excerpt, metaTitle, metaDescription, coverImage, categoryIds, tagIds, scheduledFor });
  useEffect(() => {
    latest.current = { title, doc, excerpt, metaTitle, metaDescription, coverImage, categoryIds, tagIds, scheduledFor };
  });

  // Taxonomy is small and rarely changes — fetch once for the whole screen.
  useEffect(() => {
    Promise.all([blogApi.listCategories(), blogApi.listTags()])
      .then(([c, t]) => {
        setCategories(c.categories);
        setTags(t.tags);
      })
      .catch(() => {
        // Non-fatal: the author can still write without taxonomy.
      });
  }, []);

  useEffect(() => {
    if (isNew) return;
    let active = true;
    blogApi
      .getPost(params.id)
      .then(({ post: p }) => {
        if (!active) return;
        setPost(p);
        setTitle(p.title);
        setDoc(p.contentJson ?? EMPTY_DOC);
        setExcerpt(p.excerpt ?? "");
        setMetaTitle(p.metaTitle ?? "");
        setMetaDescription(p.metaDescription ?? "");
        setCoverImage(p.coverImage);
        setCategoryIds(p.categories.map((c) => c.id));
        setTagIds(p.tags.map((t) => t.id));
        // datetime-local wants "YYYY-MM-DDTHH:mm", not a full ISO string.
        setScheduledFor(p.scheduledFor ? p.scheduledFor.slice(0, 16) : "");
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isNew, params.id]);

  const save = useCallback(async (): Promise<Post | null> => {
    const {
      title: t,
      doc: d,
      excerpt: e,
      metaTitle: mt,
      metaDescription: md,
      coverImage: cover,
      categoryIds: cats,
      tagIds: tgs,
      scheduledFor: sched,
    } = latest.current;
    if (!t.trim()) {
      setError("A title is required before saving.");
      setSaveState("error");
      return null;
    }

    setSaveState("saving");
    const body: PostInput = {
      title: t,
      contentJson: d,
      excerpt: e || null,
      metaTitle: mt || null,
      metaDescription: md || null,
      coverImageId: cover?.id ?? null,
      categoryIds: cats,
      tagIds: tgs,
      // The input gives local wall-clock time; the API expects a real offset.
      scheduledFor: sched ? new Date(sched).toISOString() : null,
    };

    try {
      if (isNew) {
        const { post: created } = await blogApi.createPost(body);
        setPost(created);
        setSaveState("saved");
        // Swap out the `/new` URL for the real ID without a reload, so
        // future autosaves hit the update endpoint instead.
        router.replace(`/admin/blog/${created.id}`);
        return created;
      }
      const { post: updated } = await blogApi.updatePost(params.id, body);
      setPost(updated);
      setSaveState("saved");
      return updated;
    } catch (err) {
      setError((err as Error).message);
      setSaveState("error");
      return null;
    }
  }, [isNew, params.id, router]);

  // Mark dirty whenever local state changes so the author sees what's happening.
  const markDirty = useCallback(() => {
    setSaveState((prev) => (prev === "saving" ? "saving" : "dirty"));
  }, []);

  // Autosave: timer resets every 20s while dirty, quiet while idle.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(() => {
      void save();
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [saveState, save]);

  // Warn before closing the tab with unpersisted edits.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  const publish = async () => {
    const saved = await save();
    if (!saved) return;
    try {
      const { post: published } = await blogApi.publish(saved.id);
      setPost(published);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /** Saves, then moves the post to SCHEDULED for the chosen time. */
  const schedule = async () => {
    const saved = await save();
    if (!saved) return;
    try {
      const { post: updated } = await blogApi.updatePost(saved.id, {
        status: "SCHEDULED",
        scheduledFor: new Date(scheduledFor).toISOString(),
      });
      setPost(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const unpublish = async () => {
    if (!post) return;
    try {
      const { post: drafted } = await blogApi.unpublish(post.id);
      setPost(drafted);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /** Auto-generate SEO metadata (Title, Description, Excerpt) and match Tags */
  const handleAutoGenerateSeo = () => {
    const bodyText = extractPlainTextFromDoc(doc);
    if (!title.trim() && !bodyText.trim()) {
      setError("Please enter a title, headline, or article body first to auto-generate SEO & tags.");
      return;
    }
    setError(null);

    const result = generateAutoSeo({
      title,
      doc,
      categories,
      tags,
    });

    if (result.metaTitle) setMetaTitle(result.metaTitle);
    if (result.metaDescription) setMetaDescription(result.metaDescription);
    if (result.excerpt) setExcerpt(result.excerpt);

    // Auto-select matched categories
    if (result.matchedCategoryIds.length > 0) {
      setCategoryIds((prev) => Array.from(new Set([...prev, ...result.matchedCategoryIds])));
    }

    // Auto-select matched tags
    if (result.matchedTagIds.length > 0) {
      setTagIds((prev) => Array.from(new Set([...prev, ...result.matchedTagIds])));
    }

    // Propose recommended new tags
    setSuggestedTags(result.suggestedTagNames);

    markDirty();
    setAutoSeoNotification(
      "✨ SEO meta title, description, excerpt, and matching tags auto-captured!",
    );
    setTimeout(() => setAutoSeoNotification(null), 6000);
  };

  const handleAddCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    setCatSaving(true);
    setCatError(null);
    try {
      const { category } = await blogApi.createCategory({
        name,
        description: newCatDesc.trim() || null,
      });
      setCategories((prev) => {
        const next = [...prev.filter((c) => c.id !== category.id), category];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setCategoryIds((prev) => (prev.includes(category.id) ? prev : [...prev, category.id]));
      markDirty();
      setNewCatName("");
      setNewCatDesc("");
      setCreatingCat(false);
    } catch (err: unknown) {
      setCatError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setCatSaving(false);
    }
  };

  const handleAddTag = async (e?: React.FormEvent, customTagName?: string) => {
    e?.preventDefault();
    const name = (customTagName ?? newTagName).trim();
    if (!name) return;
    setTagSaving(true);
    setTagError(null);
    try {
      const { tag } = await blogApi.createTag({ name });
      setTags((prev) => {
        const next = [...prev.filter((t) => t.id !== tag.id), tag];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
      setSuggestedTags((prev) => prev.filter((t) => t.toLowerCase() !== name.toLowerCase()));
      markDirty();
      if (!customTagName) {
        setNewTagName("");
        setCreatingTag(false);
      }
    } catch (err: unknown) {
      setTagError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setTagSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading post…" />;

  return (
    <div className="space-y-6">
      {/* Top bar: title + status + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-zinc-500 hover:text-zinc-800" aria-label="Back to posts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-black text-zinc-900">
                {isNew ? "New post" : post?.title || "Untitled"}
              </h1>
              {post && <Badge tone={STATUS_TONE[post.status]}>{post.status.toLowerCase()}</Badge>}
            </div>
            {saveState !== "idle" && (
              <p
                className={`text-xs ${
                  saveState === "error"
                    ? "text-red-600"
                    : saveState === "dirty"
                    ? "text-amber-600"
                    : "text-zinc-500"
                }`}
              >
                {SAVE_LABEL[saveState]}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Responsive preview mode toggle */}
          <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPreview("off")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${
                preview === "off" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setPreview("desktop")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${
                preview === "desktop"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreview("mobile")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${
                preview === "mobile"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <Button
            variant="secondary"
            icon={Sparkles}
            className="text-forest-moss-800 hover:bg-forest-moss-50 border-forest-moss-200"
            onClick={handleAutoGenerateSeo}
            title="Auto-capture SEO meta title, description, and recommended tags"
          >
            Auto SEO
          </Button>

          <Button
            variant="secondary"
            icon={Save}
            loading={saveState === "saving"}
            onClick={() => void save()}
          >
            Save
          </Button>

          {post?.status === "PUBLISHED" ? (
            <Button variant="secondary" icon={Undo2} onClick={() => void unpublish()}>
              Unpublish
            </Button>
          ) : (
            <Button icon={Send} onClick={() => void publish()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {autoSeoNotification && (
        <div className="flex items-center justify-between rounded-xl border border-forest-moss-300 bg-forest-moss-50 p-3 text-xs font-semibold text-forest-moss-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-forest-moss-600" />
            <span>{autoSeoNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoSeoNotification(null)}
            className="rounded p-1 text-forest-moss-600 hover:bg-forest-moss-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {/* Auto SEO Kickstart Bar on New Post */}
      {isNew && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-moss-200 bg-gradient-to-r from-forest-moss-50/80 via-emerald-50/50 to-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-moss-600 text-white shadow-2xs">
              <Wand2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-forest-moss-900">Auto SEO & Content Capture</p>
              <p className="text-xs text-forest-moss-700">
                Type your topic headline or start writing, then click to auto-capture SEO title, description, excerpt, and recommended tags.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={Sparkles}
            className="bg-white border-forest-moss-300 text-forest-moss-800 hover:bg-forest-moss-100/60"
            onClick={handleAutoGenerateSeo}
          >
            Auto-generate SEO & Tags
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main writing area (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {preview === "off" ? (
            <>
              {/* Post Title */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  placeholder="Post title or headline…"
                  aria-label="Post title"
                  className="w-full font-heading text-3xl font-black text-zinc-900 outline-none placeholder:text-zinc-300"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs">
                <BlogEditor
                  value={doc}
                  onChange={(next) => {
                    setDoc(next);
                    markDirty();
                  }}
                  onError={(msg) => setError(msg)}
                />
              </div>
            </>
          ) : (
            <div className="flex justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6">
              <div
                className={`w-full bg-white shadow-lg transition-all ${
                  preview === "mobile"
                    ? "max-w-sm rounded-[2.5rem] border-8 border-zinc-900 p-6"
                    : "max-w-3xl rounded-2xl p-10"
                }`}
              >
                <h1 className="font-heading text-3xl font-black text-zinc-900">{title || "Untitled"}</h1>
                {excerpt && <p className="mt-3 text-base text-zinc-500 italic">{excerpt}</p>}
                <div className="mt-6 border-t border-zinc-100 pt-6">
                  <PostContent doc={doc} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar metadata (1 col) */}
        <aside className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Schedule release</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => {
                      setScheduledFor(e.target.value);
                      markDirty();
                    }}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-forest-moss-500"
                  />
                </div>
              </div>

              {post?.publishedAt && (
                <p className="text-xs text-zinc-500">
                  Published on {new Date(post.publishedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {scheduledFor && (
              <Button
                variant="secondary"
                className="mt-3 w-full"
                icon={CalendarClock}
                onClick={() => void schedule()}
              >
                Schedule
              </Button>
            )}
            {post && (
              <Button
                variant="ghost"
                className="mt-2 w-full"
                icon={History}
                onClick={() => setRevisionsOpen(true)}
              >
                Revision history
              </Button>
            )}
          </Panel>

          <Panel title="Cover image">
            <CoverImageUploader
              value={coverImage}
              onChange={(media) => {
                setCoverImage(media);
                markDirty();
              }}
              onOpenMediaLibrary={() => setMediaOpen(true)}
            />
          </Panel>

          {/* Categories Panel with Create Ability */}
          <Panel
            title="Categories"
            action={
              <button
                type="button"
                onClick={() => {
                  setCreatingCat((prev) => !prev);
                  setCatError(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-moss-700 hover:text-forest-moss-800 transition-colors"
              >
                {creatingCat ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add new</span>
                  </>
                )}
              </button>
            }
          >
            {creatingCat && (
              <form onSubmit={handleAddCategory} className="mb-3 space-y-2 rounded-lg border border-forest-moss-200 bg-forest-moss-50/50 p-2.5">
                <p className="text-xs font-bold text-forest-moss-900">New Category</p>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Maize Farming)"
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-forest-moss-500"
                  autoFocus
                  required
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-forest-moss-500"
                />
                {catError && <p className="text-[11px] text-red-600">{catError}</p>}
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="py-1 px-2 text-xs"
                    onClick={() => {
                      setCreatingCat(false);
                      setNewCatName("");
                      setNewCatDesc("");
                      setCatError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="py-1 px-2.5 text-xs"
                    loading={catSaving}
                    disabled={!newCatName.trim() || catSaving}
                  >
                    Create & Select
                  </Button>
                </div>
              </form>
            )}

            {categories.length === 0 && !creatingCat && (
              <div className="text-center py-2">
                <p className="text-xs text-zinc-500">No categories defined yet.</p>
                <button
                  type="button"
                  onClick={() => setCreatingCat(true)}
                  className="mt-1 text-xs font-semibold text-forest-moss-700 hover:underline"
                >
                  + Create first category
                </button>
              </div>
            )}

            <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={(e) => {
                        setCategoryIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                        );
                        markDirty();
                      }}
                      className="rounded border-zinc-300 text-forest-moss-600 focus:ring-forest-moss-500"
                    />
                    <span className="truncate" title={c.description ?? undefined}>
                      {c.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Tags Panel with Create and Auto-Suggestion Ability */}
          <Panel
            title="Tags"
            action={
              <button
                type="button"
                onClick={() => {
                  setCreatingTag((prev) => !prev);
                  setTagError(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-moss-700 hover:text-forest-moss-800 transition-colors"
              >
                {creatingTag ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add tag</span>
                  </>
                )}
              </button>
            }
          >
            {creatingTag && (
              <form onSubmit={handleAddTag} className="mb-2.5 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name (e.g. Storage)"
                  className="flex-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-forest-moss-500"
                  autoFocus
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="py-1 px-2.5 text-xs shrink-0"
                  loading={tagSaving}
                  disabled={!newTagName.trim() || tagSaving}
                >
                  Add
                </Button>
              </form>
            )}
            {tagError && <p className="mb-2 text-[11px] text-red-600">{tagError}</p>}

            {/* Recommended / Suggested Tags from Auto SEO */}
            {suggestedTags.length > 0 && (
              <div className="mb-3 rounded-lg border border-forest-moss-200 bg-forest-moss-50/60 p-2">
                <p className="text-[11px] font-bold text-forest-moss-900 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-forest-moss-600" />
                  Suggested from content:
                </p>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleAddTag(undefined, name)}
                      className="inline-flex items-center gap-0.5 rounded-full border border-forest-moss-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-forest-moss-800 hover:bg-forest-moss-100 transition-colors cursor-pointer"
                      title={`Click to add and select tag "${name}"`}
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tags.length === 0 && !creatingTag && (
              <p className="text-xs text-zinc-500">No tags defined yet.</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const on = tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTagIds((prev) => (on ? prev.filter((id) => id !== t.id) : [...prev, t.id]));
                      markDirty();
                    }}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      on
                        ? "bg-forest-moss-600 text-white shadow-2xs"
                        : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="Excerpt"
            action={
              <button
                type="button"
                onClick={handleAutoGenerateSeo}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-moss-700 hover:text-forest-moss-800 transition-colors"
                title="Auto-derive excerpt from content"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto</span>
              </button>
            }
          >
            <textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                markDirty();
              }}
              onBlur={() => saveState === "dirty" && void save()}
              rows={4}
              placeholder="Leave blank to generate from the article, or click Auto."
              className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-forest-moss-500"
            />
          </Panel>

          <Panel
            title="SEO & Metadata"
            action={
              <button
                type="button"
                onClick={handleAutoGenerateSeo}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-moss-700 hover:text-forest-moss-800 transition-colors"
                title="Auto-capture SEO Meta Title and Description"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-fill SEO</span>
              </button>
            }
          >
            <label className="mb-1 block text-xs font-semibold text-zinc-600" htmlFor="meta-title">
              Meta title
            </label>
            <input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => {
                setMetaTitle(e.target.value);
                markDirty();
              }}
              onBlur={() => saveState === "dirty" && void save()}
              placeholder={title || "Post title"}
              className="mb-3 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm outline-none focus:border-forest-moss-500"
            />

            <label className="mb-1 block text-xs font-semibold text-zinc-600" htmlFor="meta-description">
              Meta description
            </label>
            <textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                markDirty();
              }}
              onBlur={() => saveState === "dirty" && void save()}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-forest-moss-500"
            />
            {/* Google truncates around 160 characters. */}
            <p
              className={`mt-1 text-right text-[11px] ${
                metaDescription.length > 160 ? "text-amber-600" : "text-zinc-400"
              }`}
            >
              {metaDescription.length} / 160
            </p>

            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="truncate text-sm text-[#1a0dab]">{metaTitle || title || "Post title"}</p>
              <p className="truncate text-xs text-[#006621]">
                aflachat.co.tz/blog/{post?.slug ?? "…"}
              </p>
              <p className="line-clamp-2 text-xs text-zinc-600">
                {metaDescription || excerpt || "No description yet."}
              </p>
            </div>
          </Panel>
        </aside>
      </div>

      <MediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        title="Choose cover image"
        onSelect={(m) => {
          setCoverImage(m);
          markDirty();
        }}
      />

      {revisionsOpen && post && (
        <RevisionPanel
          post={post}
          currentDoc={doc}
          onClose={() => setRevisionsOpen(false)}
          onRestored={(restored) => {
            setPost(restored);
            setTitle(restored.title);
            setDoc(restored.contentJson);
            setSaveState("saved");
          }}
        />
      )}
    </div>
  );
}
