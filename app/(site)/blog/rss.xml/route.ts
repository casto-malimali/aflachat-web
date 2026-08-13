// RSS 2.0 feed of published posts.
//
// Served from a route handler rather than a static file so it revalidates on
// the same cadence as the blog pages.

import { SITE_URL, listPosts, mediaUrl } from "@/lib/blog/serverApi";

// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

/** Escapes the five XML entities. Titles and excerpts are author-supplied. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // One page is enough for a feed reader; 50 is the conventional cap.
  const { posts } = await listPosts({ limit: 50 });

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const image = post.coverImage ? mediaUrl(post.coverImage.path) : null;

      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      ${post.excerpt ? `<description>${xml(post.excerpt)}</description>` : ""}
      ${post.author ? `<dc:creator>${xml(post.author.name)}</dc:creator>` : ""}
      ${post.categories.map((c) => `<category>${xml(c.name)}</category>`).join("\n      ")}
      ${image ? `<enclosure url="${xml(image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AflaChat Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Agricultural insights, research and crop preservation guides on protecting your harvest from aflatoxin.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate",
    },
  });
}
