"use client";

import { useState, useMemo } from "react";
import { Article } from "@/db/schema";
import { ArticleCard, LeadCard } from "./ArticleCard";
import FilterBar from "./FilterBar";
import WeatherFace from "./WeatherFace";

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  const [threshold, setThreshold] = useState(55);
  const [sort, setSort] = useState("sunniest");

  const filtered = useMemo(() =>
    articles
      .filter((a) => a.sentimentScore >= threshold)
      .sort((a, b) =>
        sort === "sunniest"
          ? b.sentimentScore - a.sentimentScore
          : b.publishedAt - a.publishedAt
      ),
    [articles, threshold, sort]
  );

  const [lead, ...rest] = filtered;

  return (
    <>
      <FilterBar threshold={threshold} setThreshold={setThreshold} sort={sort} setSort={setSort} count={filtered.length} />

      <div className="gn-section-rule">
        <span>{sort === "sunniest" ? "Sunniest stories first" : "Hot off the presses"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="gn-empty">
          <WeatherFace score={30} size={108} />
          <h3>That bar&apos;s a touch too high.</h3>
          <p>Nudge the sunshine filter down, or Run the Presses for a fresh batch.</p>
        </div>
      ) : (
        <>
          {lead && <LeadCard article={lead} index={0} />}
          <div className="gn-grid">
            {rest.map((a, idx) => <ArticleCard key={a.id} article={a} index={idx + 1} />)}
          </div>
        </>
      )}
    </>
  );
}
