import { Navigate, createBrowserRouter, useSearchParams } from "react-router-dom";
import { AppShell } from "./AppShell";
import { NotFoundPage } from "./NotFoundPage";
import { authRoutes, hasRole, ProtectedRoute, useAuth } from "../features/auth/routes";
import { customerRoutes } from "../features/customer/routes";
import { talentRoutes } from "../features/talent/routes";
import { adminRoutes } from "../features/admin/routes";
import { GigPostingPaymentCallback } from "../features/payments/GigPostingPaymentCallback";
import { TalentSubscriptionCallback } from "../features/payments/TalentSubscriptionCallback";

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  return <ProtectedRoute>{hasRole(user, roles) ? children : <Navigate to="/" replace />}</ProtectedRoute>;
}

function PostingPaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  return <main className="mx-auto max-w-3xl p-6"><GigPostingPaymentCallback reference={searchParams.get("reference")} /></main>;
}

function SubscriptionPaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  return <main className="mx-auto max-w-3xl p-6"><TalentSubscriptionCallback reference={searchParams.get("reference")} /></main>;
}

const protect = (routes, roles) => routes.map((route) => ({ ...route, element: <RoleRoute roles={roles}>{route.element}</RoleRoute> }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      ...authRoutes,
      { ...customerRoutes, element: <RoleRoute roles="customer">{customerRoutes.element}</RoleRoute> },
      ...protect(talentRoutes, "talent"),
      ...protect(adminRoutes, "admin"),
      { path: "/payments/gig-post/callback", element: <RoleRoute roles="customer"><PostingPaymentCallbackPage /></RoleRoute> },
      { path: "/payments/subscription/callback", element: <RoleRoute roles="talent"><SubscriptionPaymentCallbackPage /></RoleRoute> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
