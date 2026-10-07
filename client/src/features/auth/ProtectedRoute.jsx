import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="p-6 text-center text-slate-600">Restoring your session…</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
