import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LandingPage } from "../../app/LandingPage";
import { AuthDialog } from "./AuthDialog";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

// Direct auth URLs work without a previous page or in-memory modal state.
export function AuthRoute({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  return <><div className="auth-route-background"><LandingPage /></div><AuthDialog onClose={() => navigate("/", { replace: true })}>{mode === "register" ? <RegisterPage key={location.search} initialRole={params.get("role")} /> : <LoginPage />}</AuthDialog></>;
}
