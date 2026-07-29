import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aflachat.com";
  const routes = ["", "/services", "/blog", "/contact", "/download", "/privacy", "/terms"];

  return routes.map((route) => ({
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
}
