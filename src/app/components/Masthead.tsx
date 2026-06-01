import SunLogo from "./SunLogo";

const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Masthead() {
  const now = new Date();
  const dateline = `${DOW[now.getDay()]}, ${MON[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`.toUpperCase();

  return (
    <div className="gn-masthead">
      <div className="gn-dateline-rule">
        <span>VOL. MMXXVI</span>
        <span>·</span>
        <span>{dateline}</span>
        <span>·</span>
        <span>EST. 2026</span>
        <span className="gn-dateline-price">PRICE: FREE &amp; ALWAYS GOOD</span>
      </div>
      <div className="gn-nameplate">
        <span className="gn-nameplate-sun"><SunLogo size={62} /></span>
        <h1 className="gn-nameplate-word">The Good Times</h1>
        <span className="gn-nameplate-sun"><SunLogo size={62} /></span>
      </div>
      <div className="gn-slogan-rule">
        <span className="gn-slogan">&ldquo;All the news that&apos;s <em>glad</em> to print.&rdquo;</span>
      </div>
    </div>
  );
}
