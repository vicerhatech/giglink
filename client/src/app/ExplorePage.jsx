import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PublicPage } from "./PublicShell";

const dateLabel = (date) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "Date to be confirmed" : value.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export function EventPreviews({ compact = false }) {
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", data: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: "", data: null });
    api.get("/public/gigs", { params: { page, ...(type ? { type } : {}) }, signal: controller.signal, timeout: 15000 })
      .then(({ data }) => setState({ loading: false, error: "", data: data.data }))
      .catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: error.response?.data?.message || "We couldn’t load events. Please try again.", data: null }); });
    return () => controller.abort();
  }, [page, type, retry]);
  const gigs = compact ? state.data?.gigs.slice(0, 3) : state.data?.gigs;
  return <div className="event-preview-list" aria-busy={state.loading}>
    {!compact && <div className="explore-toolbar"><label htmlFor="event-type">Opportunity type<select id="event-type" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="">All events</option><option value="free">Free gigs</option><option value="paid">Paid gigs</option></select></label><p>Published events only. Exact venues stay private.</p></div>}
    {state.loading ? <p className="public-state" role="status">Finding published events…</p> : state.error ? <div className="public-state" role="alert"><p>{state.error}</p><button className="button button-secondary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div> : !gigs?.length ? <div className="public-state"><h3>The next lineup is still taking shape.</h3><p>{type ? "There are no published events of this type yet. Try all events or check back soon." : "No events have been published yet. Check back soon, or create a brief for your own event."}</p><Link className="text-link" to="/register?role=customer">Post an event →</Link></div> : <><div className="event-cards">{gigs.map((gig) => <article className="event-card" key={gig._id}><div className="event-card-top"><span className={`event-type ${gig.gigType}`}>{gig.gigType} gig</span><span>{dateLabel(gig.eventDate)}</span></div><p className="event-category">{gig.eventType}</p><h3>{gig.title}</h3><div className="event-roles">{gig.roles.map((role) => <span key={role}>{role}</span>)}</div><p className="venue-note">Exact venue shared after acceptance.</p><Link className="text-link" to="/register?role=talent">Join as talent to explore eligible gigs →</Link></article>)}</div>{!compact && state.data.pages > 1 && <nav className="explore-pagination" aria-label="Event pages"><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span aria-live="polite">Page {page} of {state.data.pages}</span><button className="button button-secondary" disabled={page >= state.data.pages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}</>}
  </div>;
}

export function ExplorePage() {
  return <PublicPage eyebrow="Explore events" title="Good music starts with an opportunity."><p className="explore-intro">See what event hosts are putting together. These are public previews; sign in as talent to view the gigs available to your account and send the demo videos requested by the host.</p><EventPreviews /><aside className="explore-note"><h2>A preview of the stage. A private place for the details.</h2><p>Exact venues and personal account details aren’t public. Talent access to Paid gigs follows the subscription rules in your workspace.</p><Link className="text-link" to="/login">Already a member? Sign in →</Link></aside></PublicPage>;
}
