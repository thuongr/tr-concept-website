/** Layered flowing wave sheets. Fine points follow each fold; light travels along it. */
import { writeFileSync } from 'node:fs';
const W=1600,H=440;
const xy=(x,y)=>`${x.toFixed(1)},${y.toFixed(1)}`;
const layers=[{base:135,amp:43,phase:.3,depth:115},{base:195,amp:60,phase:2.5,depth:135},{base:260,amp:48,phase:4.1,depth:110}];
const wave=(x,l,t=0)=>l.base+Math.sin(x/270+l.phase+t*.8)*l.amp+Math.sin(x/510+l.phase)*22+t*l.depth;
const out=[];
layers.forEach((l,k)=>{
 const ridge=Array.from({length:321},(_,i)=>{const x=i*5;return xy(x,wave(x,l));}).join('L');
 out.push(`<path d="M${ridge}L1600,440H0Z" fill="url(#sheet${k})"/>`);
 const dots=[[],[],[]];
 for(let r=0;r<33;r++)for(let c=0;c<235;c++){
 const t=r/32,x=c/234*1600+Math.sin(r*.19)*3;
 const y=wave(x,l,t),hash=(Math.sin(c*127.1+r*311.7+k)*43758.5453)%1;
 const band=Math.abs(hash)>.78?2:Math.abs(hash)>.35?1:0;
 dots[band].push(`M${xy(x,y)}h.01`);
 }
 dots.forEach((d,i)=>out.push(`<path d="${d.join('')}" fill="none" stroke="${['#54718c','#9a9278','#d1b176'][i]}" stroke-width="${.65+i*.2}" stroke-linecap="round" opacity="${[.24,.36,.55][i]}"/>`));
 out.push(`<path d="M${ridge}" fill="none" stroke="url(#metal)" stroke-width=".8" opacity=".65"/>`);
 // A broad luminous reflection with a sharp core, moving along the actual ridge.
 out.push(`<g class="energy e${k}" mask="url(#travel${k})"><path d="M${ridge}" fill="none" stroke="#d68b32" stroke-width="12" filter="url(#glow)"/><path d="M${ridge}" fill="none" stroke="#e9ad50" stroke-width="3"/><path d="M${ridge}" fill="none" stroke="#fff0c5" stroke-width="1"/>${dots[2].length?`<path d="${dots[2].join('')}" fill="none" stroke="#efbf6b" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>`:''}</g>`);
});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><style>.sweep{animation:travel 12s linear infinite}.s1{animation-delay:-4s}.s2{animation-delay:-8s}@keyframes travel{from{transform:translateX(-500px)}to{transform:translateX(1900px)}}@media(prefers-reduced-motion:reduce){.sweep{animation:none;transform:translateX(650px)}.energy{opacity:.35}}</style><defs><filter id="glow" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="5"/></filter><linearGradient id="metal"><stop stop-color="#694921" stop-opacity="0"/><stop offset=".2" stop-color="#ba873e"/><stop offset=".48" stop-color="#e2bb73"/><stop offset=".7" stop-color="#875b29"/><stop offset="1" stop-color="#caa565" stop-opacity=".2"/></linearGradient><linearGradient id="beam"><stop stop-color="white" stop-opacity="0"/><stop offset=".5" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>${layers.map((_,k)=>`<linearGradient id="sheet${k}" x2="0" y2="1"><stop stop-color="#10283c" stop-opacity=".65"/><stop offset=".7" stop-color="#031324" stop-opacity=".2"/><stop offset="1" stop-color="#031324" stop-opacity="0"/></linearGradient><mask id="travel${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="440"><rect class="sweep s${k}" width="440" height="440" fill="url(#beam)"/></mask>`).join('')}<linearGradient id="fade" x2="0" y2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".17" stop-color="white"/><stop offset=".73" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="edge"><path fill="url(#fade)" d="M0 0H1600V440H0Z"/></mask></defs><g mask="url(#edge)">${out.join('')}</g></svg>`;
writeFileSync('public/terrain-surface.svg',svg);console.log(`${svg.length} bytes`);
