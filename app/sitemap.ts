import { MetadataRoute } from "next";
import { listCategories, listPosts, listTags } from "@/lib/blog/serverApi";

// Revalidated so newly published posts appear without a redeploy.
// Next requires segment config to be a literal it can statically analyse —
// an imported constant is rejected at build time. Keep in step with
// REVALIDATE_SECONDS in lib/blog/serverApi.ts.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aflachat.com";
  const routes = ["", "/services", "/blog", "/contact", "/download", "/privacy", "/terms"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/privacy" || route === "/terms" ? 0.3 : 0.8,
    alternates: {
      languages: {
        en: `${baseUrl}${route}`,
        sw: `${baseUrl}${route}?lang=sw`,
      },
    },
  }));

  // Every published post, plus the taxonomy listings. A blog outage degrades to
  // the static routes rather than failing the whole sitemap.
  const [list, categories, tags] = await Promise.all([
    listPosts({ limit: 50 }),
    listCategories(),
    listTags(),
  ]);

  const postEntries: MetadataRoute.Sitemap = list.posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/blog/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${baseUrl}/blog/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticEntries, ...postEntries, ...categoryEntries, ...tagEntries];
}
