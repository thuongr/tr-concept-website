import styles from "@/app/home.module.css";

const branches = [
  "M770 705 C795 620 758 571 735 544 C669 509 659 475 610 425",
  "M770 705 C758 618 751 576 766 501 C779 435 723 398 712 320",
  "M770 705 C754 610 769 546 804 483 C864 433 865 379 909 326",
  "M770 705 C800 640 831 601 899 568 C953 542 984 500 1003 455",
  "M770 705 C747 612 754 521 767 428 C791 332 875 310 927 182",
];
const flowers = [{x:610,y:425,delay:0},{x:712,y:320,delay:.45},{x:909,y:326,delay:.8},{x:1003,y:455,delay:1.15}];

/** Paths share the artwork's native coordinate system, so light stays on the tree at every width. */
export function TreeMotion() {
  return <svg className={styles.treeMotion} viewBox="0 0 1536 1024" aria-hidden="true">
    <defs>
      <filter id="tree-energy-glow"><feGaussianBlur stdDeviation="5"/></filter>
      {flowers.map((f,i)=><clipPath id={`tree-flower-${i}`} key={i}><circle cx={f.x} cy={f.y} r="64"/></clipPath>)}
    </defs>
    <g fill="none" strokeLinecap="round">
      {["M349 928 C473 827 592 761 681 758 Q753 762 770 705", "M1191 882 C1039 800 962 752 867 757 Q799 753 770 705", "M769 855 Q750 778 770 705"].map((d,i)=><path key={i} className={styles.rootEnergy} d={d} pathLength="100"/>)}
      {branches.map((d,i)=><g key={i} style={{animationDelay:`${i*.16}s`}}><path className={styles.branchHalo} d={d} pathLength="100" filter="url(#tree-energy-glow)"/><path className={styles.branchEnergy} d={d} pathLength="100"/></g>)}
    </g>
    {flowers.map((f,i)=><g key={i} className={styles.flowerBloom} style={{transformOrigin:`${f.x}px ${f.y}px`,animationDelay:`${f.delay}s`}}>
      <image href="/trconcept-growth-tree.png" width="1536" height="1024" clipPath={`url(#tree-flower-${i})`}/>
      <circle cx={f.x} cy={f.y} r="13" fill="#fff0bb" filter="url(#tree-energy-glow)"/>
    </g>)}
  </svg>;
}
