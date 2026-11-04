import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "./workspace.css";
import { ThemeToggle } from "./ThemeProvider";
import { dashboardPathForRole } from "../features/auth/dashboard-path";

const navigation = {
  customer: [
    ["Dashboard", "/customer/dashboard", "grid"],
    ["Create Gig", "/customer/gigs/new", "plus"],
    ["My Gigs", "/customer/gigs", "calendar"],
    ["Settings", "/settings", "settings"],
  ],
  talent: [
    ["Dashboard", "/talent/dashboard", "grid"],
    ["Browse Gigs", "/talent/gigs", "search"],
    ["My Applications", "/talent/applications", "document"],
    ["Profile", "/talent/profile", "person"],
    ["Settings", "/settings", "settings"],
  ],
  admin: [
    ["Dashboard", "/admin/dashboard", "grid"],
    ["User Management", "/admin/users", "people"],
    ["Settings", "/settings", "settings"],
  ],
};

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-3v-.08A1.7 1.7 0 0 0 10.66 18.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.56-1.04H5v-3h.08A1.7 1.7 0 0 0 6.64 9.62 1.7 1.7 0 0 0 6.3 7.74l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.3 6a1.7 1.7 0 0 0 1.04-1.56V4h3v.08A1.7 1.7 0 0 0 15.38 5.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19 9.3a1.7 1.7 0 0 0 1.56 1.04H21v3h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.4 4.4" /></>,
    document: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 12h5M10 16h5" /></>,
    person: <><circle cx="12" cy="8" r="3.5" /><path d="M4.8 21c.8-3.7 3.2-5.6 7.2-5.6s6.4 1.9 7.2 5.6" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.8 20c.6-3.2 2.4-4.8 5.2-4.8s4.6 1.6 5.2 4.8M16.5 5.5a2.7 2.7 0 0 1 0 5.2M16.2 15.4c2.2.1 3.7 1.6 4 4.6" /></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9" /></>,
    home: <><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z" /></>,
  };
  return <svg aria-hidden="true" className="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Brand({ role, onClick }) {
  return <Link className="brand app-brand" to={dashboardPathForRole(role)} onClick={onClick} aria-label="GigLink workspace home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>GigLink</span></Link>;
}

function Sidebar({ role, close, onLogout }) {
  const links = navigation[role] || [];
  return <aside className="app-sidebar" aria-label="Application navigation">
    <nav className="app-nav">
      <p className="app-nav-label">{role} workspace</p>
      {links.map(([label, to, icon]) => <NavLink className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`} key={to} onClick={close} to={to}><Icon name={icon} /><span>{label}</span></NavLink>)}
    </nav>
    <div className="sidebar-footer"><Link className="sidebar-home-link" to="/" onClick={close}><Icon name="home" /><span>Visit landing page</span></Link><button className="logout-button" onClick={onLogout} type="button"><Icon name="logout" /><span>Logout</span></button></div>
  </aside>;
}

// This component controls navigation visibility only. Every route must still
// enforce role authorization through the backend and route guards.
export function AuthenticatedShell({ user, onLogout, children }) {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const accountMenuRef = useRef(null);
  const role = navigation[user?.role] ? user.role : "talent";
  const closeMenu = () => { if (accountMenuRef.current) accountMenuRef.current.open = false; };
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && accountMenuRef.current?.open) { closeMenu(); accountMenuRef.current.querySelector("summary")?.focus(); }
    }
    function onPointerDown(event) { if (!accountMenuRef.current?.contains(event.target)) closeMenu(); }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onPointerDown); };
  }, []);

  const displayName = user?.name || "GigLink member";
  const initials = displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return <div className="authenticated-app">
    <header className="app-header">
      <div className="app-header-brand"><Brand role={role} /></div>
      <div className="app-header-context"><span>Your workspace</span><strong>{[...(navigation[role] || [])].sort((a, b) => b[1].length - a[1].length).find(([, to]) => pathname === to || pathname.startsWith(`${to}/`))?.[0] || "Gig details"}</strong></div>
      <div className="app-header-spacer" />
      <ThemeToggle />
      <Link className="app-header-help" to="/help">Help centre</Link>
      <details className="account-dropdown" ref={accountMenuRef}><summary className="app-user" aria-label={`Open navigation and account menu for ${displayName}`}><span className="app-avatar" aria-hidden="true">{initials}</span><span className="account-menu-identity"><strong>{displayName}</strong><span>{role === "customer" ? "Event host" : role}</span></span><svg className="account-menu-chevron" aria-hidden="true" width="14" height="14" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></summary><nav className="account-menu-panel" aria-label="Account and workspace navigation"><div className="account-menu-heading"><strong>{displayName}</strong><span>{role === "customer" ? "Customer" : role} workspace</span></div><div className="account-mobile-navigation">{navigation[role].filter(([, to]) => to !== "/settings").map(([label, to, icon]) => <NavLink key={to} onClick={closeMenu} to={to}><Icon name={icon} />{label}</NavLink>)}</div><Link to="/settings" onClick={closeMenu}><Icon name="settings" />Account settings</Link><Link to="/" onClick={closeMenu}><Icon name="home" />Visit landing page</Link><button type="button" onClick={() => { closeMenu(); onLogout(); }}><Icon name="logout" />Logout</button></nav></details>
    </header>
    <div className="app-layout">
      <div className="app-sidebar-desktop"><Sidebar role={role} close={() => {}} onLogout={onLogout} /></div>
      <main className="app-main" ref={mainRef}>{children || <Outlet context={{ user, role }} />}</main>
    </div>
  </div>;
}
