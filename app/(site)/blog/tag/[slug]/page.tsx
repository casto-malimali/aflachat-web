import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import {
  SITE_URL,
  listTags,
  listPosts,
} from "@/lib/blog/serverApi";

// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

const PER_PAGE = 9;

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listTags()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = (await listTags()).find((t) => t.slug === slug);
  if (!tag) return { title: "Tag" };

  return {
    title: `#${tag.name} articles`,
    description: `Articles tagged ${tag.name}.`,
    alternates: { canonical: `${SITE_URL}/blog/tag/${tag.slug}` },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const tag = (await listTags()).find((t) => t.slug === slug);
  if (!tag) notFound();

  const list = await listPosts({ tag: slug, page, limit: PER_PAGE });

  return (
    <div className="bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
            #{tag.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {list.total} {list.total === 1 ? "article" : "articles"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {list.posts.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">Nothing tagged here yet.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              basePath={`/blog/tag/${slug}`}
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
