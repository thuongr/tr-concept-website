import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Learn" };

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Learn · Practical AI for real work"
        title="Start with one job. Then design the bigger system."
        body="Two learning paths, built for different stages. Level 1 helps you structure AI for one real job. Level 2 helps you design how AI should fit across a business."
        primary="Compare the two levels"
        primaryHref="#paths"
      />
      <section id="paths" className="content-section">
        <div className="shell narrow prose">
          <p className="eyebrow">Choose by the problem you are solving</p>
          <h2>You do not need the most advanced course. You need the right next step.</h2>
          <div className="learn-paths">
            <article>
              <span className="tag">Level 1</span>
              <p className="path-kicker">One job · Individual work</p>
              <h3>AI for Real Work</h3>
              <p>For people who want clearer, more reusable AI work instead of starting from scratch every time.</p>
              <strong>A$150</strong>
              <Link className="button button-orange" href="/learn/level-1">Explore Level 1 →</Link>
            </article>
            <article className="learn-path-dark">
              <span className="tag">Level 2</span>
              <p className="path-kicker">Whole business · Architecture</p>
              <h3>AI for Business Builder</h3>
              <p>For business owners ready to decide what AI should know, do, connect and leave human.</p>
              <strong>A$450</strong>
              <Link className="button button-orange" href="/learn/level-2">Explore Level 2 →</Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
