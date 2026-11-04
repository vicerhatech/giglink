import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LandingPage } from "../../app/LandingPage";
import { AuthDialog } from "./AuthDialog";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { useAuth } from "./auth-context";
import { dashboardPathForRole } from "./dashboard-path";

// Direct auth URLs work without a previous page or in-memory modal state.
export function AuthRoute({ mode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  if (isLoading) return <main className="public-container"><p role="status">Restoring your session…</p></main>;
  if (user) return <Navigate to={dashboardPathForRole(user.role)} replace />;
  return <><div className="auth-route-background"><LandingPage /></div><AuthDialog onClose={() => navigate("/", { replace: true })}>{mode === "register" ? <RegisterPage key={location.search} initialRole={params.get("role")} /> : <LoginPage />}</AuthDialog></>;
}
