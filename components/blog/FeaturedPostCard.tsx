import Image from "next/image";
import Link from "next/link";
import { formatDate, mediaUrl, type PublicPost } from "@/lib/blog/serverApi";

export function FeaturedPostCard({ post }: { post: PublicPost }) {
  const primaryCategory = post.categories[0];
  const authorName = post.author?.name || "AflaChat Team";
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Cover Image & FEATURED Badge */}
        <div className="relative min-h-[260px] sm:min-h-[320px] lg:col-span-6 lg:min-h-[400px]">
          <Link href={`/blog/${post.slug}`} className="block h-full w-full overflow-hidden">
            {post.coverImage ? (
              <Image
                src={mediaUrl(post.coverImage.path)}
                alt={post.coverImage.originalName}
                width={post.coverImage.width ?? 1200}
                height={post.coverImage.height ?? 800}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                {...(post.coverImage.lqip
                  ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip }
                  : {})}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-moss-900 via-forest-moss-800 to-forest-moss-950 p-8 text-white">
                <span className="font-heading text-2xl font-black text-forest-moss-300">
                  AflaChat Insights
                </span>
              </div>
            )}
          </Link>

          {/* FEATURED badge on top-left */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
              Featured
            </span>
          </div>
        </div>

        {/* Right Column: Article Details */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:col-span-6 lg:p-12">
          {primaryCategory && (
            <div className="mb-3">
              <Link
                href={`/blog/category/${primaryCategory.slug}`}
                className="text-xs font-extrabold uppercase tracking-widest text-primary hover:underline"
              >
                {primaryCategory.name}
              </Link>
            </div>
          )}

          <h2 className="font-heading text-2xl font-black leading-tight text-zinc-900 sm:text-3xl lg:text-3xl">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors hover:text-primary"
            >
              {post.title}
            </Link>
          </h2>

          {post.excerpt && (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
              {post.excerpt}
            </p>
          )}

          {/* Author Metadata Row */}
          <div className="mt-6 flex items-center gap-3 pt-6 border-t border-zinc-100 sm:mt-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-moss-100 text-xs font-bold text-forest-moss-800 shadow-2xs">
              {authorInitial}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-zinc-500">
              <span className="font-semibold text-zinc-800">{authorName}</span>
              <span className="text-zinc-300">•</span>
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              )}
              {post.readingTimeMinutes > 0 && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{post.readingTimeMinutes} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
