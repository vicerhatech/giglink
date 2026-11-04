import { Link } from "react-router-dom";
import { gigDate, gigMoney, gigRoles } from "./gig-display";
import "./gigs.css";

export function GigCard({ gig, to, children, linkLabel = "View event brief" }) {
  const roles = gigRoles(gig);
  const paid = gig.gigType === "paid";
  return <article className={`gig-tile ${paid ? "paid" : "free"}`}>
    <div className="gig-tile-top"><span className={`gig-kind ${paid ? "paid" : "free"}`}>{paid ? "Paid gig" : "Free gig"}</span><time dateTime={gig.eventDate}>{gigDate(gig.eventDate)}</time></div>
    <p className="gig-tile-category">{gig.eventType}</p>
    <h2><Link className="gig-tile-link" to={to}>{gig.title}</Link></h2>
    {gig.description && <p className="gig-tile-description">{gig.description}</p>}
    <div className="gig-tile-roles">{roles.slice(0, 3).map(role => <span key={role}>{role}</span>)}{roles.length > 3 && <span>+{roles.length - 3} more</span>}</div>
    {paid && gig.paymentRange && <div className="gig-tile-compensation"><span>Talent compensation</span><strong>{gigMoney(gig.paymentRange.min)} – {gigMoney(gig.paymentRange.max)}</strong></div>}
    <div className="gig-tile-bottom"><span>{gig.eventTime || "Exact venue shared after acceptance"}</span><span className="gig-tile-open">{linkLabel} <span aria-hidden="true">↗</span></span></div>
    {children && <div className="gig-tile-actions">{children}</div>}
  </article>;
}
