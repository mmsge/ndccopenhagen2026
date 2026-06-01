import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";
import Masthead from "@/app/components/Masthead";
import MoodWeather from "@/app/components/MoodWeather";
import ArticleGrid from "@/app/components/ArticleGrid";
import WeatherFace from "@/app/components/WeatherFace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(300).all();

  return (
    <main className="gn-page">
      <Masthead />
      {rows.length > 0 && <MoodWeather articles={rows} />}
      {rows.length === 0 ? (
        <div className="gn-empty" style={{ marginTop: 40 }}>
          <WeatherFace score={55} size={108} />
          <h3>Ready for some good news?</h3>
          <p>Run the Presses above to fetch the latest stories.</p>
        </div>
      ) : (
        <ArticleGrid articles={rows} />
      )}
    </main>
  );
}
