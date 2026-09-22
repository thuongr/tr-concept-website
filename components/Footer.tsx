import Link from "next/link";

export function Footer() {
  return <footer className="site-footer"><div className="shell footer-grid">
    <div><div className="footer-brand">TRConcept</div><p className="footer-line">Evolve your business through practical AI & digital transformation.</p></div>
    <div className="footer-links"><Link href="/learn/level-1">Learn</Link><Link href="/community">Community</Link><Link href="/solve">Solve</Link><Link href="/build">Build</Link><Link href="/work">Work</Link><Link href="/about">About</Link></div>
    <div className="footer-meta"><p>Brisbane, Queensland, Australia</p><p>ABN 99 372 263 957</p><p>hello@trconcept.co</p><div className="legal-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-cancellation">Refund & Cancellation</Link></div></div>
  </div></footer>;
}
