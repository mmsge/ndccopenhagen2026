export default function SunLogo({ size = 44 }: { size?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return (
      <line key={i}
        x1={50 + Math.cos(a) * 30} y1={50 + Math.sin(a) * 30}
        x2={50 + Math.cos(a) * 44} y2={50 + Math.sin(a) * 44}
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    );
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
      <g className="gn-rays" style={{ transformOrigin: "50px 50px" }}>{rays}</g>
      <circle cx="50" cy="50" r="24" fill="currentColor" />
    </svg>
  );
}
