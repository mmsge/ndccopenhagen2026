export interface FeedConfig {
  name: string;
  url: string;
  color: string;
}

// Riso-pop palette from the design
export const FEEDS: FeedConfig[] = [
  { name: "BBC News",     url: "https://feeds.bbci.co.uk/news/world/rss.xml",     color: "#E8362A" },
  { name: "DW",           url: "https://rss.dw.com/xml/rss-en-world",             color: "#FF7A1A" },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss",            color: "#1F4FE0" },
  { name: "NPR",          url: "https://feeds.npr.org/1001/rss.xml",               color: "#8B2FE6" },
  { name: "ABC News",     url: "https://feeds.abcnews.com/abcnews/topstories",     color: "#00A6A6" },
  { name: "Al Jazeera",   url: "https://www.aljazeera.com/xml/rss/all.xml",        color: "#E0A300" },
];

export const FEED_COLOR_MAP: Record<string, string> = Object.fromEntries(
  FEEDS.map((f) => [f.name, f.color])
);
