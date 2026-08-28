import Image from "next/image";
import Link from "next/link";
import { formatDate, mediaUrl, type PublicPost } from "@/lib/blog/serverApi";

export function PostCard({ post }: { post: PublicPost }) {
  const primaryCategory = post.categories[0];
  const authorName = post.author?.name || "AflaChat Team";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Card Image Container with Inset Category Badge */}
      <div className="relative h-48 w-full overflow-hidden sm:h-52">
        <Link href={`/blog/${post.slug}`} className="block h-full w-full">
          {post.coverImage ? (
            <Image
              src={mediaUrl(post.coverImage.path)}
              alt={post.coverImage.originalName}
              width={post.coverImage.width ?? 800}
              height={post.coverImage.height ?? 500}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              {...(post.coverImage.lqip
                ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip }
                : {})}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-moss-900 to-forest-moss-950 p-6 text-center">
              <span className="font-heading text-lg font-black text-forest-moss-200">
                AflaChat
              </span>
            </div>
          )}
        </Link>

        {/* Category Badge with Bullet Dot inside bottom-left of image */}
        {primaryCategory && (
          <div className="absolute bottom-3 left-3 z-10">
            <Link
              href={`/blog/category/${primaryCategory.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary shadow-sm backdrop-blur-xs transition-colors hover:bg-white hover:text-primary-dark"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {primaryCategory.name}
            </Link>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-heading text-lg font-black leading-snug text-zinc-900 sm:text-xl">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">
            {post.excerpt}
          </p>
        )}

        {/* Footer Meta: Author • Date • Read Time */}
        <div className="mt-5 flex flex-wrap items-center gap-x-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-700">{authorName}</span>
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
    </article>
  );
}
