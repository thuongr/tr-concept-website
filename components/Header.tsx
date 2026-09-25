import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="TRConcept home">
          <span className="brand-name">TRConcept</span>
          <span className="brand-note">Practical AI · Business systems</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link href="/learn/level-1">Learn</Link>
          <Link href="/solve">Solve</Link>
          <Link href="/build">Build</Link>
          <Link href="/community">Community</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="header-actions">
          <Link className="button button-yellow header-cta" href="/start-here">
            Start here →
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <nav aria-label="Mobile navigation">
              <Link href="/learn/level-1">Learn</Link>
              <Link href="/learn/level-2">Level 2</Link>
              <Link href="/community">Community</Link>
              <Link href="/solve">Solve</Link>
              <Link href="/build">Build</Link>
              <Link href="/work">Work</Link>
              <Link href="/about">About</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
