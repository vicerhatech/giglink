import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { TalentSubscriptionPrompt } from "../features/payments/TalentSubscriptionPrompt";
import { AdminRolePreview } from "../features/admin/AdminRolePreview";

function useDashboardData(path) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    api.get(path, { signal: controller.signal, timeout: 10000 })
      .then(response => setState({ data: response.data.data, loading: false, error: "" }))
      .catch(error => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.response?.data?.message || "Could not load your workspace. Please try again." }); });
    return () => controller.abort();
  }, [path, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

function DashboardFeedback({ state }) {
  if (state.loading) return <p role="status">Loading your workspace…</p>;
  if (state.error) return <div className="dashboard-load-error" role="alert"><p>{state.error}</p><button type="button" onClick={state.retry}>Try again</button></div>;
  return null;
}

function DashboardHeader({ eyebrow, title, description }) {
  return <header className="dashboard-heading"><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></header>;
}

function QuickAction({ to, title, text, emphasis = false }) {
  return <Link className={`quick-action${emphasis ? " emphasis" : ""}`} to={to}><span className="quick-action-kicker">Quick action</span><h2>{title}</h2><p>{text}</p><b>Open <span aria-hidden="true">→</span></b></Link>;
}

function EmptyStatus({ children }) {
  return <section className="dashboard-empty"><span>Nothing to review yet</span><p>{children}</p></section>;
}

export function CustomerDashboard({ recentGigs }) {
  const { user } = useOutletContext?.() || {};
  const state = useDashboardData("/gigs/customer/mine");
  recentGigs = recentGigs ?? state.data?.gigs;
  return <div className="dashboard-page"><DashboardHeader eyebrow="Customer workspace" title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="Start a new brief or return to the gigs you already manage." />
    <section className="quick-actions"><QuickAction emphasis to="/customer/gigs/new" title="Create a Gig" text="Add your event, the musicians you need, and 1–3 audition requests per role." /><QuickAction to="/customer/gigs" title="My Gigs" text="Review drafts, published gigs, and applicants in one place." /></section>
    <DashboardFeedback state={state} />
    {!state.loading && !state.error && (recentGigs?.length > 0 ? <section className="dashboard-status"><div><p className="section-label">Recent gig status</p><h2>Your latest activity</h2></div><div className="status-list">{recentGigs.slice(0, 4).map((gig) => <Link key={gig._id} to={`/customer/gigs/${gig._id}`}><span>{gig.title}</span><b className={`status-pill ${gig.publicationStatus}`}>{gig.publicationStatus}</b></Link>)}</div></section> : <EmptyStatus>Create your first draft to start planning your event.</EmptyStatus>)}
  </div>;
}

export function TalentDashboard({ subscription }) {
  const { user } = useOutletContext?.() || {};
  const state = useDashboardData("/payments/subscription/me");
  const access = subscription ?? state.data;
  return <div className="dashboard-page"><DashboardHeader eyebrow="Talent workspace" title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="Keep your profile current, look for the right roles, and follow every application." />
    <section className="quick-actions quick-actions-three"><QuickAction emphasis to="/talent/gigs" title="Browse Gigs" text="Find available Free and Paid opportunities." /><QuickAction to="/talent/profile" title="Edit Profile" text="Update your role, instruments, and performance experience." /><QuickAction to="/talent/applications" title="My Applications" text="See submitted demos and application decisions." /></section>
    <DashboardFeedback state={state} />
    {!state.loading && !state.error && access && (access.paidGigSubscriptionRequired && !access.hasActiveSubscription ? <TalentSubscriptionPrompt /> : <section className="subscription-status"><div><p className="section-label">Paid-gig access</p><h2>{access.hasActiveSubscription ? "Subscription active" : "You can explore Free and Paid gigs"}</h2><p>{access.hasActiveSubscription ? "Your subscription is active. Already accepted gigs always remain accessible." : "No subscription is needed until your first accepted Paid gig. Free gigs always remain available."}</p></div><Link className="button button-primary" to="/talent/gigs">Browse gigs →</Link></section>)}
  </div>;
}

export function AdminDashboard() {
  const usersState = useDashboardData("/admin/users");
  const gigsState = useDashboardData("/admin/gigs");
  const users = usersState.data?.users || [];
  const gigs = gigsState.data?.gigs || [];
  return <div className="dashboard-page"><DashboardHeader eyebrow="Administration" title="Manage marketplace access." description="Use these controls to review accounts and maintain a safe demo environment." />
    <DashboardFeedback state={usersState} /><DashboardFeedback state={gigsState} />
    {!usersState.loading && !usersState.error && <section className="admin-stat-grid" aria-label="Account overview"><article className="admin-stat"><span>Customers</span><strong>{users.filter(user => user.role === "customer").length}</strong></article><article className="admin-stat"><span>Talents</span><strong>{users.filter(user => user.role === "talent").length}</strong></article><article className="admin-stat"><span>Suspended accounts</span><strong>{users.filter(user => user.accountStatus === "suspended").length}</strong></article></section>}
    <section className="quick-actions"><QuickAction emphasis to="/admin/users" title="Manage Users" text="Review customer and talent accounts, then suspend or reactivate when needed." /><QuickAction to="/settings" title="Settings" text="Review the available account and workspace settings." /></section>
    <section className="admin-note"><p className="section-label">Safe administration</p><h2>Account status controls only.</h2><p>Use the User Management area for account oversight. This MVP does not provide impersonation, password editing, refunds, or payment-record editing.</p></section>
    <AdminRolePreview />
    {!gigsState.loading && !gigsState.error && <section className="settings-extra"><h2>Recent gigs</h2><p>{gigs.length} total gigs · {gigs.filter(gig => gig.publicationStatus === "published").length} published</p>{gigs.length ? <div className="admin-gig-list">{gigs.slice(0, 8).map(gig => <article key={gig._id}><div><strong>{gig.title}</strong><p>{gig.eventType} · {new Date(gig.eventDate).toLocaleDateString()}</p></div><span>{gig.gigType} · {gig.publicationStatus} · posting fee {gig.postingPaymentStatus}</span></article>)}</div> : <p>No gigs have been created yet.</p>}</section>}
  </div>;
}
