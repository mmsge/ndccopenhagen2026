export interface Forecast {
  key: "glorious" | "sunny" | "bright" | "partly" | "cloudy" | "stormy";
  label: string;
  blurb: string;
  sky: string;
  deep: string;
}

export function forecast(score: number): Forecast {
  if (score >= 80) return { key: "glorious", label: "Glorious",      blurb: "Blazing sunshine",      sky: "#FFC400", deep: "#FF9E00" };
  if (score >= 70) return { key: "sunny",    label: "Sunny",         blurb: "Clear & bright",        sky: "#FFB400", deep: "#FF8A00" };
  if (score >= 60) return { key: "bright",   label: "Bright spells", blurb: "Sun breaking through",  sky: "#B6D62B", deep: "#86B800" };
  if (score >= 50) return { key: "partly",   label: "Partly sunny",  blurb: "A few clouds about",    sky: "#6EC1F0", deep: "#37A0DC" };
  if (score >= 40) return { key: "cloudy",   label: "Overcast",      blurb: "Grey but calm",         sky: "#A9B4C2", deep: "#7C8A9C" };
  return               { key: "stormy",   label: "Stormy",        blurb: "Best stay in",          sky: "#7C8595", deep: "#525C6B" };
}

const OUTLOOK_LINES: Record<Forecast["key"], string> = {
  glorious: "A glorious day for the world.",
  sunny:    "Skies are bright out there today.",
  bright:   "Plenty of bright spells in the news.",
  partly:   "Partly sunny — good moments are breaking through.",
  cloudy:   "A little grey, but the sun's still up there.",
  stormy:   "Rough out there. Sending warm thoughts.",
};

export function outlook(avg: number): Forecast & { line: string } {
  const f = forecast(avg);
  return { ...f, line: OUTLOOK_LINES[f.key] };
}

const TOPICS = ["wildlife","energy","health","community","rescue","education","space","ocean","kindness","culture","water","science","sports"] as const;
export type Topic = typeof TOPICS[number];

export function topicFromTitle(title: string, fallbackSeed: string): Topic {
  const t = title.toLowerCase();
  if (/animal|bird|bear|whale|gorilla|bee|reef|coral|dog|forest|tree|species/.test(t)) return "wildlife";
  if (/solar|wind|power|energy|renewable|grid|battery|electricity/.test(t)) return "energy";
  if (/health|hospital|vaccine|cancer|disease|medical|doctor|pill|malaria|hearing/.test(t)) return "health";
  if (/rescue|stranded|missing|emergency|crew|save|found/.test(t)) return "rescue";
  if (/school|educat|student|class|book|library|learn|teacher/.test(t)) return "education";
  if (/space|planet|star|orbit|satellite|astro|exo/.test(t)) return "space";
  if (/ocean|sea|marine|coral|beach|river|lake|fog|swimmable/.test(t)) return "ocean";
  if (/kind|donat|gift|charity|fund|volunteer/.test(t)) return "kindness";
  if (/art|music|culture|film|museum|symphony|manuscript/.test(t)) return "culture";
  if (/water|rain|drought|flood/.test(t)) return "water";
  if (/scien|research|discover|breakthrough|study|ai|tech/.test(t)) return "science";
  if (/sport|game|team|match|win|champion|race|cup/.test(t)) return "sports";
  if (/community|volunteer|neighbour|neighbor|town|village|people/.test(t)) return "community";
  const hash = (fallbackSeed.charCodeAt(0) ?? 0) + (fallbackSeed.charCodeAt(1) ?? 0);
  return TOPICS[hash % TOPICS.length];
}
