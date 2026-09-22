import Link from "next/link";
import { ArchitectureReveal } from "@/components/ArchitectureReveal";

export default function HomePage() {
  const heroImage=process.env.NEXT_PUBLIC_HERO_IMAGE_URL;
  return <>
    <section className="hero"><div className="shell hero-grid">
      <div className="hero-copy"><p className="eyebrow">Practical AI education & business systems</p><h1>AI works better with <mark>structure.</mark></h1><p className="hero-lead">TRConcept helps business owners and professionals understand how to structure, design and apply AI in real work — so you can work smarter, build faster and focus on what matters.</p><div className="button-row"><Link className="button button-dark" href="/learn/level-1">Explore courses →</Link><Link className="text-link" href="/community">Join a Community Session</Link></div><p className="hand-note">Same tools. <span>A clearer way.</span></p></div>
      <div className={heroImage?"hero-photo has-photo":"hero-photo"}>{heroImage?<img src={heroImage} alt="Thương Rejeehan, founder of TRConcept"/>:<div className="photo-fallback"><span>REAL FOUNDER PHOTO</span><strong>Replaceable image slot</strong><p>Open posture · editorial crop · real identity</p></div>}<div className="hero-annotation">Ideas<br/>Structure<br/>Systems<br/><strong>Real results</strong></div></div>
    </div></section>

    <section className="section section-architecture"><div className="shell section-grid"><div className="section-number">01</div><div className="section-copy"><p className="eyebrow">From prompt to possibility</p><h2>AI was never <mark>just the prompt.</mark></h2><p>AI tools can be powerful, but real results come from structure — how you define the work, provide context, design reusable skills and connect it to your business.</p><Link className="text-link" href="/learn/level-1">See the bigger picture →</Link></div><ArchitectureReveal/></div></section>

    <section className="section"><div className="shell section-grid"><div className="section-number">02</div><div className="section-copy"><p className="eyebrow">Learn · AI for real work</p><h2>Practical AI courses for real work.</h2><p>Small-group learning for business owners and professionals who want more clarity, confidence and structure.</p></div><div className="course-cards">
      <article className="course-card"><span className="tag">Level 1</span><h3>AI for Real Work</h3><p>Learn the fundamentals and teach AI how to do one real job well.</p><div className="card-bottom"><strong>A$150</strong><Link href="/learn/level-1">Explore Level 1 →</Link></div></article>
      <article className="course-card course-card-blue"><span className="tag">Level 2</span><h3>AI for Business Builder</h3><p>Take a more structured approach to applying AI across your business.</p><div className="card-bottom"><strong>A$450</strong><Link href="/learn/level-2">Explore Level 2 →</Link></div></article>
      <aside className="course-manifesto">Small classes.<br/>Real progress.<br/><strong>A bigger future.</strong></aside>
    </div></div></section>

    <section className="section community-band"><div className="shell section-grid"><div className="section-number">03</div><div className="section-copy"><p className="eyebrow">Community · Learn. Share. Grow.</p><h2>TRConcept AI Community Sessions</h2><p>Practical online conversations for exploring how AI fits into real work and business.</p><Link className="button button-yellow" href="/community">Reserve a seat →</Link></div><div className="community-points"><div><strong>Real conversations</strong><span>Practical topics, real questions</span></div><div><strong>New perspectives</strong><span>Learn from people building real businesses</span></div><div><strong>Next steps</strong><span>Find the path that fits you</span></div></div></div></section>

    <section className="section"><div className="shell section-grid"><div className="section-number">04</div><div className="section-copy"><p className="eyebrow">Real people · Real results</p><h2>From ideas to impact.</h2><p>Stories from students, founders and community projects putting AI to work.</p><Link className="text-link" href="/work">See more stories →</Link></div><blockquote className="story-quote">“The course gave me a clearer structure and finally made AI feel practical for my business.”<footer>Student story · published with permission</footer></blockquote></div></section>

    <section className="section"><div className="shell section-grid"><div className="section-number">05</div><div className="section-copy"><p className="eyebrow">More ways to work together</p><h2>Solve or Build. Same purpose.</h2><p>Different needs. A shared goal — helping you make AI work for what matters most.</p></div><div className="pathway-grid"><article><h3>Solve</h3><p>1:1 consulting for AI transformation and business systems.</p><Link href="/solve">Learn more →</Link></article><article><h3>Build</h3><p>Focused landing pages and selected digital projects for small businesses.</p><Link href="/build">Learn more →</Link></article></div></div></section>
  </>;
}
