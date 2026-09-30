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
        <div className="growth-stage growth-stage-organic" aria-label="TRConcept AI growth system">
  <div className="growth-copy"><span>STRUCTURE → CAPABILITY → OUTCOME</span><strong>Build the system.<br/>Then let it grow.</strong></div>
  <svg className="organic-tree" viewBox="0 0 720 760" role="img" aria-label="A growing business system">
    <g className="roots"><path d="M360 650 C320 684 270 692 205 720"/><path d="M360 650 C398 686 454 700 530 728"/><path d="M360 650 C350 696 342 718 335 748"/><path d="M360 650 C300 668 248 665 168 686"/><path d="M360 650 C425 664 484 662 566 686"/></g>
    <g className="tree-lines"><path className="trunk-line" d="M360 650 C345 575 366 510 350 438 C338 380 348 320 365 250 C374 210 372 172 370 128"/><path d="M351 456 C310 418 270 382 210 350 C180 334 160 306 146 275"/><path d="M354 390 C398 354 432 310 470 260 C492 230 510 198 520 162"/><path d="M348 515 C405 490 456 452 510 410 C536 390 560 362 580 330"/><path d="M356 330 C320 294 294 250 280 205"/><path d="M367 250 C405 224 438 198 458 164"/></g>
    <g className="leaves"><path d="M225 360 C185 330 175 296 188 274 C220 286 240 312 225 360Z"/><path d="M286 405 C252 376 248 344 262 326 C292 342 305 370 286 405Z"/><path d="M425 335 C454 300 485 294 505 306 C494 337 468 352 425 335Z"/><path d="M485 432 C516 399 548 398 568 412 C552 443 525 453 485 432Z"/><path d="M305 260 C276 230 273 199 286 181 C316 196 326 223 305 260Z"/><path d="M438 216 C463 181 494 173 514 183 C506 216 481 233 438 216Z"/></g>
    <g className="blooms"><g transform="translate(145 270)"><circle r="5"/><path d="M0-7 C-12-22-20-9-8 1 C-20 9-8 20 1 8 C10 20 22 9 9 0 C20-10 10-21 0-7Z"/></g><g transform="translate(520 158)"><circle r="5"/><path d="M0-7 C-12-22-20-9-8 1 C-20 9-8 20 1 8 C10 20 22 9 9 0 C20-10 10-21 0-7Z"/></g><g transform="translate(582 327)"><circle r="5"/><path d="M0-7 C-12-22-20-9-8 1 C-20 9-8 20 1 8 C10 20 22 9 9 0 C20-10 10-21 0-7Z"/></g><g transform="translate(280 202)"><circle r="4"/><path d="M0-6 C-10-18-18-8-7 1 C-18 8-7 17 1 7 C9 17 19 8 8 0 C18-9 9-18 0-6Z"/></g></g>
  </svg>
  <div className="organic-label label-brain"><b>BRAIN</b><span>knowledge · context · data</span></div>
  <div className="organic-label label-skills"><b>SKILLS</b><span>knowledge → capability</span></div>
  <div className="organic-label label-heart"><b>HEART</b><span>voice · principles · ways of working</span></div>
  <div className="organic-label label-flow"><b>WORKFLOW</b><span>connect · automate · flow</span></div>
  <div className="organic-label label-business"><b>BUSINESS</b><span>the foundation</span></div>
  <div className="growth-outcome"><span>BLOOM</span><b>Useful AI is an outcome of good structure.</b></div>
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
