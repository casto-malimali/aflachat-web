"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { useAdminData } from "@/components/admin/useAdmin";
import { Badge, Button, EmptyState, ErrorState, Panel, Spinner, fmtRelative } from "@/components/admin/ui";
import { blogApi, type PostStatus } from "@/lib/blogApi";

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

export default function BlogPostsPage() {
  const [status, setStatus] = useState<PostStatus | "">("");
  const [search, setSearch] = useState("");
  // Only committed on submit, so typing doesn't fire a request per keystroke.
  const [query, setQuery] = useState("");

  const loader = useCallback(
    () => blogApi.listPosts({ status: status || undefined, search: query || undefined, limit: 50 }),
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
                  <th className="py-2 pr-4 font-semibold">Title</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Author</th>
                  <th className="py-2 pr-4 font-semibold">Views</th>
                  <th className="py-2 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-semibold text-zinc-900 hover:text-forest-moss-700"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-zinc-400">/{post.slug}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={STATUS_TONE[post.status]}>{post.status.toLowerCase()}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{post.author?.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-zinc-600">{post.viewCount}</td>
                    <td className="py-3 text-zinc-500">{fmtRelative(post.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
