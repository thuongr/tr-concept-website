import Link from "next/link";
export function PageHero({eyebrow,title,body,primary,primaryHref,meta}:{eyebrow:string;title:string;body:string;primary?:string;primaryHref?:string;meta?:string}) {
  return <section className="page-hero"><div className="shell narrow"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lead">{body}</p>{meta&&<p className="meta-line">{meta}</p>}{primary&&primaryHref&&<p><Link className="button button-yellow" href={primaryHref}>{primary} →</Link></p>}</div></section>
}
