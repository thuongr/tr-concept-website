import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Learn" };
export default function Page(){return <main className="learn-landing">
<section className="learn-intro"><div className="shell learn-intro-grid"><div><p className="eyebrow">Learn · Practical AI for real work</p><h1>Learn AI by <em>building how you work.</em></h1><p className="learn-short">Start practical. Build structure. Go deeper when your work or business needs it.</p></div><div className="learn-mark" aria-hidden="true"><span>TR</span><b>LEARN</b></div></div></section>
<section className="learn-options"><div className="shell"><div className="learn-option-grid">
<Link href="/learn/level-1" className="learn-option level-one"><span>LEVEL 1</span><h2>AI for<br/>Real Work</h2><p>Teach AI how to do one job well.</p><footer><strong>A$150</strong><i>Explore →</i></footer></Link>
<Link href="/learn/level-2" className="learn-option level-two"><span>LEVEL 2</span><h2>AI for<br/>Business Builder</h2><p>Design how AI fits across your business.</p><footer><strong>A$450</strong><i>Explore →</i></footer></Link>
</div><div className="learn-footnote"><span>Not sure where to start?</span><Link href="/start-here">Start here →</Link></div></div></section>
</main>}