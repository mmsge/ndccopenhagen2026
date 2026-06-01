"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function PressIcon() {
  return <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M6 7V4h12v3M6 7v6h12V7M8 17h8v3H8z"/></svg>;
}

const CONFETTI_COLORS = ["#FFC400","#E8362A","#1F4FE0","#B6D62B","#8B2FE6","#00A6A6"];

function PressOverlay({ onDone }: { onDone: () => void }) {
  return (
    <>
      <div className="gn-press-overlay" onClick={onDone}>
        <svg viewBox="0 0 100 100" width={72} height={72} className="gn-press-sun" style={{ color: "#FFC400" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={50 + Math.cos(a)*30} y1={50 + Math.sin(a)*30} x2={50 + Math.cos(a)*44} y2={50 + Math.sin(a)*44} stroke="currentColor" strokeWidth="6" strokeLinecap="round" />;
          })}
          <circle cx="50" cy="50" r="24" fill="currentColor" />
        </svg>
        <p className="gn-press-stamp">Stop the press!</p>
        <p className="gn-press-sub">Printing fresh stories…</p>
      </div>
      <div className="gn-burst">
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} className="gn-confetti" style={{
            left: `${Math.random() * 100}%`,
            width: 10 + Math.random() * 8,
            height: 10 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDuration: `${0.9 + Math.random() * 1.1}s`,
            animationDelay: `${Math.random() * 0.4}s`,
            ["--rot" as string]: `${(Math.random() - 0.5) * 720}deg`,
          } as React.CSSProperties} />
        ))}
      </div>
    </>
  );
}

export default function RefreshButton() {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const router = useRouter();

  async function handleRefresh() {
    setState("running");
    setJustAdded(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();
      setJustAdded(data.inserted);
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("idle");
    }
  }

  return (
    <>
      {state === "running" && <PressOverlay onDone={() => setState("idle")} />}
      <div className="gn-presses-wrap">
        {justAdded != null && state === "idle" && (
          <span className="gn-presses-flash">+{justAdded} fresh ☀</span>
        )}
        <button
          className={`gn-presses${state === "running" ? " is-running" : ""}`}
          onClick={handleRefresh}
          disabled={state === "running"}
        >
          <span className="gn-presses-ico"><PressIcon /></span>
          {state === "running" ? "Printing…" : "Run the Presses"}
        </button>
      </div>
    </>
  );
}
