import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import {
  SITE_URL,
  listCategories,
  listPosts,
} from "@/lib/blog/serverApi";

// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

const PER_PAGE = 9;

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = (await listCategories()).find((c) => c.slug === slug);
  if (!category) return { title: "Category" };

  return {
    title: `${category.name} articles`,
    description: category.description ?? `Articles filed under ${category.name}.`,
    alternates: { canonical: `${SITE_URL}/blog/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const list = await listPosts({ category: slug, page, limit: PER_PAGE });

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Category Header */}
      <header className="border-b border-zinc-200 bg-white py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
            {category.name}
          </h1>
          {category.description && <p className="mt-2 max-w-2xl text-sm md:text-base text-zinc-600">{category.description}</p>}
          <p className="mt-2 text-xs font-semibold text-zinc-400">
            {list.total} {list.total === 1 ? "article" : "articles"}
          </p>
        </div>
      </header>

      {/* Categories & Search Bar Navigation */}
      <section className="border-b border-zinc-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          {/* Category Filter Pills on the Left */}
          <nav aria-label="Categories" className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-2xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              All
            </Link>
            {categories.map((c) => {
              const isActive = c.slug === slug;
              return (
                <Link
                  key={c.id}
                  href={`/blog/category/${c.slug}`}
                  className={`inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "border border-zinc-200 bg-white text-zinc-700 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Articles Input on the Right */}
          <form action="/blog" method="GET" className="relative w-full md:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              name="q"
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 shadow-2xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </form>
        </div>
      </section>

      {/* Main Articles Container */}
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        {list.posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center shadow-2xs">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-heading text-xl font-bold text-zinc-700">No articles in this category yet</p>
            <p className="mt-1 text-sm text-zinc-500">Check back soon for new guides and articles.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              basePath={`/blog/category/${slug}`}
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
