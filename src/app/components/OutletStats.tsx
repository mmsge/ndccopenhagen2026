import { forecast } from "@/lib/forecast";
import WeatherFace from "./WeatherFace";

interface OutletStat {
  source: string;
  color: string;
  total: number;
  avgScore: number;
  positiveRate: number;
  sunny: number;
}

const RANKS = ["①","②","③","④","⑤","⑥"];

export default function OutletStats({ stats }: { stats: OutletStat[] }) {
  if (stats.length === 0) {
    return (
      <div className="gn-empty">
        <WeatherFace score={30} size={108} />
        <h3>No data yet.</h3>
        <p>Head to The Front Page and Run the Presses first.</p>
      </div>
    );
  }

  const ranked = [...stats].sort((a, b) => b.avgScore - a.avgScore);
  const winner = ranked[0];
  const fw = forecast(winner.avgScore);

  return (
    <>
      {/* Winner spotlight */}
      <section className="gn-winner" style={{ "--sky": fw.sky, "--deep": fw.deep } as React.CSSProperties}>
        <div className="gn-winner-face">
          <WeatherFace score={winner.avgScore} size={150} />
          <span className="gn-winner-rosette">FORECASTER<br />OF THE WEEK</span>
        </div>
        <div className="gn-winner-copy">
          <p className="gn-winner-kicker">
            <span className="gn-station-dot" style={{ background: winner.color }} />
            <span>Sunniest newsroom</span>
          </p>
          <h2 className="gn-winner-name">{winner.source}</h2>
          <p className="gn-winner-line">
            Forecast: <b style={{ color: fw.deep }}>{fw.label}</b> — {fw.blurb.toLowerCase()}.{" "}
            {winner.positiveRate}% of its {winner.total} stories came in bright.
          </p>
        </div>
        <div className="gn-winner-score">
          <span className="gn-winner-num">{winner.avgScore}</span>
          <span className="gn-winner-den">avg sunshine</span>
        </div>
      </section>

      <div className="gn-section-rule"><span>The full standings</span></div>

      <div className="gn-ranks">
        {ranked.map((s, i) => {
          const f = forecast(s.avgScore);
          return (
            <div className="gn-rank" key={s.source} style={{ "--sky": f.sky } as React.CSSProperties}>
              <span className="gn-rank-no">{RANKS[i] ?? i + 1}</span>
              <WeatherFace score={s.avgScore} size={44} />
              <div className="gn-rank-main">
                <div className="gn-rank-top">
                  <span className="gn-station-dot" style={{ background: s.color }} />
                  <span className="gn-rank-name">{s.source}</span>
                  <span className="gn-rank-meta">{f.label} · {s.total} stories · {s.sunny} bright</span>
                </div>
                <div className="gn-meter">
                  <div className="gn-meter-fill" style={{ width: `${s.avgScore}%` }} />
                </div>
              </div>
              <div className="gn-rank-score"><b>{s.avgScore}</b><span>/100</span></div>
            </div>
          );
        })}
      </div>

      <p className="gn-index-foot">
        Sunshine scores are sentiment readings, not a measure of journalism. Even the cloudiest outlet does vital work — we just like to celebrate the bright bits. ☀
      </p>
    </>
  );
}
