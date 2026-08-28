import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { FeaturedPostCard } from "@/components/blog/FeaturedPostCard";
import { Pagination } from "@/components/blog/Pagination";
import { PageHero } from "@/components/ui/PageHero";
import {
  SITE_URL,
  listCategories,
  listPosts,
} from "@/lib/blog/serverApi";

// Statically rendered and revalidated — the listing is the same for everyone,
// so it should not be re-fetched per request.
// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Agricultural insights, research articles and crop preservation guides to help you protect your harvest from aflatoxin.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "AflaChat Blog",
    description:
      "Agricultural insights, research articles and crop preservation guides to help you protect your harvest from aflatoxin.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

const PER_PAGE = 9;

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const query = (params.q || params.search || "").trim();

  // Fetch categories, main list, and featured post
  const [list, categories, featuredResult] = await Promise.all([
    listPosts({ page, limit: PER_PAGE, search: query || undefined }),
    listCategories(),
    // Only look for featured post on first page when not actively searching
    page === 1 && !query ? listPosts({ featured: true, limit: 1 }) : Promise.resolve({ posts: [] }),
  ]);

  // If there's a post explicitly marked isFeatured, use it.
  // Otherwise, if on page 1 without search, use the first post from the main listing as featured.
  const explicitFeatured = featuredResult.posts[0];
  const featuredPost =
    page === 1 && !query
      ? explicitFeatured || (list.posts.length > 0 ? list.posts[0] : null)
      : null;

  // If a featured post is displayed, exclude it from the grid below so it's not repeated
  const gridPosts =
    featuredPost
      ? list.posts.filter((p) => p.id !== featuredPost.id)
      : list.posts;

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <PageHero
        title="AflaChat Blog"
        subtitle="Agricultural insights, research and crop preservation guides to help you protect your harvest from aflatoxin."
        image="/images/2149142834.jpg"
        imageAlt="Maize harvest being sorted, representing safe post-harvest handling"
      />

      {/* Categories & Search Bar Navigation */}
      <section className="border-b border-zinc-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          {/* Category Filter Pills on the Left */}
          <nav aria-label="Categories" className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-primary-dark"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-2xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Search Articles Input on the Right */}
          <form action="/blog" method="GET" className="relative w-full md:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 shadow-2xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </form>
        </div>
      </section>

      {/* Main Articles Container */}
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12 space-y-10 sm:space-y-12">
        {query && (
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <p className="text-sm text-zinc-600">
              Showing search results for &ldquo;<span className="font-semibold text-zinc-900">{query}</span>&rdquo; ({list.total} {list.total === 1 ? "article" : "articles"})
            </p>
            <Link href="/blog" className="text-xs font-bold text-primary hover:underline">
              Clear search
            </Link>
          </div>
        )}

        {/* Featured Post Card (Hero banner on page 1) */}
        {featuredPost && (
          <section aria-label="Featured Article">
            <FeaturedPostCard post={featuredPost} />
          </section>
        )}

        {/* Grid of Articles (3 columns) */}
        {gridPosts.length === 0 && !featuredPost ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center shadow-2xs">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-heading text-xl font-bold text-zinc-700">No articles found</p>
            <p className="mt-1 text-sm text-zinc-500">
              {query
                ? "Try adjusting your search terms to find what you are looking for."
                : "We are preparing guides on protecting your harvest. Check back soon."}
            </p>
          </div>
        ) : (
          <>
            {gridPosts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <Pagination
              basePath="/blog"
              page={list.page}
              total={list.total}
              limit={list.limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
