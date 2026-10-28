import { Navigate, createBrowserRouter, useSearchParams } from "react-router-dom";
import { AppShell } from "./AppShell";
import { NotFoundPage } from "./NotFoundPage";
import { LandingPage } from "./LandingPage";
import { AboutPage, ContactPage, HelpPage, HowItWorksPage, PrivacyPage, TermsPage } from "./PublicPages";
import { AdminDashboard, CustomerDashboard, TalentDashboard } from "./DashboardPages";
import { SettingsPage } from "./SettingsPage";
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
      { index: true, element: <LandingPage /> },
      ...authRoutes,
      { path: "/customer/dashboard", element: <RoleRoute roles="customer"><CustomerDashboard /></RoleRoute> },
      { path: "/talent/dashboard", element: <RoleRoute roles="talent"><TalentDashboard /></RoleRoute> },
      { path: "/admin/dashboard", element: <RoleRoute roles="admin"><AdminDashboard /></RoleRoute> },
      { path: "/settings", element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { ...customerRoutes, element: <RoleRoute roles="customer">{customerRoutes.element}</RoleRoute> },
      ...protect(talentRoutes, "talent"),
      ...protect(adminRoutes, "admin"),
      { path: "/payments/gig-post/callback", element: <RoleRoute roles="customer"><PostingPaymentCallbackPage /></RoleRoute> },
      { path: "/payments/subscription/callback", element: <RoleRoute roles="talent"><SubscriptionPaymentCallbackPage /></RoleRoute> },
    ],
  },
  { path: "/about", element: <AboutPage /> },
  { path: "/how-it-works", element: <HowItWorksPage /> },
  { path: "/help", element: <HelpPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
