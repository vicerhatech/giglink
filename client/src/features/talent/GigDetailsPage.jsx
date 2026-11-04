import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { gigDate, gigMoney } from "../../components/gig-display";
import "../../components/gigs.css";

export function GigDetailsPage() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController(); setGig(null); setError("");
    api.get(`/talent/gigs/${id}`, { signal: controller.signal, timeout: 15000 })
      .then(response => { if (!controller.signal.aborted) setGig(response.data.data.gig); })
      .catch(error => { if (!controller.signal.aborted) setError(error.response?.data?.message || "Could not load this gig."); });
    return () => controller.abort();
  }, [id]);

  if (error) return <section className="gig-detail-page"><Link className="gig-back-link" to="/talent/gigs">← Back to gigs</Link><p className="gig-state" role="alert">{error}</p></section>;
  if (!gig) return <section className="gig-detail-page"><p className="gig-state" role="status">Loading event brief…</p></section>;
  return <GigBrief gig={gig} />;
}

export function GigBrief({ gig }) {
  const paid = gig.gigType === "paid";
  return <article className="gig-detail-page">
    <Link className="gig-back-link" to="/talent/gigs">← Back to gigs</Link>
    <header className="gig-detail-hero"><span className={`gig-kind ${paid ? "paid" : "free"}`}>{paid ? "Paid gig" : "Free gig"} · {gig.eventType}</span><h1>{gig.title}</h1>
      <dl className="gig-detail-meta"><div><dt>Event date</dt><dd>{gigDate(gig.eventDate)}</dd></div><div><dt>Time</dt><dd>{gig.eventTime}</dd></div><div><dt>Apply before</dt><dd>{gigDate(gig.applicationDeadline)}</dd></div>{paid && gig.paymentRange && <div><dt>Talent compensation</dt><dd>{gigMoney(gig.paymentRange.min)} – {gigMoney(gig.paymentRange.max)}</dd></div>}</dl>
    </header>
    <div className="gig-detail-layout"><div className="gig-detail-copy"><section><h2>About this event</h2><p className="gig-detail-description">{gig.description}</p></section>
      <section id="gig-roles"><h2>Find your role</h2><p className="gig-detail-description">Choose the role that suits your skills and prepare one video for each request.</p><ul className="gig-detail-roles">{gig.positions.map(position => <li className="gig-role-brief" key={position._id}><div className="gig-role-heading"><h3>{position.instrument || position.roleType.replaceAll("_", " ")}</h3><span>{position.slots} {position.slots === 1 ? "person" : "people"} needed</span></div><p>Prepare {position.auditionSongs.length} matching demo video{position.auditionSongs.length === 1 ? "" : "s"}:</p><ol>{position.auditionSongs.map((song, index) => <li key={`${index}-${song}`}>{song}</li>)}</ol><Link className="button button-primary" to={`/talent/gigs/${gig._id}/positions/${position._id}/apply`}>Apply for this role →</Link></li>)}</ul></section>
    </div><aside className="gig-detail-aside"><h2>{gig.location ? "Your event venue" : "Your venue stays private"}</h2><p>{gig.location || "The exact event location is shared with you only after the host accepts your application."}</p><p>Review the brief and audition requests before applying. The host will review your submitted videos.</p><a className="button button-primary" href="#gig-roles">See available roles ↓</a></aside></div>
  </article>;
}
