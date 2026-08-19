"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAdminData } from "@/components/admin/useAdmin";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Panel,
  Spinner,
  fmtRelative,
} from "@/components/admin/ui";
import { blogApi, type Post, type PostStatus } from "@/lib/blogApi";

const STATUS_FILTERS: { label: string; value: PostStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

const STATUS_TONE: Record<PostStatus, "forest" | "amber" | "slate"> = {
  PUBLISHED: "forest",
  SCHEDULED: "amber",
  DRAFT: "slate",
  ARCHIVED: "slate",
};

interface DeletePostModalProps {
  post: Post;
  onClose: () => void;
  onDeleted: () => void;
}

function DeletePostModal({ post, onClose, onDeleted }: DeletePostModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await blogApi.deletePost(post.id);
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete blog post"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={busy}
            icon={Trash2}
          >
            Delete post
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-zinc-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-zinc-900">&ldquo;{post.title}&rdquo;</span>?
        </p>
        <p className="text-xs text-zinc-500">
          This post and all its revision history will be permanently deleted. This action cannot be undone.
        </p>
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">{error}</p>
        )}
      </div>
    </Modal>
  );
}

export default function BlogPostsPage() {
  const [status, setStatus] = useState<PostStatus | "">("");
  const [search, setSearch] = useState("");
  // Only committed on submit, so typing doesn't fire a request per keystroke.
  const [query, setQuery] = useState("");
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const loader = useCallback(
    () =>
      blogApi.listPosts({
        status: status || undefined,
        search: query || undefined,
        limit: 50,
      }),
    [status, query],
  );

  const { data, loading, error, refetch } = useAdminData(loader, [status, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-black text-zinc-900">Blog</h1>
          <p className="text-sm text-zinc-500">Write and publish articles for the website.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button icon={Plus}>New post</Button>
        </Link>
      </div>

      <Panel title="Posts">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value || "all"}
                type="button"
                onClick={() => setStatus(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  status === f.value
                    ? "bg-forest-moss-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form
            className="ml-auto flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
                aria-label="Search posts"
                className="rounded-lg border border-zinc-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-forest-moss-500"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </div>

        {loading && <Spinner label="Loading posts…" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {data && data.posts.length === 0 && (
          <EmptyState
            icon={FileText}
            label="No posts yet"
            hint="Write your first article to get the blog started."
          />
        )}

        {data && data.posts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="w-12 py-2.5 px-3 text-center font-semibold">Sn</th>
                  <th className="py-2.5 pr-4 font-semibold">Title</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 pr-4 font-semibold">Author</th>
                  <th className="py-2.5 pr-4 font-semibold">Views</th>
                  <th className="py-2.5 pr-4 font-semibold">Updated</th>
                  <th className="py-2.5 pl-4 pr-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.posts.map((post, index) => {
                  const isPublished = post.status === "PUBLISHED";
                  const viewUrl = isPublished ? `/blog/${post.slug}` : `/admin/blog/${post.id}`;

                  return (
                    <tr key={post.id} className="transition-colors hover:bg-zinc-50/75">
                      <td className="py-3 px-3 text-center text-xs font-semibold text-zinc-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="font-semibold text-zinc-900 hover:text-forest-moss-700 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-zinc-400">/{post.slug}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={STATUS_TONE[post.status]}>{post.status.toLowerCase()}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">{post.author?.name ?? "—"}</td>
                      <td className="py-3 pr-4 text-zinc-600 tabular-nums">{post.viewCount}</td>
                      <td className="py-3 pr-4 text-zinc-500">{fmtRelative(post.updatedAt)}</td>
                      <td className="py-3 pl-4 pr-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {/* View Post */}
                          {isPublished ? (
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View live post "${post.title}"`}
                              title="View live post"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-2xs hover:border-forest-moss-500 hover:bg-forest-moss-50 hover:text-forest-moss-700 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <Link
                              href={viewUrl}
                              aria-label={`Preview/Edit post "${post.title}"`}
                              title="Preview in editor"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-2xs hover:border-forest-moss-500 hover:bg-forest-moss-50 hover:text-forest-moss-700 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          )}

                          {/* Edit Post */}
                          <Link
                            href={`/admin/blog/${post.id}`}
                            aria-label={`Edit post "${post.title}"`}
                            title="Edit post"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-2xs hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>

                          {/* Delete Post */}
                          <button
                            type="button"
                            onClick={() => setDeletingPost(post)}
                            aria-label={`Delete post "${post.title}"`}
                            title="Delete post"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {deletingPost && (
        <DeletePostModal
          post={deletingPost}
          onClose={() => setDeletingPost(null)}
          onDeleted={() => {
            setDeletingPost(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
