import type { MetadataRoute } from "next";
import { PAGE_DATES } from "@/lib/page-dates";

const baseUrl = "https://thegoodtimes.msge.no";

export default function sitemap(): MetadataRoute.Sitemap {
  // Site-level modified date from git history (see src/lib/page-dates.ts) —
  // truthful rather than "whenever this route last rendered".
  const lastModified = PAGE_DATES.modified;

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
