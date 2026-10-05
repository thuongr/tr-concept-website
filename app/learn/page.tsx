import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
export const metadata: Metadata = { title: "Learn" };

export default function Page() {
  return <>
    <PageHero eyebrow="Learn · Practical AI for real work" title="Build the way you work with AI." body="Start small. Build structure. Go deeper when the business needs it."/>
    <section className="content-section">
      <div className="shell">
        <div className="learn-steps">
          <article className="learn-stage">
            <p className="stage-number">01</p>
            <p className="eyebrow">Level 1 · Start here</p>
            <h2>AI for <em>Real Work</em></h2>
            <p>Teach AI how to do one job well.</p>
            <footer><strong>A$150</strong><Link className="text-link" href="/learn/level-1">Start Level 1 ↗</Link></footer>
          </article>
          <div className="learn-connection" aria-hidden="true"><svg viewBox="0 0 180 100"><path d="M5 12C65 12 70 87 170 87m-10-7 10 7-10 7"/></svg></div>
          <article className="learn-stage">
            <p className="stage-number">02</p>
            <p className="eyebrow">Level 2 · Build the system</p>
            <h2>AI for <em>Business Builder</em></h2>
            <p>Design how AI fits across your business.</p>
            <footer><strong>A$450</strong><Link className="text-link" href="/learn/level-2">Explore Level 2 ↗</Link></footer>
          </article>
        </div>
        <p className="learn-footnote-simple">Level 1 builds the foundation; Level 2 expands the architecture.</p>
      </div>
    </section>
  </>;
}
