import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { PostContent, extractHeadings } from "@/components/blog/PostContent";
import { PostCard } from "@/components/blog/PostCard";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { ViewCounter } from "@/components/blog/ViewCounter";
import {
  SITE_URL,
  formatDate,
  getPost,
  getRelated,
  listPosts,
  mediaUrl,
} from "@/lib/blog/serverApi";

// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

/** Slugs not generated at build time are rendered on first request, then cached. */
export const dynamicParams = true;

/**
 * Prerenders published posts at build time so they are static HTML rather than
 * rendered per request. If the API is unreachable during the build this returns
 * nothing and every post falls back to on-demand rendering (dynamicParams), so
 * a blog outage cannot fail the build.
 */
export async function generateStaticParams() {
  const { posts } = await listPosts({ limit: 50 });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);

  if (!result || "redirectTo" in result) return { title: "Article" };

  const { post } = result;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const image = post.ogImage ?? post.coverImage;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    // An author-supplied canonical wins — that is the point of the field.
    alternates: { canonical: post.canonicalUrl || url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      tags: post.tags.map((t) => t.name),
      images: image
        ? [
            {
              url: mediaUrl(image.path),
              width: image.width ?? 1200,
              height: image.height ?? 630,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [mediaUrl(image.path)] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPost(slug);

  if (!result) notFound();

  // The API reports historical slugs; issue the real 301 here so the old URL
  // keeps its search ranking instead of silently serving a duplicate.
  if ("redirectTo" in result) permanentRedirect(`/blog/${result.redirectTo}`);

  const { post } = result;
  const related = await getRelated(post.slug);
  const headings = extractHeadings(post.contentJson);
  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    publisher: {
      "@type": "Organization",
      name: "AflaChat",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon-96x96.png` },
    },
    image: post.coverImage ? [mediaUrl(post.coverImage.path)] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <article className="bg-white">
      <script
        type="application/ld+json"
        // JSON-LD is data, not markup: this is the documented way to embed it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter slug={post.slug} />

      <header className="mx-auto max-w-3xl px-6 pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        {post.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {post.categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="mt-4 font-heading text-4xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          {post.author && <span className="font-semibold text-zinc-700">{post.author.name}</span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.readingTimeMinutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTimeMinutes} min read
            </span>
          )}
        </div>
      </header>

      {post.coverImage && (
        <div className="mx-auto mt-8 max-w-4xl px-6">
          <Image
            src={mediaUrl(post.coverImage.path)}
            alt={post.coverImage.originalName}
            width={post.coverImage.width ?? 1200}
            height={post.coverImage.height ?? 700}
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
            {...(post.coverImage.lqip
              ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip }
              : {})}
            className="h-auto w-full rounded-2xl"
          />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_16rem]">
        <div className="mx-auto w-full max-w-3xl">
          <PostContent doc={post.contentJson} />

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 pt-6">
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/tag/${t.slug}`}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-zinc-200 pt-6">
            <ShareButtons url={url} title={post.title} />
          </div>
        </div>

        {/* Desktop-only: the ToC is redundant on a narrow screen. */}
        <aside className="hidden lg:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50 py-12">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-6 font-heading text-2xl font-black text-zinc-900">Related articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <PostCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
