import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Learn" };
export default function Page(){return <main className="learn-landing">
<section className="learn-intro"><div className="shell learn-intro-grid"><div><p className="eyebrow">Learn · Practical AI for real work</p><h1>Learn AI by <em>building how you work.</em></h1><p className="learn-short">Start with real work. Build structure as you go.</p></div><div className="learn-mark" aria-hidden="true"><span>TR</span><b>LEARN</b></div></div></section>
<section className="learn-options"><div className="shell"><p className="learn-choice-label">Choose where you are now</p><div className="learn-option-grid">
<Link href="/learn/level-1" className="learn-option level-one"><span>LEVEL 1 · START HERE</span><h2>AI for<br/>Real Work</h2><p>Make AI useful for the work already on your desk.</p><footer><strong>A$150</strong><i>Explore →</i></footer></Link>
<Link href="/learn/level-2" className="learn-option level-two"><span>LEVEL 2 · GO DEEPER</span><h2>AI for<br/>Business Builder</h2><p>Design how AI fits across the way your business works.</p><footer><strong>A$450</strong><i>Explore →</i></footer></Link>
</div><div className="learn-footnote"><span>New to TRConcept?</span><Link href="/learn/level-1">Start with Level 1 →</Link></div></div></section>
</main>}