"use client";

import { forecast } from "@/lib/forecast";
import WeatherFace from "./WeatherFace";

function SunIcon() {
  return <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}

interface Props {
  threshold: number;
  setThreshold: (v: number) => void;
  sort: string;
  setSort: (v: string) => void;
  count: number;
}

export default function FilterBar({ threshold, setThreshold, sort, setSort, count }: Props) {
  const f = forecast(threshold);
  return (
    <div className="gn-filter">
      <div className="gn-filter-slider">
        <div className="gn-filter-head">
          <div>
            <p className="gn-filter-title">Set your sunshine</p>
            <p className="gn-filter-sub">{count} {count === 1 ? "story is" : "stories are"} clearing the bar</p>
          </div>
          <div className="gn-filter-readout">
            <WeatherFace score={threshold} size={40} />
            <span className="gn-filter-num">{threshold}</span>
            <span className="gn-filter-lab">{f.label}</span>
          </div>
        </div>
        <input
          className="gn-range"
          type="range" min={0} max={100} step={5}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
        <div className="gn-range-ends"><span>Stormy</span><span>Glorious</span></div>
      </div>
      <div className="gn-sort">
        <span className="gn-sort-label">Sort</span>
        <button className={`gn-sort-btn${sort === "sunniest" ? " is-on" : ""}`} onClick={() => setSort("sunniest")}>
          <SunIcon /> Sunniest
        </button>
        <button className={`gn-sort-btn${sort === "fresh" ? " is-on" : ""}`} onClick={() => setSort("fresh")}>
          <ClockIcon /> Freshest
        </button>
      </div>
    </div>
  );
}
