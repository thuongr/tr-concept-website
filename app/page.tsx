import Link from "next/link";
import { getBusinessSettings, getFeaturedTestimonial, getHomeHeroContent } from "@/lib/site-content";

export default async function HomePage() {
  const [hero, settings, testimonial] = await Promise.all([
    getHomeHeroContent(), getBusinessSettings(), getFeaturedTestimonial(),
  ]);
  return <>
    <section className="home-hero">
      <div className="shell home-hero-grid">
        <div className="home-hero-copy">
          <p className="eyebrow">Practical AI education &amp; business systems</p>
          <h1>{hero.heading === "AI works better with structure." ? <>AI works better with <em>structure.</em></> : hero.heading}</h1>
          <p className="home-hero-lead">{hero.body}</p>
          <div className="button-row"><Link className="button home-primary" href={hero.ctaUrl}>{hero.ctaLabel} →</Link><Link className="home-secondary" href="/community">Join a Community Session</Link></div>
        </div>
        <div className="home-hero-visual" aria-label="TRConcept structure model">
          <span className="visual-kicker">ONE PROMPT IS ONLY THE START</span>
          <div className="orbit orbit-a">TASK</div><div className="orbit orbit-b">CONTEXT</div><div className="orbit orbit-c">SKILLS</div>
          <div className="visual-core"><small>TRCONCEPT</small><strong>STRUCTURE</strong><span>makes AI useful</span></div>
          <div className="visual-caption">Same tools.<br/><b>A clearer way.</b></div>
        </div>
      </div>
    </section>

    <section className="home-story">
      <div className="shell">
        <div className="story-intro"><p className="eyebrow">The bigger picture</p><h2>AI was never <em>just the prompt.</em></h2><p>Real results come from how you define the work, provide context, build reusable capability and connect AI to the business.</p></div>
        <div className="growth-stage growth-stage-organic growth-v5" aria-label="TRConcept AI growth system">
  <div className="growth-copy"><span>STRUCTURE → CAPABILITY → OUTCOME</span><strong>Build the system.<br/>Then let it grow.</strong></div>
  <svg className="organic-tree" viewBox="0 0 720 820" role="img" aria-label="A growing business system">
    <g className="roots">
      <path d="M360 675 C315 704 252 710 170 752"/><path d="M360 675 C410 704 480 718 574 758"/><path d="M360 675 C350 716 340 752 334 792"/><path d="M360 675 C286 687 222 678 126 712"/><path d="M360 675 C438 687 514 682 628 720"/><path d="M360 675 C300 730 272 752 230 788"/><path d="M360 675 C420 730 452 758 492 792"/>
    </g>
    <g className="tree-lines">
      <path className="trunk-line" d="M360 675 C342 598 372 536 350 458 C333 395 346 322 370 246 C382 208 381 170 377 126"/>
      <path d="M350 475 C308 430 262 392 198 354 C166 335 144 307 130 276"/><path d="M355 403 C402 360 440 310 480 258 C504 226 523 194 534 156"/><path d="M348 540 C410 510 468 468 530 418 C558 396 584 366 605 332"/><path d="M358 337 C318 299 292 252 276 202"/><path d="M370 255 C411 226 446 198 468 158"/><path d="M349 450 C392 430 424 400 448 365"/>
    </g>
    <g className="leaves">
      <path d="M210 370 C166 337 157 300 171 277 C206 290 228 320 210 370Z"/><path d="M286 424 C250 393 246 358 261 338 C293 354 306 385 286 424Z"/><path d="M430 345 C462 307 496 300 517 313 C505 347 477 364 430 345Z"/><path d="M505 445 C539 409 574 408 595 423 C578 457 548 468 505 445Z"/><path d="M302 267 C270 235 267 201 282 181 C314 197 326 227 302 267Z"/><path d="M452 220 C480 182 514 174 536 185 C527 220 499 239 452 220Z"/><path d="M394 430 C420 399 448 394 466 405 C456 434 433 449 394 430Z"/><path d="M252 352 C230 329 228 305 239 291 C261 303 269 324 252 352Z"/>
    </g>
    <g className="blooms">
      <g transform="translate(130 275)"><circle r="3.5"/><path d="M0-8 C-13-24-22-10-9 1 C-22 10-9 22 1 9 C11 22 24 10 10 0 C22-11 11-23 0-8Z"/></g>
      <g transform="translate(534 155)"><circle r="3.5"/><path d="M0-8 C-13-24-22-10-9 1 C-22 10-9 22 1 9 C11 22 24 10 10 0 C22-11 11-23 0-8Z"/></g>
      <g transform="translate(605 330)"><circle r="3.5"/><path d="M0-8 C-13-24-22-10-9 1 C-22 10-9 22 1 9 C11 22 24 10 10 0 C22-11 11-23 0-8Z"/></g>
      <g transform="translate(276 200)"><circle r="3"/><path d="M0-7 C-11-20-19-9-8 1 C-19 9-8 19 1 8 C10 19 21 9 9 0 C20-10 10-20 0-7Z"/></g>
      <g transform="translate(468 157)"><circle r="3"/><path d="M0-7 C-11-20-19-9-8 1 C-19 9-8 19 1 8 C10 19 21 9 9 0 C20-10 10-20 0-7Z"/></g>
    </g>
    <g className="energy"><circle cx="360" cy="650" r="4"/><circle cx="351" cy="475" r="3"/><circle cx="370" cy="255" r="3"/><circle cx="530" cy="418" r="3"/></g>
  </svg>
  <div className="system-node node-brain"><i>◎</i><b>BRAIN</b><span>Your knowledge,<br/>context and data.</span></div>
  <div className="system-node node-skills"><i>◇</i><b>SKILLS</b><span>Turn knowledge<br/>into real capability.</span></div>
  <div className="system-node node-heart"><i>♡</i><b>HEART</b><span>Your voice, principles<br/>and ways of working.</span></div>
  <div className="system-node node-flow"><i>⚙</i><b>WORKFLOW</b><span>Connect, automate<br/>and make it flow.</span></div>
  <div className="business-root"><b>BUSINESS</b><span>A clear foundation<br/>for sustainable growth.</span></div>
  <div className="growth-outcome"><span>BLOOM</span><b>Useful AI is an outcome<br/>of good structure.</b></div>
</div>
      </div>
    </section>

    <section className="home-learn">
      <div className="shell">
        <header className="home-section-head"><div><p className="eyebrow">Learn · AI for real work</p><h2>Start with one job.<br/>Then see the system.</h2></div><p>Two practical learning paths. Small groups. Your real work — not generic AI demonstrations.</p></header>
        <div className="learning-path">
          <article className="learning-card l1"><div className="learning-no">01</div><span>LEVEL 1</span><h3>AI for<br/>Real Work</h3><div className="mini-flow"><b>Task</b><i>→</i><b>Context</b><i>→</i><b>Skills</b><i>→</i><b>Assistant</b></div><p>Teach AI how to do one real job well.</p><footer><strong>A$150</strong><Link href="/learn/level-1">Explore Level 1 →</Link></footer></article>
          <article className="learning-card l2"><div className="learning-no">02</div><span>LEVEL 2</span><h3>AI for<br/>Business Builder</h3><div className="system-dots"><b>Business</b><span>Brain</span><span>Heart</span><span>Skills</span><span>Agents</span><span>Workflow</span></div><p>Design where AI fits across your business.</p><footer><strong>A$450</strong><Link href="/learn/level-2">Explore Level 2 →</Link></footer></article>
        </div>
        <div className="learn-route"><strong>Not sure where to begin?</strong><Link href="/start-here">Find your starting point →</Link></div>
      </div>
    </section>

    <section className="home-community">
      <div className="shell community-composition">
        <div className="community-title"><p className="eyebrow">Community · Learn. Share. Grow.</p><h2>Real conversations.<br/><em>Real work.</em></h2><p>Practical online sessions for exploring how AI fits into work and business — without pretending every problem needs more technology.</p><Link className="button community-button" href="/community">Reserve a seat →</Link></div>
        <div className="community-board"><div className="board-main"><span>TRCONCEPT AI COMMUNITY</span><strong>Bring a question.<br/>Leave with a clearer next step.</strong></div><div className="board-note n1">PRACTICAL<br/><b>not theoretical</b></div><div className="board-note n2">BUSINESS<br/><b>before tools</b></div><div className="board-note n3">HUMAN<br/><b>judgement stays</b></div></div>
      </div>
    </section>

    <section className="home-proof"><div className="shell proof-composition"><div><p className="eyebrow">Proof, when it is real</p><h2>From ideas<br/>to impact.</h2><p>TRConcept publishes identifiable stories only after permission is recorded.</p><Link href="/work">See the work →</Link></div>{testimonial ? <blockquote>“{testimonial.quote}”<footer>{testimonial.displayName}{testimonial.businessName ? ` · ${testimonial.businessName}` : ""}</footer></blockquote> : <div className="proof-placeholder"><span>REAL PEOPLE / REAL RESULTS</span><strong>No invented testimonials.<br/>No vanity metrics.</strong><p>Approved student and project stories will appear here as the evidence library grows.</p></div>}</div></section>

    <section className="home-paths"><div className="shell"><header className="home-section-head"><div><p className="eyebrow">More ways to work together</p><h2>Need a clearer next move?</h2></div><p>Different needs. Same rule: start with the business, then decide what AI or digital work is actually useful.</p></header><div className="path-panels"><Link href="/solve"><span>01 / SOLVE</span><strong>Untangle the business problem.</strong><p>1:1 AI &amp; business transformation.</p><i>→</i></Link><Link href="/build"><span>02 / BUILD</span><strong>Turn clarity into a focused digital experience.</strong><p>Business-first landing pages &amp; selected projects.</p><i>→</i></Link></div></div></section>
  </>;
}
