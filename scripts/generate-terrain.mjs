/** Reproducible projected height field. No raster reference or screenshot is embedded. */
import { writeFileSync } from 'node:fs';
const W=1600,H=440,NX=240,NZ=90;
const gauss=(x,z,cx,cz,sx,sz,a)=>a*Math.exp(-(((x-cx)/sx)**2+((z-cz)/sz)**2));
const height=(x,z)=>gauss(x,z,220,150,260,105,115)+gauss(x,z,890,205,300,110,130)+gauss(x,z,1450,95,300,105,105)+gauss(x,z,520,420,310,100,145)+gauss(x,z,1310,440,330,120,135)+12*Math.sin(x/160+z/150);
const point=(i,j)=>{const z=j/NZ*600,x=-180+i/NX*1960;const h=height(x,z);return {x:800+(x-800)*(.78+z/1800),y:90+z*.55-h,h,z,wx:x};};
const p=Array.from({length:NZ+1},(_,j)=>Array.from({length:NX+1},(_,i)=>point(i,j)));
const xy=a=>`${a.x.toFixed(1)},${a.y.toFixed(1)}`;
// Draw polygons back-to-front rather than colour buckets: surface hides rear slopes.
const surfaces=[];
for(let j=0;j<NZ;j++){
 const row=[];for(let i=0;i<=NX;i++)row.push(p[j][i]);
 const shade=8+Math.round(j/NZ*3);
 surfaces.push(`<path d="M${row.map(xy).join('L')}L1900,480H-300Z" fill="rgb(${4+shade/3|0},${14+shade|0},${28+shade*1.3|0})"/>`);
 const faces=Array.from({length:12},()=>[]);
 for(let i=0;i<NX;i++){
  const a=p[j][i],b=p[j][i+1],c=p[j+1][i+1],d=p[j+1][i];
  const dx=(height(a.wx+3,a.z)-height(a.wx-3,a.z))/6,dz=(height(a.wx,a.z+3)-height(a.wx,a.z-3))/6;
  const light=Math.max(0,Math.min(1,.42-dx*.4-dz*.42));
  faces[Math.min(11,Math.floor(light*12))].push(`M${xy(a)}L${xy(b)} ${xy(c)} ${xy(d)}Z`);
 }
 faces.forEach((paths,k)=>surfaces.push(`<path d="${paths.join('')}" fill="rgb(${5+k},${17+k*1.5|0},${31+k*2|0})"/>`));
 // Row visibility is preserved by interleaving all points with the next surface.
 const colors=Array.from({length:6},()=>[]); const sparks=[];
 for(let i=0;i<NX;i++){
  const a=p[j][i],dx=(height(a.wx+3,a.z)-height(a.wx-3,a.z))/6,dz=(height(a.wx,a.z+3)-height(a.wx,a.z-3))/6;
  const light=Math.max(0,Math.min(1,.48-dx*.48-dz*.48));
  const hash=Math.abs(Math.sin(i*127.1+j*311.7)*43758.5453)%1;
  const index=Math.min(5,Math.floor(light*6));
  const dot=`M${(a.x+hash*.8).toFixed(1)},${a.y.toFixed(1)}h.1`; colors[index].push(dot);
  if(light>.65 && hash>.55 && Math.sin(a.wx/190+a.z/130)>.2) sparks.push(dot);
 }
 colors.forEach((paths,k)=>surfaces.push(`<path d="${paths.join('')}" fill="none" stroke="${['#24354b','#38485c','#586374','#8a8b88','#c1ad80','#e1c896'][k]}" stroke-width="${(.65+j/NZ*.9).toFixed(2)}" stroke-linecap="round" opacity="${(.28+k*.12).toFixed(2)}"/>`));
 surfaces.push(`<path class="glint" style="animation-delay:${(-j*.07).toFixed(2)}s" d="${sparks.join('')}" fill="none" stroke="#f4d391" stroke-width="1.2" stroke-linecap="round"/>`);
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><style>.glint{opacity:0;animation:light 18s ease-in-out infinite}@keyframes light{0%,35%,78%,100%{opacity:0}53%{opacity:.7}63%{opacity:.2}}@media(prefers-reduced-motion:reduce){.glint{animation:none}}</style><defs><linearGradient id="fade" x2="0" y2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".13" stop-color="white"/><stop offset=".68" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="edge"><path fill="url(#fade)" d="M0 0H1600V440H0Z"/></mask></defs><g mask="url(#edge)">${surfaces.join('')}</g></svg>`;
writeFileSync('public/terrain-surface.svg',svg);
console.log(`${svg.length} bytes`);
