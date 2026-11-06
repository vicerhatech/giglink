import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PublicPage } from "./PublicShell";
import { GigCard } from "../components/GigCard";
import { EventRoleFilters } from "../components/EventRoleFilters";

export function EventPreviews({ compact = false }) {
  const [type, setType] = useState("");
  const [filters, setFilters] = useState({ role: "", instrument: "" });
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", data: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: "", data: null });
    api.get("/public/gigs", { params: { page, ...(type ? { type } : {}), ...(filters.role ? { role: filters.role } : {}), ...(filters.instrument ? { instrument: filters.instrument } : {}) }, signal: controller.signal, timeout: 15000 })
      .then(({ data }) => setState({ loading: false, error: "", data: data.data }))
      .catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: error.response?.data?.message || "We couldn’t load events. Please try again.", data: null }); });
    return () => controller.abort();
  }, [page, type, filters.role, filters.instrument, retry]);
  const gigs = compact ? state.data?.gigs.slice(0, 3) : state.data?.gigs;
  return <div className="event-preview-list" aria-busy={state.loading}>
    {!compact && <EventRoleFilters value={filters} onApply={next => { setFilters(next); setPage(1); }} />}
    {!compact && <div className="explore-toolbar"><label htmlFor="event-type">Opportunity type<select id="event-type" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="">All events</option><option value="free">Free gigs</option><option value="paid">Paid gigs</option></select></label><p>Published events only. Exact venues stay private.</p></div>}
    {state.loading ? <p className="public-state" role="status">Finding published events…</p> : state.error ? <div className="public-state" role="alert"><p>{state.error}</p><button className="button button-secondary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div> : !gigs?.length ? <div className="public-state"><h3>The next lineup is still taking shape.</h3><p>{type ? "There are no published events of this type yet. Try all events or check back soon." : "No events have been published yet. Check back soon, or create a brief for your own event."}</p><Link className="text-link" to="/register?role=customer">Post an event →</Link></div> : <><div className="gig-grid">{gigs.map(gig => <GigCard key={gig._id} gig={gig} to={`/explore/${gig._id}`} linkLabel="View event" />)}</div>{!compact && state.data.pages > 1 && <nav className="explore-pagination" aria-label="Event pages"><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span aria-live="polite">Page {page} of {state.data.pages}</span><button className="button button-secondary" disabled={page >= state.data.pages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}</>}
  </div>;
}

export function ExplorePage() {
  return <PublicPage eyebrow="Explore events" title="Good music starts with an opportunity."><p className="explore-intro">See what event hosts are putting together. These are public previews; sign in as talent to view the gigs available to your account and send the demo videos requested by the host.</p><EventPreviews /><aside className="explore-note"><h2>A preview of the stage. A private place for the details.</h2><p>Exact venues and personal account details aren’t public. Talent access to Paid gigs follows the subscription rules in your workspace.</p><Link className="text-link" to="/login">Already a member? Sign in →</Link></aside></PublicPage>;
}
