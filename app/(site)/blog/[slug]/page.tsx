import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Sparkles, User } from "lucide-react";
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

  const heroImageSrc = post.coverImage
    ? mediaUrl(post.coverImage.path)
    : "/images/2149142834.jpg";

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

      {/* Hero Section */}
      <header className="relative min-h-[460px] md:min-h-[520px] lg:min-h-[580px] w-full overflow-hidden bg-zinc-950 flex items-end pb-12 pt-28">
        {/* Background Image */}
        <Image
          src={heroImageSrc}
          alt={post.coverImage?.originalName || post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          {...(post.coverImage?.lqip
            ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip }
            : {})}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-900/40" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 w-full animate-fade-up">
          {/* Breadcrumb / Back Link & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All articles
            </Link>

            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/blog/category/${c.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-opacity hover:opacity-90"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl font-black leading-[1.18] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Excerpt Subtitle */}
          {post.excerpt && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg md:text-xl">
              {post.excerpt}
            </p>
          )}

          {/* Author & Published Metadata */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400 border-t border-white/10 pt-4">
            {post.author && (
              <div className="flex items-center gap-2 font-medium text-zinc-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span>{post.author.name}</span>
              </div>
            )}

            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
            )}

            {post.readingTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span>{post.readingTimeMinutes} min read</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Article Body & Table of Contents */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_16rem]">
        <div className="mx-auto w-full max-w-3xl">
          <PostContent doc={post.contentJson} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 pt-6">
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/tag/${t.slug}`}
                  className="rounded-full border border-zinc-200 bg-zinc-50/70 px-3.5 py-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-primary"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 border-t border-zinc-200 pt-6">
            <ShareButtons url={url} title={post.title} />
          </div>
        </div>

        {/* Desktop-only: the ToC is redundant on a narrow screen. */}
        <aside className="hidden lg:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50 py-14">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Keep reading</p>
                <h2 className="font-heading text-2xl font-black text-zinc-900 sm:text-3xl">Related articles</h2>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>
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
