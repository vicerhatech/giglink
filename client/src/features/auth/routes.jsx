import { AuthRoute } from "./AuthRoute";

export const authRoutes = [
  { path: "/login", element: <AuthRoute mode="login" /> },
  { path: "/register", element: <AuthRoute mode="register" /> },
];

export { AuthProvider, hasRole, useAuth } from "./auth-context";
export { ProtectedRoute } from "./ProtectedRoute";
