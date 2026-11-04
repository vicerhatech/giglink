import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeProvider";
import { useAuth } from "../features/auth/routes";
import { dashboardPathForRole } from "../features/auth/dashboard-path";

function Arrow() {
  return <span aria-hidden="true" className="landing-arrow">→</span>;
}

export function PublicHeader() {
  const { user, isLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMobileNav = () => setMobileNavOpen(false);
  useEffect(() => { closeMobileNav(); }, [pathname]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === "Escape") closeMobileNav(); };
    if (mobileNavOpen) document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);
  return <div className="public-header-bar"><header className="public-header">
    <Link className="brand" to={user ? dashboardPathForRole(user.role) : "/"} aria-label={user ? "GigLink workspace home" : "GigLink home"}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>GigLink</span></Link>
    <nav className="public-nav" aria-label="Main navigation"><Link to="/explore">Explore</Link><Link to="/how-it-works">How it works</Link><Link to="/about">About</Link><Link to="/contact">Contact us</Link><Link to="/help">Help</Link></nav>
    <div className="public-header-actions"><ThemeToggle />{user ? <button className="public-account-link" type="button" aria-controls="public-mobile-nav" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(open => !open)} aria-label={`Open account navigation for ${user.name}`}><span className="public-account-avatar" aria-hidden="true">{user.name?.trim()?.slice(0, 1).toUpperCase() || "U"}</span><span><strong>{user.name}</strong><small>{user.role === "customer" ? "Event host" : user.role} workspace ▾</small></span></button> : isLoading ? <span className="public-session-loading" role="status">Loading account…</span> : <Link className="header-action" to="/register">Join GigLink <Arrow /></Link>}
    {!user && <button className="public-menu-button" type="button" aria-controls="public-mobile-nav" aria-expanded={mobileNavOpen} aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button>}</div>
    {mobileNavOpen && <nav id="public-mobile-nav" className="public-mobile-nav" aria-label="Mobile navigation"><Link onClick={closeMobileNav} to="/explore">Explore</Link><Link onClick={closeMobileNav} to="/how-it-works">How it works</Link><Link onClick={closeMobileNav} to="/about">About</Link><Link onClick={closeMobileNav} to="/contact">Contact us</Link><Link onClick={closeMobileNav} to="/help">Help</Link>{user ? <><Link onClick={closeMobileNav} to={dashboardPathForRole(user.role)}>My workspace</Link><Link onClick={closeMobileNav} to="/settings">Account settings</Link><button type="button" onClick={() => { closeMobileNav(); logout(); }}>Sign out</button></> : !isLoading && <><Link onClick={closeMobileNav} to="/login">Sign in</Link><Link onClick={closeMobileNav} to="/register">Join GigLink</Link></>}</nav>}
  </header></div>;
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
