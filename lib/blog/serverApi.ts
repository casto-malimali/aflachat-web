// Server-side reads of the public blog API.
//
// Separate from lib/http.ts on purpose: that client reads the bearer token from
// localStorage and forces `cache: "no-store"`, neither of which makes sense on
// the server. These are unauthenticated reads that we *want* cached and
// revalidated, which is what makes the blog pages ISR rather than dynamic.

import type { BlogDoc } from "./nodes";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

/** Canonical public origin, used for absolute URLs in metadata, RSS and JSON-LD. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aflachat.com"
).replace(/\/$/, "");

/** How long a cached blog response stays fresh, in seconds. */
export const REVALIDATE_SECONDS = 300;

export interface MediaVariant {
  width: number;
  path: string;
  sizeBytes: number;
}

export interface Media {
  id: string;
  path: string;
  width: number | null;
  height: number | null;
  lqip: string | null;
  variants: MediaVariant[];
  originalName: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PublicPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentJson: BlogDoc;
  readingTimeMinutes: number;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  categories: Category[];
  tags: Tag[];
  coverImage: Media | null;
  ogImage: Media | null;
  author: { id: string; name: string } | null;
}

export interface PostList {
  posts: PublicPost[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/** Absolute URL for a stored media path. */
export function mediaUrl(path: string): string {
  return `${API_BASE}/media/blog/${path}`;
}

/** Builds the srcset a responsive <img> needs from the stored variants. */
export function mediaSrcSet(media: Media): string | undefined {
  if (media.variants.length === 0) return undefined;
  return media.variants.map((v) => `${mediaUrl(v.path)} ${v.width}w`).join(", ");
}

async function get<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // A blog outage must not take the whole marketing site down — callers
    // render an empty state instead.
    return null;
  }
}

export interface ListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: "newest" | "oldest" | "popular";
}

export async function listPosts(params: ListParams = {}): Promise<PostList> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const query = search.toString();
  const data = await get<PostList>(`/api/blog/posts${query ? `?${query}` : ""}`);
  return data ?? { posts: [], page: 1, limit: params.limit ?? 12, total: 0, hasMore: false };
}

/**
 * Fetches one post. When the slug is only a historical one the API answers 301
 * with the current slug, which we surface so the page can redirect rather than
 * serving the post at a stale URL.
 */
export async function getPost(
  slug: string,
): Promise<{ post: PublicPost } | { redirectTo: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/blog/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      redirect: "manual",
    });

    if (res.status === 301) {
      const body = (await res.json()) as { redirectTo?: string };
      return body.redirectTo ? { redirectTo: body.redirectTo } : null;
    }
    if (!res.ok) return null;

    return (await res.json()) as { post: PublicPost };
  } catch {
    return null;
  }
}

export async function getRelated(slug: string): Promise<PublicPost[]> {
  const data = await get<{ posts: PublicPost[] }>(
    `/api/blog/posts/${encodeURIComponent(slug)}/related`,
  );
  return data?.posts ?? [];
}

export async function listCategories(): Promise<Category[]> {
  const data = await get<{ categories: Category[] }>("/api/blog/categories");
  return data?.categories ?? [];
}

export async function listTags(): Promise<Tag[]> {
  const data = await get<{ tags: Tag[] }>("/api/blog/tags");
  return data?.tags ?? [];
}

/** Formats a publish date for display; falls back to the raw string. */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
