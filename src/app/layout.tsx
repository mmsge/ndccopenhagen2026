import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";

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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${newsreader.variable} ${spaceMono.variable}`}>
      <body>
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
