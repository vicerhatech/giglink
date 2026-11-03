import { Link, useOutletContext } from "react-router-dom";

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
  return <div className="dashboard-page"><DashboardHeader eyebrow="Customer workspace" title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="Start a new brief or return to the gigs you already manage." />
    <section className="quick-actions"><QuickAction emphasis to="/customer/gigs/new" title="Create a Gig" text="Set the event details, positions, and audition-song requests." /><QuickAction to="/customer/gigs" title="My Gigs" text="Review drafts, published gigs, and applicants in one place." /></section>
    {Array.isArray(recentGigs) && recentGigs.length > 0 ? <section className="dashboard-status"><div><p className="section-label">Recent gig status</p><h2>Your latest activity</h2></div><div className="status-list">{recentGigs.slice(0, 4).map((gig) => <Link key={gig._id} to={`/customer/gigs/${gig._id}`}><span>{gig.title}</span><b className={`status-pill ${gig.publicationStatus}`}>{gig.publicationStatus}</b></Link>)}</div></section> : <EmptyStatus>Recent gig status will appear here once your Gig data is available.</EmptyStatus>}
  </div>;
}

export function TalentDashboard({ subscription }) {
  const { user } = useOutletContext?.() || {};
  const showSubscription = subscription && typeof subscription === "object";
  return <div className="dashboard-page"><DashboardHeader eyebrow="Talent workspace" title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="Keep your profile current, look for the right roles, and follow every application." />
    <section className="quick-actions quick-actions-three"><QuickAction emphasis to="/talent/gigs" title="Browse Gigs" text="Find available Free and Paid opportunities." /><QuickAction to="/talent/profile" title="Edit Profile" text="Update your role, instruments, and performance experience." /><QuickAction to="/talent/applications" title="My Applications" text="See submitted demos and application decisions." /></section>
    {showSubscription ? <section className="subscription-status"><div><p className="section-label">Paid-gig access</p><h2>{subscription.status === "active" ? "Subscription active" : "Subscription required"}</h2><p>{subscription.status === "active" ? "Your current subscription allows you to browse Paid gigs." : "Browse Gigs to review the available subscription prompt. Free gigs remain available."}</p></div>{subscription.status !== "active" && <Link className="button button-primary" to="/talent/gigs">Browse available gigs →</Link>}</section> : <EmptyStatus>Subscription status will appear here when it is available for your account.</EmptyStatus>}
  </div>;
}

export function AdminDashboard() {
  return <div className="dashboard-page"><DashboardHeader eyebrow="Administration" title="Manage marketplace access." description="Use these controls to review accounts and maintain a safe demo environment." />
    <section className="quick-actions"><QuickAction emphasis to="/admin/users" title="Manage Users" text="Review customer and talent accounts, then suspend or reactivate when needed." /><QuickAction to="/settings" title="Settings" text="Review the available account and workspace settings." /></section>
    <section className="admin-note"><p className="section-label">Safe administration</p><h2>Account status controls only.</h2><p>Use the User Management area for account oversight. This MVP does not provide impersonation, password editing, refunds, or payment-record editing.</p></section>
  </div>;
}
