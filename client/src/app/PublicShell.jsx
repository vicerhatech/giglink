import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeProvider";

function Arrow() {
  return <span aria-hidden="true" className="landing-arrow">→</span>;
}

export function PublicHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  return <header className="public-header">
    <Link className="brand" to="/" aria-label="GigLink home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>GigLink</span></Link>
    <nav className="public-nav" aria-label="Main navigation"><Link to="/explore">Explore</Link><Link to="/how-it-works">How it works</Link><Link to="/about">About</Link><Link to="/contact">Contact us</Link><Link to="/help">Help</Link></nav>
    <ThemeToggle /><Link className="header-action" to="/register">Join GigLink <Arrow /></Link>
    <button className="public-menu-button" type="button" aria-controls="public-mobile-nav" aria-expanded={mobileNavOpen} aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button>
    {mobileNavOpen && <nav id="public-mobile-nav" className="public-mobile-nav" aria-label="Mobile navigation"><Link onClick={closeMobileNav} to="/explore">Explore</Link><Link onClick={closeMobileNav} to="/how-it-works">How it works</Link><Link onClick={closeMobileNav} to="/about">About</Link><Link onClick={closeMobileNav} to="/contact">Contact us</Link><Link onClick={closeMobileNav} to="/help">Help</Link><Link onClick={closeMobileNav} to="/login">Sign in</Link><Link onClick={closeMobileNav} to="/register">Join GigLink</Link></nav>}
  </header>;
}

export function PublicFooter() {
  return <footer className="public-footer">
    <div className="footer-brand"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>GigLink</span></Link><p>GigLink helps event hosts find the right instrumentalists and backup vocalists through clear briefs and focused auditions.</p></div>
    <nav className="footer-links" aria-label="Explore GigLink"><div><h2>Explore</h2><Link to="/">Home</Link><Link to="/explore">Events</Link><Link to="/how-it-works">How it works</Link><Link to="/about">About GigLink</Link></div><div><h2>Get started</h2><Link to="/register?role=customer">I&apos;m a customer</Link><Link to="/register?role=talent">I&apos;m talent</Link><Link to="/login">Sign in</Link></div><div><h2>Support</h2><Link to="/help">Help</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/contact">Contact us</Link></div></nav>
    <p className="footer-copy">© {new Date().getFullYear()} GigLink</p>
  </footer>;
}

export function PublicPage({ eyebrow, title, children }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
      else window.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return <div className="site-page"><PublicHeader /><main className="public-page"><div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{children}</main><PublicFooter /></div>;
}
