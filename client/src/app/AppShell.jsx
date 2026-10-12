import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/routes";

export function AppShell() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white px-6 py-4"><nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4"><Link className="font-bold text-indigo-700" to="/">GigLink</Link>{user?.role === "customer" && <><NavLink to="/customer/gigs">My Gigs</NavLink><NavLink to="/customer/gigs/new">Create Gig</NavLink></>}{user?.role === "talent" && <><NavLink to="/talent/gigs">Browse Gigs</NavLink><NavLink to="/talent/applications">My Applications</NavLink><NavLink to="/talent/profile">Talent Profile</NavLink></>}{user?.role === "admin" && <NavLink to="/admin/users">User Management</NavLink>}{user ? <button className="ml-auto rounded border border-slate-300 px-3 py-1" onClick={logout} type="button">Logout</button> : <NavLink className="ml-auto" to="/login">Login</NavLink>}</nav></header><Outlet /></div>
  );
}
