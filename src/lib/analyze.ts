import Sentiment from "sentiment";

const analyzer = new Sentiment();

export function scoreText(title: string, description: string): number {
  const result = analyzer.analyze(`${title} ${description}`);
  // comparative is score/wordCount; news text typically falls in [-0.8, +0.6]
  // divisor 0.5 maps that range to [0, 100] with 0 = neutral = 50
  const normalized = Math.min(100, Math.max(0, Math.round((result.comparative / 0.5 + 1) * 50)));
  return normalized;
}

export function truncateIngress(text: string, maxLen = 200): string {
  const stripped = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}
