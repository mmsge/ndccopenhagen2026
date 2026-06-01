import { forecast } from "@/lib/forecast";

interface Props { score: number; size?: number; faded?: boolean; }

export default function WeatherFace({ score, size = 64, faded = false }: Props) {
  const f = forecast(score);
  const op = faded ? 0.5 : 1;
  const ink = "#1A1208";

  let mouth: React.ReactNode;
  if (score >= 70)      mouth = <path d="M40 56 Q50 68 60 56" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />;
  else if (score >= 55) mouth = <path d="M41 58 Q50 64 59 58" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />;
  else if (score >= 45) mouth = <path d="M42 60 H58"           fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />;
  else                  mouth = <path d="M41 62 Q50 56 59 62"  fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />;

  const eyes = (
    <g fill={ink}>
      <circle cx="41" cy="47" r="3.4" />
      <circle cx="59" cy="47" r="3.4" />
    </g>
  );

  // SUN family
  if (f.key === "glorious" || f.key === "sunny" || f.key === "bright") {
    const n = 12, R1 = 33, R2 = f.key === "glorious" ? 47 : 43;
    const rays = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return (
        <line key={i}
          x1={50 + Math.cos(a) * R1} y1={50 + Math.sin(a) * R1}
          x2={50 + Math.cos(a) * R2} y2={50 + Math.sin(a) * R2}
          stroke={f.deep} strokeWidth="4.5" strokeLinecap="round" />
      );
    });
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ opacity: op, display: "block" }}>
        <g className="gn-rays" style={{ transformOrigin: "50px 50px" }}>{rays}</g>
        <circle cx="50" cy="50" r="26" fill={f.sky} stroke={ink} strokeWidth="3.5" />
        {eyes}{mouth}
      </svg>
    );
  }

  // PARTLY SUNNY
  if (f.key === "partly") {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ opacity: op, display: "block" }}>
        <g style={{ transformOrigin: "34px 34px" }} className="gn-rays">
          {[0,1,2,3,4].map((i) => {
            const a = (-0.5 + i * 0.32) * Math.PI;
            return <line key={i} x1={34 + Math.cos(a)*20} y1={34 + Math.sin(a)*20} x2={34 + Math.cos(a)*28} y2={34 + Math.sin(a)*28} stroke="#FF9E00" strokeWidth="4" strokeLinecap="round" />;
          })}
        </g>
        <circle cx="34" cy="34" r="15" fill="#FFC400" stroke={ink} strokeWidth="3.5" />
        <path d="M30 70 a16 16 0 0 1 4-31 a20 20 0 0 1 38 4 a14 14 0 0 1 -2 27 Z" fill={f.sky} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <g fill={ink}><circle cx="46" cy="58" r="3.2" /><circle cx="63" cy="58" r="3.2" /></g>
        <path d="M46 66 Q54.5 71 63 66" fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />
      </svg>
    );
  }

  // CLOUDY
  if (f.key === "cloudy") {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ opacity: op, display: "block" }}>
        <path d="M28 72 a17 17 0 0 1 3-33 a22 22 0 0 1 41 5 a15 15 0 0 1 -2 28 Z" fill={f.sky} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <g fill={ink}><circle cx="44" cy="55" r="3.3" /><circle cx="62" cy="55" r="3.3" /></g>
        <path d="M45 64 H61" fill="none" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
      </svg>
    );
  }

  // STORMY
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ opacity: op, display: "block" }}>
      <path d="M28 64 a17 17 0 0 1 3-33 a22 22 0 0 1 41 5 a15 15 0 0 1 -2 28 Z" fill={f.sky} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <g fill={ink}><circle cx="44" cy="47" r="3.3" /><circle cx="62" cy="47" r="3.3" /></g>
      <path d="M45 58 Q53 52 61 58" fill="none" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
      <g stroke="#4F7FE0" strokeWidth="4" strokeLinecap="round" className="gn-rain">
        <line x1="40" y1="72" x2="36" y2="84" />
        <line x1="53" y1="72" x2="49" y2="84" />
        <line x1="66" y1="72" x2="62" y2="84" />
      </g>
    </svg>
  );
}
