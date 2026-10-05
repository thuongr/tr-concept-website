import styles from "@/app/home.module.css";

/** Layered point-mesh terrain, not a divider. All geometry is deterministic. */
export function Landscape({ id, quiet = false, reverse = false }: { id: string; quiet?: boolean; reverse?: boolean }) {
  const phase = (Array.from(id).reduce((sum,c)=>sum+c.charCodeAt(0),0)%9)*.12;
  const contour = (layer: number, row: number) => {
    const points = Array.from({length:97},(_,i)=> {
      const x = -80+i*17;
      const y = 100+layer*39+row*2.65 + Math.sin(x/205+layer*1.9+phase)*36 + Math.sin(x/370-layer*.8)*25 + Math.sin(x/265+row*.075)*row*.5;
      return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return points.join(' ');
  };
  return <div className={`${styles.terrain} ${quiet ? styles.quiet : ""} ${reverse ? styles.reverse : ""}`} aria-hidden="true">
    <svg viewBox="0 0 1440 300" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-gold`}><stop stopColor="#a7793e" stopOpacity=".1"/><stop offset=".3" stopColor="#ebc98f" stopOpacity=".75"/><stop offset=".65" stopColor="#9faec4" stopOpacity=".25"/><stop offset="1" stopColor="#e3ba78" stopOpacity=".65"/></linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#49658a" stopOpacity=".14"/><stop offset="1" stopColor="#041225" stopOpacity="0"/></linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="white" stopOpacity="0"/><stop offset=".18" stopColor="white"/><stop offset=".7" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
        <mask id={`${id}-mask`}><rect width="1440" height="300" fill={`url(#${id}-fade)`}/></mask>
        <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {[0,1,2].map(layer=><g key={layer} opacity={[.45,.7,1][layer]}>
          <path d={`${contour(layer,0)} L1552 310 H-80Z`} fill={`url(#${id}-depth)`}/>
          {Array.from({length:28},(_,row)=><path key={row} d={contour(layer,row)} fill="none" stroke={layer===2&&row%5===0?'#dbbc86':'#91abc9'} strokeOpacity={.46-row*.008} strokeWidth={layer===2?1.9:1.5} strokeDasharray={`.1 ${layer===2?7:9}`} strokeDashoffset={row*1.7} strokeLinecap="round"/>)}
          <path d={contour(layer,0)} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={layer===2?1.2:.6}/>
        </g>)}
        <path d={contour(2,0)} fill="none" stroke="#dbb778" strokeWidth="7" opacity=".18" filter={`url(#${id}-glow)`}/>
        <path className={styles.travellingLight} d={contour(2,0)} pathLength="100" fill="none" stroke="#ffe4b3" strokeWidth="2" strokeDasharray="2 98"/>
      </g>
    </svg>
  </div>;
}
