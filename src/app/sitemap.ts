import type { MetadataRoute } from "next";

const baseUrl = "https://thegoodtimes.msge.no";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
