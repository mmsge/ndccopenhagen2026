import type { MetadataRoute } from "next";

const baseUrl = "https://thegoodtimes.msge.no";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ops endpoints (naustet-server ADR 0022) are useful to agents and to
      // the box's probe, but they are not content for a search index.
      disallow: ["/api/", "/healthz", "/version", "/health"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
