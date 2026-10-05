import Link from "next/link";
import { getFeaturedTestimonial } from "@/lib/site-content";
import { TreeMotion } from "@/components/TreeMotion";
import { Landscape } from "@/components/Landscape";
import styles from "./home.module.css";

function IdeaIcon({ kind }: { kind: "clarity" | "structure" | "growth" }) {
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    {kind === "clarity" ? <><circle cx="19" cy="21" r="11"/><circle cx="19" cy="21" r="5"/><path d="m19 21 13-14m-7 0h7v7"/></> : kind === "structure" ? <><path d="m6 14 14-7 14 7-14 7-14-7Zm0 7 14 7 14-7M6 28l14 7 14-7"/></> : <><path d="M8 32V22h5v10M18 32V15h5v17M28 32V7h5v25"/></>}
  </svg>;
}

export default async function HomePage() {
  const testimonial = await getFeaturedTestimonial();
  return <div className={styles.world} data-home-landscape>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>From structure to growth</p>
          <h1 id="home-title">Build the system.<br/><em>Then let it grow.</em></h1>
          <p className={styles.lead}>Practical AI systems for real businesses.<br/>Less chaos. More clarity. Lasting growth.</p>
          <Link className={styles.primary} href="/start-here">Start here <span aria-hidden="true">↗</span></Link>
        </div>
        <figure className={styles.tree}>
          <img src="/trconcept-growth-tree.png" width="1536" height="1024" fetchPriority="high" alt="A luminous growth tree: Business at the roots, connected to Brain, Heart, Skills and Workflow."/>
          <TreeMotion/>
          <figcaption className={styles.srOnly}>Structure becomes capability. Capability creates outcomes and growth.</figcaption>
        </figure>
      </div>
      <Landscape id="hero-terrain"/>
    </section>

    <section className={styles.approach} aria-labelledby="approach-title">
      <div className={`${styles.shell} ${styles.approachGrid}`}>
        <div><p className={styles.eyebrow}>The TRConcept approach</p><h2 id="approach-title">Practical AI for<br/>real businesses.</h2><p>Structure the work first. Add AI where it genuinely helps. Build only what the business needs.</p><Link className={styles.textLink} href="/about">Explore the approach <span>↗</span></Link></div>
        <div className={styles.pillars}>
          <article><IdeaIcon kind="clarity"/><h3>Clarity</h3><p>Get clear on what matters and what to do next.</p></article>
          <article><IdeaIcon kind="structure"/><h3>Structure</h3><p>Design a system that fits your business.</p></article>
          <article><IdeaIcon kind="growth"/><h3>Growth</h3><p>Turn useful ideas into repeatable action.</p></article>
        </div>
      </div>
      <Landscape id="approach-terrain" quiet reverse/>
    </section>

    <section className={styles.learn} aria-labelledby="learn-title">
      <div className={styles.shell}>
        <header className={styles.sectionHead}><div><p className={styles.eyebrow}>Learn · a practical pathway</p><h2 id="learn-title">One real job.<br/>Then the wider system.</h2></div><p>Start with the work in front of you. Build the wider architecture when the business needs it.</p></header>
        <div className={styles.learningJourney}>
          <div className={styles.foundation}>
            <span className={styles.step}>01 <small>THE FOUNDATION</small></span>
            <p className={styles.courseLabel}>Level 1 · AI for Real Work</p>
            <h3>Teach AI how to do<br/><em>one job well.</em></h3>
            <p className={styles.flow}>Task <span>→</span> Context <span>→</span> Skill Set <span>→</span> AI Assistant</p>
            <Link className={styles.textLink} href="/learn/level-1">Explore Level 1 <span>↗</span></Link>
          </div>
          <div className={styles.progression} aria-hidden="true"><span>Build on your foundation</span><svg viewBox="0 0 180 90" fill="none"><path d="M0 70C55 70 65 20 170 20m-10-7 10 7-10 7"/></svg></div>
          <div className={styles.architecture}>
            <span className={styles.step}>02 <small>THE BUSINESS ARCHITECTURE</small></span>
            <p className={styles.courseLabel}>Level 2 · AI for Business Builder</p>
            <h3>Connect the work.<br/><em>Build what fits.</em></h3>
            <p>Bring knowledge, skills and workflows together around your business.</p>
            <Link className={styles.textLink} href="/learn/level-2">Explore Level 2 <span>↗</span></Link>
          </div>
        </div>
        <p className={styles.principle}>AI-First <span>≠</span> AI-Everything.</p>
      </div>
      <Landscape id="learn-terrain"/>
    </section>

    <section className={styles.community} aria-labelledby="community-title">
      <div className={`${styles.shell} ${styles.communityGrid}`}>
        <div><p className={styles.eyebrow}>Community · Learn. Share. Grow.</p><h2 id="community-title">Real conversations.<br/><em>Real work.</em></h2><p>Practical online sessions for exploring how AI fits into work and business — without pretending every problem needs more technology.</p><Link className={styles.primary} href="/community">Reserve a seat <span aria-hidden="true">↗</span></Link></div>
        <ol className={styles.conversation}><li><span>01</span>Bring a real question.</li><li><span>02</span>Explore what fits.</li><li><span>03</span>Leave with a next step.</li></ol>
      </div>
    </section>

    <section className={styles.paths} aria-labelledby="paths-title">
      <Landscape id="paths-terrain" quiet reverse/>
      <div className={styles.shell}>
        <p className={styles.eyebrow}>More ways to work together</p><h2 id="paths-title">Need a clearer next move?</h2>
        <div className={styles.services}>
          <article><span className={styles.courseLabel}>SOLVE / 1:1</span><h3>Untangle the<br/>business problem.</h3><p>Business problem first. AI second.</p><Link className={styles.textLink} href="/solve">Explore consulting <span>↗</span></Link></article>
          <article><span className={styles.courseLabel}>BUILD / DIGITAL EXPERIENCES</span><h3>Turn clarity into<br/>a focused website.</h3><p>Business → customer → offer → journey → page.</p><Link className={styles.textLink} href="/build">Explore Build <span>↗</span></Link></article>
        </div>
      </div>
    </section>

    {testimonial ? <section className={`${styles.shell} ${styles.proof}`} aria-label="An approved client story"><p className={styles.eyebrow}>From ideas to impact</p><blockquote>“{testimonial.quote}”<footer>{testimonial.displayName}{testimonial.businessName ? ` · ${testimonial.businessName}` : ""}</footer></blockquote><Link className={styles.textLink} href="/work">See the work <span>↗</span></Link></section> : null}

    <section className={styles.next} aria-labelledby="next-title"><Landscape id="closing-terrain"/><div className={styles.shell}><p className={styles.eyebrow}>Your next step</p><h2 id="next-title">Start with what matters.</h2><Link className={styles.primary} href="/start-here">Find your starting point <span aria-hidden="true">↗</span></Link></div></section>
  </div>;
}
