"use client";
import { useEffect, useRef, useState } from "react";

const left = [["TASK","Define the work"],["CONTEXT","Provide the full picture"],["SKILL SET","Create reusable ways of working"]];
const right = [["BRAIN","Know"],["HEART","Align"],["SKILLS","Do"],["AGENTS","Own responsibility"],["WORKFLOW","Move the work"]];

export function ArchitectureReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage,setStage]=useState(0);
  useEffect(()=>{const onScroll=()=>{if(!ref.current)return;const r=ref.current.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height*.35)));setStage(p>.7?3:p>.47?2:p>.2?1:0)};onScroll();addEventListener("scroll",onScroll,{passive:true});return()=>removeEventListener("scroll",onScroll)},[]);
  return <div ref={ref} className={`architecture-reveal stage-${stage}`}>
    <div><span className="micro-label">Start here · Level 1</span><div className="node-stack">{left.map(([t,s])=><div className="arch-node left-node" key={t}><strong>{t}</strong><span>{s}</span></div>)}</div></div>
    <div className="arch-bridge">→</div>
    <div><span className="micro-label">Then go further · Level 2</span><div className="business-node"><strong>BUSINESS</strong><span>Your goals, people, operations</span></div><div className="node-grid">{right.map(([t,s])=><div className="arch-node right-node" key={t}><strong>{t}</strong><span>{s}</span></div>)}</div></div>
  </div>;
}
