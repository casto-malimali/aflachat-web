import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Page links for a listing. Server-rendered links rather than client state so
 * each page is its own cacheable URL and is crawlable.
 */
export function Pagination({
  basePath,
  page,
  total,
  limit,
}: {
  basePath: string;
  page: number;
  total: number;
  limit: number;
}) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${
            n === page
              ? "bg-primary text-white"
              : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {n}
        </Link>
      ))}

      {page < pages && (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Next page"
          className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
