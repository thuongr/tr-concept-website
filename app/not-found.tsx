import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <p className="eyebrow">404</p>
        <h1>This page isn’t here.</h1>
        <p className="page-lead">
          The structure changed, or the link may be old.
        </p>
        <Link className="button button-yellow" href="/">
          Back to TRConcept →
        </Link>
      </div>
    </section>
  );
}
