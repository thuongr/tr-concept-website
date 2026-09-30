import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Learn" };

export default function Page(){
  return <main className="learn-landing">
    <section className="learn-intro">
      <div className="shell learn-intro-grid">
        <div>
          <p className="eyebrow">LEARN · PRACTICAL AI FOR REAL WORK</p>
          <h1>Build the way<br/><em>you work with AI.</em></h1>
          <p className="learn-short">Start small. Build structure. Go deeper when the business needs it.</p>
        </div>
        <div className="learn-mark" aria-hidden="true"><span>TR</span><b>LEARN</b></div>
      </div>
    </section>

    <section className="learn-options">
      <div className="shell">
        <div className="learn-route-line"><span>START</span><i></i><span>BUILD</span><i></i><span>SYSTEM</span></div>
        <div className="learn-option-grid">
          <Link href="/learn/level-1" className="learn-option level-one">
            <span>LEVEL 1 · START HERE</span>
            <h2>AI for<br/>Real Work</h2>
            <p>Teach AI how to do one job well.</p>
            <footer><strong>A$150</strong><i>Start Level 1 →</i></footer>
          </Link>
          <Link href="/learn/level-2" className="learn-option level-two">
            <span>LEVEL 2 · BUILD THE SYSTEM</span>
            <h2>AI for<br/>Business Builder</h2>
            <p>Design how AI fits across your business.</p>
            <footer><strong>A$450</strong><i>Explore Level 2 →</i></footer>
          </Link>
        </div>
        <p className="learn-footnote-simple">You don’t need to choose between two similar courses. Level 1 builds the foundation; Level 2 expands the architecture.</p>
      </div>
    </section>
  </main>
}