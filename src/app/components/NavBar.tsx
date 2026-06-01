"use client";

import { usePathname, useRouter } from "next/navigation";
import SunLogo from "./SunLogo";
import RefreshButton from "./RefreshButton";

function PaperIcon() {
  return <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h8"/></svg>;
}
function ChartIcon() {
  return <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isIndex = pathname === "/dashboard";

  return (
    <header className="gn-topbar">
      <div className="gn-topbar-inner">
        <button className="gn-brand" onClick={() => router.push("/")} aria-label="The Good Times — home">
          <span className="gn-brand-sun"><SunLogo size={26} /></span>
          <span className="gn-brand-word">THE&nbsp;GOOD&nbsp;TIMES</span>
        </button>
        <nav className="gn-nav">
          <button className={`gn-tab${!isIndex ? " is-active" : ""}`} onClick={() => router.push("/")}>
            <span className="gn-tab-ico"><PaperIcon /></span>The Front Page
          </button>
          <button className={`gn-tab${isIndex ? " is-active" : ""}`} onClick={() => router.push("/dashboard")}>
            <span className="gn-tab-ico"><ChartIcon /></span>The Sunshine Index
          </button>
        </nav>
        <RefreshButton />
      </div>
    </header>
  );
}
