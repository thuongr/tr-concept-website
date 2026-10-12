import styles from "@/app/home.module.css";

/** Four overlapping dune surfaces. Dots follow the terrain rather than a flat pattern. */
export function Landscape({ id, quiet = false, reverse = false }: { id: string; quiet?: boolean; reverse?: boolean }) {
  const phase = (Array.from(id).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 9) * .12;
  const contour = (layer: number, row = 0) => Array.from({ length: 121 }, (_, i) => {
    const x = -80 + i * 13.4;
    const depth = row / 35;
    const crest = Math.sin(x / (176 + layer * 22) + layer * 1.6 + phase) * (27 + layer * 5)
      + Math.sin(x / 330 + layer * .7) * 22;
    const y = 76 + layer * 30 + crest * (1 - depth * .38) + row * (1.2 + depth * 2)
      + Math.sin(x / 130 + depth * 2 + layer) * depth * 9;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const ridges = [0, 1, 2, 3].map(layer => contour(layer));
  return <div className={`${styles.terrain} ${quiet ? styles.quiet : ""} ${reverse ? styles.reverse : ""}`} aria-hidden="true">
    <svg viewBox="0 0 1440 340" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-gold`}>
          <stop stopColor="#674323" stopOpacity=".25"/><stop offset=".13" stopColor="#ad702b"/>
          <stop offset=".25" stopColor="#f0be62"/><stop offset=".29" stopColor="#fff5d9"/>
          <stop offset=".34" stopColor="#c88e39"/><stop offset=".5" stopColor="#704619" stopOpacity=".55"/>
          <stop offset=".68" stopColor="#c68a32"/><stop offset=".78" stopColor="#ffebbd"/>
          <stop offset=".84" stopColor="#d89f42"/><stop offset="1" stopColor="#725024" stopOpacity=".25"/>
        </linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#28405d" stopOpacity=".25"/><stop offset="1" stopColor="#041225" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="white" stopOpacity="0"/><stop offset=".12" stopColor="white"/>
          <stop offset=".64" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <mask id={`${id}-mask`}><rect width="1440" height="340" fill={`url(#${id}-fade)`}/></mask>
        <linearGradient id={`${id}-energy`}>
          <stop stopColor="white" stopOpacity="0"/><stop offset=".44" stopColor="white" stopOpacity=".2"/>
          <stop offset=".55" stopColor="white"/><stop offset=".63" stopColor="white" stopOpacity=".35"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <mask id={`${id}-energy-mask`} maskUnits="userSpaceOnUse" x="-80" y="0" width="1632" height="340">
          <rect className={styles.waveSweep} x="-500" width="420" height="340" fill={`url(#${id}-energy)`}/>
        </mask>
        <filter id={`${id}-glow`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {ridges.map((ridge, layer) => <g key={layer} opacity={[.35, .55, .8, 1][layer]}>
          <path d={`${ridge} L1530 360 H-80Z`} fill={`url(#${id}-depth)`}/>
          {Array.from({length: 36}, (_, row) => <path key={row} d={contour(layer, row)} fill="none"
            stroke={row % 5 === 0 || layer === 3 ? `url(#${id}-gold)` : "#8294af"}
            strokeOpacity={(1 - row / 38) * (layer > 1 ? .65 : .3)} strokeWidth={layer > 1 ? 1.55 : 1}
            strokeDasharray={`.1 ${5 + row * .09}`} strokeDashoffset={row * 2.1} strokeLinecap="round"/>) }
          <path d={ridge} fill="none" stroke="#bb792a" strokeWidth={layer > 1 ? 9 : 3} opacity=".25" filter={`url(#${id}-glow)`}/>
          <path d={ridge} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={layer > 1 ? 1.65 : .7}/>
        </g>)}
        <g mask={`url(#${id}-energy-mask)`}>
          {[2,3].map(layer => <g key={layer} opacity={layer === 3 ? 1 : .55}>
            <path d={ridges[layer]} fill="none" stroke="#e6a53d" strokeWidth="13" opacity=".55" filter={`url(#${id}-glow)`}/>
            <path d={ridges[layer]} fill="none" stroke="#f5cb79" strokeWidth="3"/>
            <path d={ridges[layer]} fill="none" stroke="#fff9e9" strokeWidth="1"/>
            {Array.from({length: 16}, (_, row) => <path key={row} d={contour(layer, row)} fill="none" stroke="#e7b759" strokeOpacity={.7-row*.04} strokeWidth="1.7" strokeDasharray=".1 6" strokeDashoffset={row*2.1} strokeLinecap="round"/>)}
          </g>)}
        </g>
      </g>
    </svg>
  </div>;
}
