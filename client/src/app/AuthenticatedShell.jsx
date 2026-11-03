import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

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
  };
  return <svg aria-hidden="true" className="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Brand() {
  return <Link className="brand app-brand" to="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>GigLink</span></Link>;
}

function Sidebar({ role, close, onLogout }) {
  const links = navigation[role] || [];
  return <aside className="app-sidebar" aria-label="Application navigation">
    <div className="app-sidebar-brand"><Brand /><button className="drawer-close" onClick={close} type="button" aria-label="Close navigation">×</button></div>
    <nav className="app-nav">
      <p className="app-nav-label">{role} workspace</p>
      {links.map(([label, to, icon]) => <NavLink className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`} key={to} onClick={close} to={to}><Icon name={icon} /><span>{label}</span></NavLink>)}
    </nav>
    <button className="logout-button" onClick={onLogout} type="button"><Icon name="logout" /><span>Logout</span></button>
  </aside>;
}

// This component controls navigation visibility only. Every route must still
// enforce role authorization through the backend and route guards.
export function AuthenticatedShell({ user, onLogout, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const role = navigation[user?.role] ? user.role : "talent";
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    function onKeyDown(event) { if (event.key === "Escape") closeDrawer(); }
    if (drawerOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const displayName = user?.name || "GigLink member";
  const initials = displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return <div className="authenticated-app">
    <header className="app-header">
      <button className="menu-button" aria-controls="app-sidebar" aria-expanded={drawerOpen} aria-label={drawerOpen ? "Close navigation" : "Open navigation"} onClick={() => setDrawerOpen((open) => !open)} type="button"><span /><span /><span /></button>
      <div className="app-header-mobile-brand"><Brand /></div>
      <div className="app-header-spacer" />
      <div className="app-user"><div className="app-avatar" aria-hidden="true">{initials}</div><div><strong>{displayName}</strong><span>{role}</span></div></div>
    </header>
    <div className="app-layout">
      <div className="app-sidebar-desktop"><Sidebar role={role} close={() => {}} onLogout={onLogout} /></div>
      <div className={`drawer-layer${drawerOpen ? " open" : ""}`} aria-hidden={!drawerOpen}>
        <button className="drawer-backdrop" aria-label="Close navigation" onClick={closeDrawer} tabIndex={drawerOpen ? 0 : -1} type="button" />
        <div id="app-sidebar" className="app-sidebar-drawer" role="dialog" aria-modal="true" aria-label="Navigation"><Sidebar role={role} close={closeDrawer} onLogout={onLogout} /></div>
      </div>
      <main className="app-main">{children || <Outlet context={{ user, role }} />}</main>
    </div>
  </div>;
}
