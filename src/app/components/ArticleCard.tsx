import { Article } from "@/db/schema";
import { FEED_COLOR_MAP } from "@/lib/feeds";
import { forecast, topicFromTitle } from "@/lib/forecast";
import WeatherFace from "./WeatherFace";
import CoverArt from "./CoverArt";

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

function MoodBadge({ score }: { score: number }) {
  return (
    <span className="gn-mood">
      <WeatherFace score={score} size={26} />
      <b>{score}</b>
    </span>
  );
}

interface Props { article: Article; index?: number; }

export function ArticleCard({ article, index = 0 }: Props) {
  const color = FEED_COLOR_MAP[article.source] ?? "#555";
  const f = forecast(article.sentimentScore);
  const topic = topicFromTitle(article.title, article.id);
  const d = new Date(article.publishedAt * 1000);
  const dateStr = `${MON[d.getMonth()]} ${d.getDate()}`;

  return (
    <a className="gn-card" href={article.url} target="_blank" rel="noopener noreferrer">
      <div className="gn-card-cover">
        <CoverArt topic={topic} color={color} score={article.sentimentScore} seed={index} />
        <span className="gn-card-kicker" style={{ background: color }}>{article.source}</span>
        <MoodBadge score={article.sentimentScore} />
      </div>
      <div className="gn-card-body">
        <p className="gn-card-dateline">{dateStr}</p>
        <h3 className="gn-card-title">{article.title}</h3>
        {article.ingress && <p className="gn-card-ingress">{article.ingress}</p>}
        <div className="gn-card-foot">
          <span className="gn-card-forecast" style={{ color: f.deep }}>● {f.label}</span>
          <span className="gn-card-read">Read <ArrowIcon /></span>
        </div>
      </div>
    </a>
  );
}

export function LeadCard({ article, index = 0 }: Props) {
  const color = FEED_COLOR_MAP[article.source] ?? "#555";
  const f = forecast(article.sentimentScore);
  const topic = topicFromTitle(article.title, article.id);
  const d = new Date(article.publishedAt * 1000);
  const dateStr = `${MON[d.getMonth()]} ${d.getDate()}`;

  return (
    <a className="gn-lead" href={article.url} target="_blank" rel="noopener noreferrer">
      <div className="gn-lead-cover">
        <CoverArt topic={topic} color={color} score={article.sentimentScore} seed={index} />
        <span className="gn-card-kicker" style={{ background: color }}>{article.source}</span>
        <MoodBadge score={article.sentimentScore} />
      </div>
      <div className="gn-lead-body">
        <p className="gn-lead-tag">★ Lead story · {dateStr}</p>
        <h2 className="gn-lead-title">{article.title}</h2>
        {article.ingress && <p className="gn-lead-ingress">{article.ingress}</p>}
        <div className="gn-lead-foot">
          <span className="gn-lead-forecast" style={{ color: f.deep }}>
            <WeatherFace score={article.sentimentScore} size={30} /> {f.label} · {f.blurb}
          </span>
          <span className="gn-card-read">Read the story <ArrowIcon /></span>
        </div>
      </div>
    </a>
  );
}
