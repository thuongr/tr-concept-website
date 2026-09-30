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
        <div className="growth-stage growth-v6" aria-label="TRConcept AI growth system">
  <div className="growth-copy"><span>STRUCTURE → CAPABILITY → OUTCOME</span><strong>Build the system.<br/>Then let it grow.</strong></div>
  <div className="botanical-art" aria-hidden="true">
    <svg viewBox="0 0 700 820">
      <defs><filter id="warmGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g className="v6-roots"><path d="M350 675C302 700 240 700 150 752M350 675C405 703 478 716 578 760M350 675C340 720 335 755 330 800M350 675C275 684 208 678 108 716M350 675C430 684 510 680 640 722M350 675C298 731 265 758 215 795M350 675C411 730 450 760 505 798"/></g>
      <g className="v6-tree"><path className="v6-trunk" d="M350 675C330 600 360 535 342 465C325 397 335 330 362 250C378 204 380 162 376 112"/><path d="M343 480C304 435 256 395 192 358C160 339 137 307 122 270"/><path d="M346 414C397 370 438 315 480 258C505 225 525 188 538 145"/><path d="M340 548C405 515 468 470 536 416C565 393 592 360 616 320"/><path d="M352 344C315 305 286 255 270 198"/><path d="M365 258C407 228 444 194 470 145"/><path d="M340 458C389 438 423 402 453 360"/></g>
      <g className="v6-leaves"><path d="M201 372C158 338 150 300 166 276C202 290 223 321 201 372Z"/><path d="M280 430C244 397 241 360 257 338C291 354 304 387 280 430Z"/><path d="M426 348C458 308 495 300 518 313C504 350 474 367 426 348Z"/><path d="M505 450C541 411 578 409 600 425C581 462 550 472 505 450Z"/><path d="M298 270C265 237 263 200 279 178C313 195 325 228 298 270Z"/><path d="M449 220C478 180 514 171 538 183C528 221 498 241 449 220Z"/><path d="M391 432C419 398 449 392 469 404C457 436 432 452 391 432Z"/></g>
      <g className="v6-flowers"><g transform="translate(122 270)"><path d="M0-7C-15-26-26-11-10 2C-25 12-10 26 2 10C13 26 28 12 11 0C25-13 12-26 0-7Z"/><circle r="3"/></g><g transform="translate(538 145)"><path d="M0-7C-15-26-26-11-10 2C-25 12-10 26 2 10C13 26 28 12 11 0C25-13 12-26 0-7Z"/><circle r="3"/></g><g transform="translate(616 320)"><path d="M0-7C-15-26-26-11-10 2C-25 12-10 26 2 10C13 26 28 12 11 0C25-13 12-26 0-7Z"/><circle r="3"/></g><g transform="translate(270 198)"><path d="M0-6C-12-21-22-9-8 1C-21 10-8 21 1 8C11 21 23 10 9 0C21-11 10-21 0-6Z"/><circle r="3"/></g></g>
      <g className="v6-energy" filter="url(#warmGlow)"><circle cx="350" cy="650" r="3"/><circle cx="343" cy="480" r="3"/><circle cx="365" cy="258" r="3"/><circle cx="536" cy="416" r="3"/><circle cx="192" cy="358" r="3"/></g>
    </svg>
  </div>
  <div className="v6-node n-brain"><i>◉</i><b>BRAIN</b><span>Your knowledge,<br/>context and data.</span></div>
  <div className="v6-node n-skills"><i>◇</i><b>SKILLS</b><span>Turn knowledge<br/>into real capability.</span></div>
  <div className="v6-node n-heart"><i>♡</i><b>HEART</b><span>Your voice, principles<br/>and ways of working.</span></div>
  <div className="v6-node n-flow"><i>⚙</i><b>WORKFLOW</b><span>Connect, automate<br/>and make it flow.</span></div>
  <div className="v6-business"><b>BUSINESS</b><span>A clear foundation<br/>for sustainable growth.</span></div>
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
