import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [list, categories] = await Promise.all([
    listPosts({ page, limit: PER_PAGE }),
    listCategories(),
  ]);

  return (
    <div className="bg-zinc-50">
      <PageHero
        title="AflaChat Blog"
        subtitle="Agricultural insights, research and crop preservation guides to help you protect your harvest from aflatoxin."
        image="/images/2149142834.jpg"
        imageAlt="Maize harvest being sorted, representing safe post-harvest handling"
      />

      {categories.length > 0 && (
        <nav aria-label="Categories" className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2 px-6 py-4">
            <span className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-white">
              All
            </span>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12">
        {list.posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-heading text-xl font-bold text-zinc-700">No articles yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              We are preparing guides on protecting your harvest. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
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
