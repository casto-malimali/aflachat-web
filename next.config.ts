import type { NextConfig } from "next";

/**
 * Blog images are served by the backend, whose host differs per environment
 * (localhost in dev, the API domain in production). Derived from the same env
 * var the API client uses so the two can never disagree.
 */
function apiImagePattern() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const url = new URL(base);
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port || undefined,
    pathname: "/media/blog/**",
  };
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      apiImagePattern(),
    ],
  },
};

export default nextConfig;
