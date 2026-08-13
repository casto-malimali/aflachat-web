import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate, mediaUrl, type PublicPost } from "@/lib/blog/serverApi";

export function PostCard({ post }: { post: PublicPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
        {post.coverImage ? (
          <Image
            src={mediaUrl(post.coverImage.path)}
            alt={post.coverImage.originalName}
            width={post.coverImage.width ?? 800}
            height={post.coverImage.height ?? 500}
            sizes="(max-width: 768px) 100vw, 33vw"
            {...(post.coverImage.lqip
              ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip }
              : {})}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-44 w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {post.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-secondary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <h2 className="font-heading text-lg font-black leading-snug text-zinc-900">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
          {post.author && <span className="font-semibold text-zinc-600">{post.author.name}</span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.readingTimeMinutes > 0 && (
            <span className="ml-auto inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTimeMinutes} min
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
