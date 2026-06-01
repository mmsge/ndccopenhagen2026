import { forecast, type Topic } from "@/lib/forecast";

const MOTIFS: Record<Topic, string> = {
  wildlife:  "M30 70 q0-22 20-22 q20 0 20 22 M38 48 l-5-12 M62 48 l5-12 M44 64 a3 3 0 1 0 .1 0 M56 64 a3 3 0 1 0 .1 0",
  energy:    "M54 18 L30 56 H48 L44 82 L70 42 H50 Z",
  health:    "M50 78 C18 56 26 28 44 30 C50 31 50 38 50 38 C50 38 50 31 56 30 C74 28 82 56 50 78 Z",
  community: "M35 44 a8 8 0 1 0 .1 0 M65 44 a8 8 0 1 0 .1 0 M22 76 q0-16 13-16 M78 76 q0-16 -13-16 M50 50 a9 9 0 1 0 .1 0 M34 80 q0-18 16-18 q16 0 16 18",
  rescue:    "M50 20 a30 30 0 1 0 .1 0 M50 36 v18 l13 9",
  education: "M20 42 L50 28 L80 42 L50 56 Z M68 49 V66 M34 53 v12 q16 12 32 0 v-12",
  space:     "M40 60 C40 30 70 22 78 22 C78 30 70 60 40 60 Z M40 60 l-12 12 M58 36 a4 4 0 1 0 .1 0",
  ocean:     "M16 44 q12-12 24 0 t24 0 t24 0 M16 60 q12-12 24 0 t24 0 t24 0 M16 76 q12-12 24 0 t24 0 t24 0",
  kindness:  "M50 78 C18 56 26 28 44 30 C50 31 50 38 50 38 C50 38 50 31 56 30 C74 28 82 56 50 78 Z",
  culture:   "M40 24 V64 a9 9 0 1 1 -8-8 V36 l30-8 V60 a9 9 0 1 1 -8-8 V24 Z",
  water:     "M50 22 C50 22 28 50 28 64 a22 22 0 0 0 44 0 C72 50 50 22 50 22 Z",
  science:   "M42 22 V44 L26 74 a6 6 0 0 0 6 8 H68 a6 6 0 0 0 6-8 L58 44 V22 M38 22 H62 M40 62 H60",
  sports:    "M50 22 a28 28 0 1 0 .1 0 M50 32 l16 12 -6 19 H40 l-6-19 Z M50 32 v12 M40 63 l10-7 10 7 M34 44 l16 12 M66 44 L50 56",
};

interface Props { topic: Topic; color: string; score: number; seed?: number; }

export default function CoverArt({ topic, color, score, seed = 0 }: Props) {
  const f = forecast(score);
  const gid = `gn-dot-${topic}-${seed}`;
  const d = MOTIFS[topic] ?? MOTIFS.community;
  const rot = ((seed * 37) % 12) - 6;
  return (
    <svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" className="gn-cover" style={{ display: "block", width: "100%", height: "100%" }}>
      <defs>
        <pattern id={gid} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <circle cx="2" cy="2" r="1.5" fill="#1A1208" opacity="0.16" />
        </pattern>
      </defs>
      <rect width="100" height="70" fill={color} />
      <rect width="100" height="70" fill={`url(#${gid})`} />
      <g transform={`translate(0 4) rotate(${rot} 50 35)`}>
        <path d={d} fill="none" stroke="#1A1208" strokeOpacity="0.92" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="86" cy="14" r="7" fill={f.sky} stroke="#1A1208" strokeWidth="2" />
    </svg>
  );
}
