// Client for the blog API. Admin calls go through the shared apiRequest helper
// (bearer token + the backend's { error: { code, message } } envelope);
// uploads use fetch directly because they are multipart, not JSON.

import { apiRequest, AuthError, BASE_URL } from "./http";
import { getToken } from "./session";
import type { BlogDoc } from "./blog/nodes";

export { AuthError };

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export interface MediaVariant {
  width: number;
  path: string;
  sizeBytes: number;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  path: string;
  variants: MediaVariant[];
  lqip: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentJson: BlogDoc;
  contentHtml: string;
  plainText: string;
  readingTimeMinutes: number;
  coverImageId: string | null;
  status: PostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  tags: Tag[];
  coverImage: Media | null;
  ogImage: Media | null;
  author: { id: string; name: string } | null;
}

export interface Revision {
  id: string;
  postId: string;
  title: string;
  contentJson: BlogDoc;
  createdAt: string;
}

export interface Paginated<T> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/** Fields the API accepts on write. Derived fields are server-side only. */
export interface PostInput {
  title?: string;
  contentJson?: BlogDoc;
  excerpt?: string | null;
  slug?: string;
  status?: PostStatus;
  scheduledFor?: string | null;
  coverImageId?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageId?: string | null;
  canonicalUrl?: string | null;
}

const ADMIN = "/api/admin/blog";

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export const blogApi = {
  listPosts: (params: {
    page?: number;
    limit?: number;
    status?: PostStatus;
    search?: string;
    authorId?: string;
  }) => apiRequest<Paginated<Post> & { posts: Post[] }>(`${ADMIN}/posts${qs(params)}`),

  getPost: (id: string) => apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}`),

  createPost: (body: PostInput) => apiRequest<{ post: Post }>(`${ADMIN}/posts`, { body }),

  updatePost: (id: string, body: PostInput) =>
    apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}`, { method: "PATCH", body }),

  deletePost: (id: string) =>
    apiRequest<{ ok: true }>(`${ADMIN}/posts/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}/unpublish`, { method: "POST" }),

  duplicate: (id: string) =>
    apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}/duplicate`, { method: "POST" }),

  revisions: (id: string) =>
    apiRequest<{ revisions: Revision[] }>(`${ADMIN}/posts/${id}/revisions`),

  restoreRevision: (id: string, revisionId: string) =>
    apiRequest<{ post: Post }>(`${ADMIN}/posts/${id}/revisions/${revisionId}/restore`, {
      method: "POST",
    }),

  listCategories: () => apiRequest<{ categories: Category[] }>(`${ADMIN}/categories`),
  listTags: () => apiRequest<{ tags: Tag[] }>(`${ADMIN}/tags`),

  listMedia: (page = 1, limit = 40) =>
    apiRequest<Paginated<Media> & { media: (Media & { url: string })[] }>(
      `${ADMIN}/media${qs({ page, limit })}`,
    ),

  deleteMedia: (id: string) =>
    apiRequest<{ ok: true }>(`${ADMIN}/media/${id}`, { method: "DELETE" }),
};

export interface UploadResult {
  media: Media;
  url: string;
  deduplicated?: boolean;
}

/**
 * Uploads one image. Uses XMLHttpRequest rather than fetch purely for upload
 * progress, which the editor shows inline while an image is being added.
 */
export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${ADMIN}/media`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let body: unknown;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
        return;
      }

      if (xhr.status === 401) {
        reject(new AuthError("Your session has expired. Please sign in again."));
        return;
      }
      if (xhr.status >= 400) {
        const message =
          (body as { error?: { message?: string } })?.error?.message ??
          `Upload failed (${xhr.status})`;
        reject(new Error(message));
        return;
      }

      resolve(body as UploadResult);
    };

    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    xhr.send(form);
  });
}

/** Absolute URL for a stored media path (the API returns them site-relative). */
export function mediaUrl(path: string): string {
  return `${BASE_URL}/media/blog/${path}`;
}
