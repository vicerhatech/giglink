import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthDialog } from "../features/auth/AuthDialog";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";

// Enhance ordinary auth links while keeping their real hrefs for refresh,
// keyboard access, and opening in a new tab. There is still only one router.
export function AuthModalHost() {
  const [target, setTarget] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setTarget(null); }, [location.key]);
  function openAuth(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || !["/login", "/register"].includes(url.pathname)) return;
    event.preventDefault();
    if (["/login", "/register"].includes(location.pathname)) navigate(`${url.pathname}${url.search}`, { replace: true, state: location.state });
    else setTarget({ path: url.pathname, role: url.searchParams.get("role") });
  }
  return <div onClickCapture={openAuth}><Outlet />{target && <AuthDialog onClose={() => setTarget(null)}>{target.path === "/login" ? <LoginPage onAuthenticated={() => setTarget(null)} /> : <RegisterPage key={target.role || "customer"} initialRole={target.role} onAuthenticated={() => setTarget(null)} />}</AuthDialog>}</div>;
}
