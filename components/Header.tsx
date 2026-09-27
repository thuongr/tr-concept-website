"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => { if (menuRef.current) menuRef.current.open = false; }, [pathname]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { const m=menuRef.current; if(m?.open && !m.contains(e.target as Node)) m.open=false; };
    const escape = (e: KeyboardEvent) => { if(e.key==="Escape" && menuRef.current) menuRef.current.open=false; };
    document.addEventListener("pointerdown",outside); document.addEventListener("keydown",escape);
    return () => { document.removeEventListener("pointerdown",outside); document.removeEventListener("keydown",escape); };
  }, []);
  const closeMenu=()=>{if(menuRef.current) menuRef.current.open=false;};
  return <header className="site-header"><div className="shell header-inner">
    <Link className="brand" href="/" aria-label="TRConcept home"><span className="brand-name">TRConcept</span><span className="brand-note">Practical AI · Business systems</span></Link>
    <nav className="nav" aria-label="Main navigation"><Link href="/learn">Learn</Link><Link href="/solve">Solve</Link><Link href="/build">Build</Link><Link href="/community">Community</Link><Link href="/about">About</Link></nav>
    <div className="header-actions"><Link className="button button-yellow header-cta" href="/start-here">Start here →</Link>
      <details ref={menuRef} className="mobile-menu"><summary aria-label="Toggle navigation">Menu</summary><nav aria-label="Mobile navigation" onClick={closeMenu}><Link href="/learn">Learn</Link><Link href="/community">Community</Link><Link href="/solve">Solve</Link><Link href="/build">Build</Link><Link href="/work">Work</Link><Link href="/about">About</Link></nav></details>
    </div>
  </div></header>;
}
