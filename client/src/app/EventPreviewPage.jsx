import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { PublicHeader, PublicFooter } from "./PublicShell";
import { useAuth } from "../features/auth/routes";
import { gigDate } from "../components/gig-display";
import "../components/gigs.css";

export function EventPreviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ gig: null, error: "" });
  useEffect(() => {
    const controller = new AbortController(); setState({ gig: null, error: "" });
    api.get(`/public/gigs/${id}`, { signal: controller.signal, timeout: 15000 }).then(response => { if (!controller.signal.aborted) setState({ gig: response.data.data.gig, error: "" }); }).catch(error => { if (!controller.signal.aborted) setState({ gig: null, error: error.response?.data?.message || "Could not load this event." }); });
    return () => controller.abort();
  }, [id]);
  const { gig, error } = state;
  return <div className="site-page"><PublicHeader /><main className="public-page"><Link className="gig-back-link" to="/explore">← Explore all events</Link>{error ? <p className="gig-state" role="alert">{error}</p> : !gig ? <p className="gig-state" role="status">Loading event preview…</p> : <article className="gig-detail-page"><header className="gig-detail-hero"><span className={`gig-kind ${gig.gigType}`}>{gig.gigType} gig · Public preview</span><h1>{gig.title}</h1><dl className="gig-detail-meta"><div><dt>Event type</dt><dd>{gig.eventType}</dd></div><div><dt>Event date</dt><dd>{gigDate(gig.eventDate)}</dd></div></dl></header><div className="gig-detail-layout"><section className="gig-detail-copy"><h2>The people behind the sound</h2><p className="gig-detail-description">The host is looking for the following musicians. Full audition requests and application eligibility are available in the Talent workspace.</p><ul className="gig-detail-roles">{gig.roles.map(role => <li className="gig-role-brief" key={role}><h3>{role}</h3></li>)}</ul></section><aside className="gig-detail-aside"><h2>Interested in this gig?</h2><p>Exact venues and account details stay private. Talent access to Paid gigs follows the subscription rules.</p>{user?.role === "talent" ? <Link className="button button-primary" to={`/talent/gigs/${gig._id}`}>View full brief →</Link> : user ? <Link className="button button-primary" to={`/${user.role}/dashboard`}>Back to my workspace →</Link> : <Link className="button button-primary" to="/register?role=talent">Join as Talent →</Link>}</aside></div></article>}</main><PublicFooter /></div>;
}
