import Link from "next/link";

export function Header() {
  return <header className="site-header"><div className="shell header-inner">
    <Link className="brand" href="/"><span className="brand-name">TRConcept</span><span className="brand-note">Practical AI · Business systems</span></Link>
    <nav className="nav" aria-label="Main navigation">
      <Link href="/learn/level-1">Learn</Link><Link href="/solve">Solve</Link><Link href="/build">Build</Link><Link href="/community">Community</Link><Link href="/about">About</Link>
    </nav>
    <Link className="button button-yellow header-cta" href="/start-here">Start here →</Link>
  </div></header>;
}
