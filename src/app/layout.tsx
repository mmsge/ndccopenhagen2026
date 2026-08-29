import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import { PAGE_DATES } from "@/lib/page-dates";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Good Times",
  description: "All the news that's glad to print.",
  other: {
    date: PAGE_DATES.created,
    "last-modified": PAGE_DATES.modified,
  },
};

// Site-level created/modified JSON-LD, from git history (see
// src/lib/page-dates.ts / scripts/generate-page-dates.sh). Same pattern as
// msge-no (ADR 0004) and naustet-server (ADR 0015). `article:*` isn't
// representable via the typed Metadata `openGraph` fields without also
// claiming og:type=article, so it's rendered directly — React hoists
// <meta>/<script> tags into <head> regardless of where they render.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Good Times",
  url: "https://thegoodtimes.msge.no/",
  dateCreated: PAGE_DATES.created,
  datePublished: PAGE_DATES.created,
  dateModified: PAGE_DATES.modified,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${newsreader.variable} ${spaceMono.variable}`}>
      <body>
        <meta property="article:published_time" content={PAGE_DATES.created} />
        <meta property="article:modified_time" content={PAGE_DATES.modified} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }}
        />
        <div className="gn-root">
          <NavBar />
          {children}
          <footer className="gn-footer">
            <svg viewBox="0 0 100 100" width={22} height={22} style={{ color: "#FFC400" }}>
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1={50 + Math.cos(a)*30} y1={50 + Math.sin(a)*30} x2={50 + Math.cos(a)*44} y2={50 + Math.sin(a)*44} stroke="currentColor" strokeWidth="6" strokeLinecap="round" />;
              })}
              <circle cx="50" cy="50" r="24" fill="currentColor" className="gn-rays" style={{ transformOrigin: "50px 50px" }} />
            </svg>
            <span>THE GOOD TIMES · All the news that&apos;s glad to print · {new Date().getFullYear()}</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
