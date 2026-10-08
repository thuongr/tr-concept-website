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
        <linearGradient id={`${id}-gold`}><stop stopColor="#694016" stopOpacity=".3"/><stop offset=".19" stopColor="#bb761f"/><stop offset=".29" stopColor="#fff3c5"/><stop offset=".36" stopColor="#e8ac43"/><stop offset=".53" stopColor="#735021" stopOpacity=".45"/><stop offset=".72" stopColor="#d99528"/><stop offset=".83" stopColor="#fff0b5"/><stop offset="1" stopColor="#9c5f16" stopOpacity=".4"/></linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#49658a" stopOpacity=".14"/><stop offset="1" stopColor="#041225" stopOpacity="0"/></linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="white" stopOpacity="0"/><stop offset=".18" stopColor="white"/><stop offset=".7" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
        <mask id={`${id}-mask`}><rect width="1440" height="300" fill={`url(#${id}-fade)`}/></mask>
        <linearGradient id={`${id}-energy`}><stop stopColor="white" stopOpacity="0"/><stop offset=".35" stopColor="white" stopOpacity=".6"/><stop offset=".55" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
        <mask id={`${id}-energy-mask`} maskUnits="userSpaceOnUse" x="-80" y="0" width="1632" height="300"><rect className={styles.waveSweep} x="-600" width="280" height="300" fill={`url(#${id}-energy)`}/></mask>
        <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {[0,1,2].map(layer=><g key={layer} opacity={[.45,.7,1][layer]}>
          <path d={`${contour(layer,0)} L1552 310 H-80Z`} fill={`url(#${id}-depth)`}/>
          {Array.from({length:28},(_,row)=><path key={row} d={contour(layer,row)} fill="none" stroke={layer===2&&row%4===0?'#d69a36':'#607b9c'} strokeOpacity={.32-row*.007} strokeWidth={layer===2?1.35:1} strokeDasharray={`.1 ${layer===2?7:9}`} strokeDashoffset={row*1.7} strokeLinecap="round"/>)}
          <path d={contour(layer,0)} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={layer===2?1.7:.5}/>
        </g>)}
        <path d={contour(2,0)} fill="none" stroke="#c47b18" strokeWidth="8" opacity=".28" filter={`url(#${id}-glow)`}/>
        <g mask={`url(#${id}-energy-mask)`}>
          {[2].map(layer=><g key={layer}>
            {Array.from({length:18},(_,row)=><path key={row} d={contour(layer,row)} fill="none" stroke="#e8a638" strokeOpacity={.66-row*.03} strokeWidth="1.7" strokeDasharray=".1 7" strokeDashoffset={row*1.7} strokeLinecap="round"/>)}
            <path d={contour(layer,0)} fill="none" stroke="#d78a17" strokeWidth="11" opacity=".65" filter={`url(#${id}-glow)`}/>
            <path d={contour(layer,0)} fill="none" stroke="#ffd366" strokeWidth="3" opacity=".95"/>
          <path d={contour(layer,0)} fill="none" stroke="#fff6d8" strokeWidth=".85"/>
          </g>)}
        </g>
      </g>
    </svg>
  </div>;
}
