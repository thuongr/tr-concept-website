import Link from "next/link";
import { getBusinessSettings, getFeaturedTestimonial, getHomeHeroContent } from "@/lib/site-content";

function EnergyWave({ quiet = false }: { quiet?: boolean }) {
  return <div className={quiet ? "energy-wave quiet" : "energy-wave"} aria-hidden="true">
    <svg viewBox="0 0 1440 190" preserveAspectRatio="none">
      <defs><linearGradient id="energyGold" x1="0" x2="1"><stop offset="0" stopColor="#f98513" stopOpacity=".08"/><stop offset=".45" stopColor="#ffd28b"/><stop offset=".7" stopColor="#f98513"/><stop offset="1" stopColor="#f98513" stopOpacity=".08"/></linearGradient></defs>
      <path className="terrain t1" d="M-80 125 C90 72 205 162 365 112 C530 60 625 154 790 102 C965 48 1060 145 1215 98 C1330 63 1430 91 1520 65"/>
      <path className="terrain t2" d="M-90 146 C75 101 205 178 370 132 C535 87 650 169 805 122 C960 76 1085 163 1235 119 C1355 84 1450 111 1520 91"/>
      <path className="terrain t3" d="M-70 105 C105 48 220 139 385 90 C535 45 675 132 825 82 C985 29 1090 122 1240 78 C1360 43 1450 67 1520 48"/>
      <path className="energy-trail" pathLength="100" d="M-80 125 C90 72 205 162 365 112 C530 60 625 154 790 102 C965 48 1060 145 1215 98 C1330 63 1430 91 1520 65"/>
      <circle className="wave-runner" r="3"><animateMotion dur="8s" repeatCount="indefinite" path="M-80 125 C90 72 205 162 365 112 C530 60 625 154 790 102 C965 48 1060 145 1215 98 C1330 63 1430 91 1520 65"/></circle>
    </svg>
  </div>;
}

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
    <EnergyWave />    </section>    <section className="home-story">
      <div className="shell">
        <div className="story-intro"><p className="eyebrow">The bigger picture</p><h2>AI was never <em>just the prompt.</em></h2><p>Real results come from how you define the work, provide context, build reusable capability and connect AI to the business.</p></div>
        <div className="growth-stage growth-v7 growth-image-only" aria-label="TRConcept growth system">
  <div className="growth-copy"><span>STRUCTURE → CAPABILITY → OUTCOME</span><strong>Build the system.<br/>Then let it grow.</strong></div>
  <div className="tree-artwork tree-artwork-production" role="img" aria-label="Business roots growing into Brain, Heart, Skills and Workflow"><span className="sap s1"/><span className="sap s2"/><span className="sap s3"/><span className="sap s4"/><span className="bloom-glow b1"/><span className="bloom-glow b2"/><span className="bloom-glow b3"/><span className="bloom-glow b4"/></div>
  <div className="growth-outcome"><span>BLOOM</span><b>Useful AI is an outcome<br/>of good structure.</b></div>
</div>      </div>      <EnergyWave />    </section>    <section className="home-learn">
      <div className="shell">
        <header className="home-section-head"><div><p className="eyebrow">Learn · AI for real work</p><h2>Start with one job.<br/>Then see the system.</h2></div><p>Two practical learning paths. Small groups. Your real work — not generic AI demonstrations.</p></header>
        <div className="learning-path">
          <article className="learning-card l1"><div className="learning-no">01</div><span>LEVEL 1</span><h3>AI for<br/>Real Work</h3><div className="mini-flow"><b>Task</b><i>→</i><b>Context</b><i>→</i><b>Skills</b><i>→</i><b>Assistant</b></div><p>Teach AI how to do one real job well.</p><footer><strong>A$150</strong><Link href="/learn/level-1">Explore Level 1 →</Link></footer></article>
          <article className="learning-card l2"><div className="learning-no">02</div><span>LEVEL 2</span><h3>AI for<br/>Business Builder</h3><div className="system-dots"><b>Business</b><span>Brain</span><span>Heart</span><span>Skills</span><span>Agents</span><span>Workflow</span></div><p>Design where AI fits across your business.</p><footer><strong>A$450</strong><Link href="/learn/level-2">Explore Level 2 →</Link></footer></article>
        </div>
        <div className="learn-route"><strong>Not sure where to begin?</strong><Link href="/start-here">Find your starting point →</Link></div>      </div>      <EnergyWave quiet />    </section>    <section className="home-community">
      <div className="shell community-composition">
        <div className="community-title"><p className="eyebrow">Community · Learn. Share. Grow.</p><h2>Real conversations.<br/><em>Real work.</em></h2><p>Practical online sessions for exploring how AI fits into work and business — without pretending every problem needs more technology.</p><Link className="button community-button" href="/community">Reserve a seat →</Link></div>
        <div className="community-board"><div className="board-main"><span>TRCONCEPT AI COMMUNITY</span><strong>Bring a question.<br/>Leave with a clearer next step.</strong></div><div className="board-note n1">PRACTICAL<br/><b>not theoretical</b></div><div className="board-note n2">BUSINESS<br/><b>before tools</b></div><div className="board-note n3">HUMAN<br/><b>judgement stays</b></div></div>      </div>      <EnergyWave />    </section>    <section className="home-proof"><div className="shell proof-composition"><div><p className="eyebrow">Proof, when it is real</p><h2>From ideas<br/>to impact.</h2><p>TRConcept publishes identifiable stories only after permission is recorded.</p><Link href="/work">See the work →</Link></div>{testimonial ? <blockquote>“{testimonial.quote}”<footer>{testimonial.displayName}{testimonial.businessName ? ` · ${testimonial.businessName}` : ""}</footer></blockquote> : <div className="proof-placeholder"><span>REAL PEOPLE / REAL RESULTS</span><strong>No invented testimonials.<br/>No vanity metrics.</strong><p>Approved student and project stories will appear here as the evidence library grows.</p></div>}<EnergyWave quiet /></div></section>    <section className="home-paths"><div className="shell"><header className="home-section-head"><div><p className="eyebrow">More ways to work together</p><h2>Need a clearer next move?</h2></div><p>Different needs. Same rule: start with the business, then decide what AI or digital work is actually useful.</p></header><div className="path-panels"><Link href="/solve"><span>01 / SOLVE</span><strong>Untangle the business problem.</strong><p>1:1 AI &amp; business transformation.</p><i>→</i></Link><Link href="/build"><span>02 / BUILD</span><strong>Turn clarity into a focused digital experience.</strong><p>Business-first landing pages &amp; selected projects.</p><i>→</i></Link></div></div></section>
  </>;
}
