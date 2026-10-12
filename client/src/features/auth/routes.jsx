import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

export const authRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

export { AuthProvider, hasRole, useAuth } from "./auth-context";
export { ProtectedRoute } from "./ProtectedRoute";
