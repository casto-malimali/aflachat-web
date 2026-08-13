"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  History,
  Image as ImageIcon,
  Monitor,
  Save,
  Send,
  Smartphone,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button, ErrorState, Panel, Spinner } from "@/components/admin/ui";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";
import { MediaLibrary } from "@/components/admin/blog/MediaLibrary";
import { RevisionPanel } from "@/components/admin/blog/RevisionPanel";
import { PostContent } from "@/components/blog/PostContent";
import {
  blogApi,
  mediaUrl,
  type Category,
  type Media,
  type Post,
  type PostInput,
  type Tag,
} from "@/lib/blogApi";
import { EMPTY_DOC, type BlogDoc } from "@/lib/blog/nodes";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 20_000;

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
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

  const [mediaOpen, setMediaOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [preview, setPreview] = useState<"off" | "desktop" | "mobile">("off");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  // Held in a ref so the autosave timer always sees the latest values without
  // being torn down and recreated on every keystroke.
  const latest = useRef({ title, doc, excerpt, metaTitle, metaDescription, coverImage, categoryIds, tagIds, scheduledFor });
  latest.current = { title, doc, excerpt, metaTitle, metaDescription, coverImage, categoryIds, tagIds, scheduledFor };

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
      if (isNew || !post) {
        const { post: created } = await blogApi.createPost(body);
        setPost(created);
        setSaveState("saved");
        // Swap the URL to the real id so later saves patch instead of creating
        // a second post.
        router.replace(`/admin/blog/${created.id}`);
        return created;
      }

      const { post: updated } = await blogApi.updatePost(post.id, body);
      setPost(updated);
      setSaveState("saved");
      setError(null);
      return updated;
    } catch (err) {
      setError((err as Error).message);
      setSaveState("error");
      return null;
    }
  }, [isNew, post, router]);

  // Autosave on a timer whenever there are unsaved changes.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [saveState, save]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  const markDirty = useCallback(() => setSaveState("dirty"), []);

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

  if (loading) return <Spinner label="Loading post…" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/blog" className="text-zinc-500 hover:text-zinc-800" aria-label="Back to posts">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-xl font-black text-zinc-900">
          {isNew && !post ? "New post" : "Edit post"}
        </h1>
        {post && <Badge tone={post.status === "PUBLISHED" ? "forest" : "slate"}>{post.status.toLowerCase()}</Badge>}

        <span
          className={`text-xs font-semibold ${
            saveState === "error" ? "text-red-600" : "text-zinc-400"
          }`}
          role="status"
        >
          {SAVE_LABEL[saveState]}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5">
            <button
              type="button"
              onClick={() => setPreview("off")}
              aria-pressed={preview === "off"}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${preview === "off" ? "bg-zinc-100 text-zinc-800" : "text-zinc-500"}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview("desktop")}
              aria-label="Desktop preview"
              aria-pressed={preview === "desktop"}
              className={`rounded-md px-2 py-1 ${preview === "desktop" ? "bg-zinc-100 text-zinc-800" : "text-zinc-500"}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreview("mobile")}
              aria-label="Mobile preview"
              aria-pressed={preview === "mobile"}
              className={`rounded-md px-2 py-1 ${preview === "mobile" ? "bg-zinc-100 text-zinc-800" : "text-zinc-500"}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          {post?.status === "PUBLISHED" && (
            <>
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" icon={Eye}>
                  View
                </Button>
              </a>
              <Button variant="secondary" icon={Undo2} onClick={unpublish}>
                Unpublish
              </Button>
            </>
          )}
          <Button variant="secondary" icon={Save} loading={saveState === "saving"} onClick={() => void save()}>
            Save draft
          </Button>
          {post?.status !== "PUBLISHED" && (
            <Button icon={Send} onClick={() => void publish()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} />}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
            onBlur={() => saveState === "dirty" && void save()}
            placeholder="Post title"
            aria-label="Post title"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 font-heading text-2xl font-black text-zinc-900 outline-none focus:border-forest-moss-500"
          />

          {preview === "off" ? (
            <BlogEditor
              value={doc}
              onChange={(next) => {
                setDoc(next);
                markDirty();
              }}
              onError={setError}
            />
          ) : (
            // Preview uses the same PostContent component the public site
            // renders with, so this is genuinely what will ship.
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div
                className={`mx-auto ${preview === "mobile" ? "max-w-[22rem] border-x border-dashed border-zinc-200 px-4" : ""}`}
              >
                <h1 className="font-heading text-3xl font-black text-zinc-900">{title}</h1>
                <PostContent doc={doc} />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Panel title="Publishing">
            <label className="mb-1 block text-xs font-semibold text-zinc-600" htmlFor="scheduled-for">
              Schedule for
            </label>
            <input
              id="scheduled-for"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => {
                setScheduledFor(e.target.value);
                markDirty();
              }}
              onBlur={() => saveState === "dirty" && void save()}
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm outline-none focus:border-forest-moss-500"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Set a future time, then press Schedule. A cron job publishes it within a minute.
            </p>
            {scheduledFor && post?.status !== "PUBLISHED" && (
              <Button
                variant="secondary"
                className="mt-2 w-full"
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
            {coverImage ? (
              <div className="space-y-2">
                <Image
                  src={mediaUrl(coverImage.path)}
                  alt={coverImage.originalName}
                  width={coverImage.width ?? 400}
                  height={coverImage.height ?? 300}
                  className="w-full rounded-lg border border-zinc-200 object-cover"
                />
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setMediaOpen(true)}>
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCoverImage(null);
                      markDirty();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" icon={ImageIcon} className="w-full" onClick={() => setMediaOpen(true)}>
                Choose cover image
              </Button>
            )}
          </Panel>

          <Panel title="Categories">
            {categories.length === 0 && (
              <p className="text-xs text-zinc-500">No categories defined yet.</p>
            )}
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={(e) => {
                        setCategoryIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                        );
                        markDirty();
                      }}
                    />
                    {c.name}
                  </label>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tags">
            {tags.length === 0 && <p className="text-xs text-zinc-500">No tags defined yet.</p>}
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
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      on
                        ? "bg-forest-moss-600 text-white"
                        : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Excerpt">
            <textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                markDirty();
              }}
              onBlur={() => saveState === "dirty" && void save()}
              rows={4}
              placeholder="Leave blank to generate from the article."
              className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-forest-moss-500"
            />
          </Panel>

          <Panel title="SEO">
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
