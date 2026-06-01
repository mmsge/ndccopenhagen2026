import { Article } from "@/db/schema";
import { outlook, forecast } from "@/lib/forecast";
import { FEEDS } from "@/lib/feeds";
import WeatherFace from "./WeatherFace";

export default function MoodWeather({ articles }: { articles: Article[] }) {
  const avg = articles.length
    ? Math.round(articles.reduce((s, a) => s + a.sentimentScore, 0) / articles.length)
    : 50;
  const o = outlook(avg);

  const stations = FEEDS.map((feed) => {
    const rows = articles.filter((a) => a.source === feed.name);
    const a = rows.length ? Math.round(rows.reduce((s, r) => s + r.sentimentScore, 0) / rows.length) : 50;
    return { name: feed.name, color: feed.color, avg: a };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <section className="gn-weather" style={{ "--sky": o.sky, "--deep": o.deep } as React.CSSProperties}>
      <div className="gn-weather-main">
        <div className="gn-weather-face"><WeatherFace score={avg} size={150} /></div>
        <div className="gn-weather-copy">
          <p className="gn-weather-kicker">Today&apos;s Outlook · The World</p>
          <h2 className="gn-weather-label">{o.label}</h2>
          <p className="gn-weather-line">{o.line}</p>
        </div>
        <div className="gn-weather-score">
          <span className="gn-weather-num">{avg}</span>
          <span className="gn-weather-den">/100<br />sunshine</span>
        </div>
      </div>
      <div className="gn-stations">
        <p className="gn-stations-title">Across the wires</p>
        <div className="gn-stations-row">
          {stations.map((s) => (
            <div className="gn-station" key={s.name}>
              <WeatherFace score={s.avg} size={34} />
              <span className="gn-station-dot" style={{ background: s.color }} />
              <span className="gn-station-name">{s.name}</span>
              <span className="gn-station-avg">{s.avg}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
