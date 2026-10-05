import Link from "next/link";
import { Landscape } from "@/components/Landscape";

export function PageHero({ eyebrow, title, body, primary, primaryHref, meta }: {
  eyebrow: string; title: string; body: string; primary?: string; primaryHref?: string; meta?: string;
}) {
  return <section className="page-hero">
    <div className="shell">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-lead">{body}</p>
      {meta ? <p className="meta-line">{meta}</p> : null}
      {primary && primaryHref ? <p className="hero-action"><Link className="button button-yellow" href={primaryHref}>{primary} <span aria-hidden="true">↗</span></Link></p> : null}
    </div>
    <div className="page-terrain" aria-hidden="true"><Landscape id="subpage-hero" quiet reverse/></div>
  </section>;
}
