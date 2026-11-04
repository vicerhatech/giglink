import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { TalentSubscriptionPrompt } from "../payments/TalentSubscriptionPrompt";
import { GigCard } from "../../components/GigCard";

export function BrowseGigsPage() {
  const [gigs, setGigs] = useState([]);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    api.get("/talent/gigs", { signal: controller.signal, timeout: 15000 }).then(response => {
      if (controller.signal.aborted) return;
      setGigs(response.data.data.gigs || []);
      setSubscriptionRequired(Boolean(response.data.data.subscriptionRequired && !response.data.data.hasActiveSubscription));
    }).catch(error => { if (!controller.signal.aborted) setError(error.response?.data?.message || "Could not load available gigs."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  return <section className="gig-browser-page"><header className="gig-page-heading"><div><p className="section-label">Your next performance</p><h1>Browse gigs</h1><p>Find your next role. Exact venues are shared only after acceptance.</p></div>{!loading && !error && <span className="gig-kind">{gigs.length} available</span>}</header>
    {subscriptionRequired && <section className="gig-access-notice"><TalentSubscriptionPrompt /></section>}
    {loading ? <p className="gig-state" role="status">Loading available gigs…</p> : error ? <div className="gig-state" role="alert"><p>{error}</p><button className="button button-secondary" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div> : gigs.length === 0 ? <section className="gig-state"><h2>No published gigs are available right now.</h2><p>Only gigs with verified posting payments and published status appear here. Customer drafts remain private.</p>{subscriptionRequired && <p>Free gigs remain available; a subscription is needed only for new Paid gigs.</p>}</section> : <div className="gig-grid">{gigs.map(gig => <GigCard key={gig._id} gig={gig} to={`/talent/gigs/${gig._id}`} />)}</div>}
  </section>;
}
