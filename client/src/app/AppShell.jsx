import { Outlet, useLocation } from "react-router-dom";
import { AuthenticatedShell } from "./AuthenticatedShell";
import { useAuth } from "../features/auth/routes";

export function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isPublicPage = ["/", "/about", "/how-it-works", "/help", "/privacy", "/terms", "/contact", "/login", "/register"].includes(pathname);

  if (!user || isPublicPage) return <Outlet />;

  return <AuthenticatedShell user={user} onLogout={logout}>
    <Outlet context={{ user, role: user.role }} />
  </AuthenticatedShell>;
}
