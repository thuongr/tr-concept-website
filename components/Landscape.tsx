import styles from "@/app/home.module.css";

/** Terrain is decorative, deterministic, and server rendered. Each instance owns its SVG IDs. */
export function Landscape({ id, quiet = false, reverse = false }: { id: string; quiet?: boolean; reverse?: boolean }) {
  const ridge = "M-40 186 C180 30 300 48 500 141 S810 251 1040 139 S1340 53 1480 117";
  return <div className={`${styles.terrain} ${quiet ? styles.quiet : ""} ${reverse ? styles.reverse : ""}`} aria-hidden="true">
    <svg viewBox="0 0 1440 300" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-gold`}><stop stopColor="#ba7530" stopOpacity=".12"/><stop offset=".25" stopColor="#ffe0a3"/><stop offset=".52" stopColor="#e09a43" stopOpacity=".4"/><stop offset=".84" stopColor="#ffcc7c"/><stop offset="1" stopColor="#ba7530" stopOpacity=".15"/></linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#41618a" stopOpacity=".19"/><stop offset="1" stopColor="#061326" stopOpacity="0"/></linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <path d={`${ridge} L1480 300 H-40Z`} fill={`url(#${id}-depth)`}/>
      {Array.from({length: 25}, (_, n) => <path key={n} d={`M-40 ${55+n*7} C150 ${128+n*3} 270 ${249-n*2} 490 ${186+n*2} S790 ${16+n*9} 1010 ${107+n*5} S1290 ${248-n*2} 1480 ${115+n*6}`} fill="none" stroke={n%4===0 ? "#d6b787" : "#7596b9"} strokeOpacity={.12+(n%3)*.035} strokeWidth="1.5" strokeDasharray=".1 7" strokeLinecap="round"/>) }
      <path d={ridge} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="7" opacity=".45" filter={`url(#${id}-glow)`}/>
      <path d={ridge} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.4"/>
      <path className={styles.travellingLight} d={ridge} pathLength="100" fill="none" stroke="#ffe4b3" strokeWidth="2.5" strokeDasharray="2 98"/>
    </svg>
  </div>;
}
