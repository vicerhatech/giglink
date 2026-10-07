import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GigForm } from "./GigForm";
import { apiMessage, cancelGig, createGigDraft, getMyGig, listMyGigs, updateGig } from "./gigApi";
import { gigToForm } from "./gigForm";
import "./customer.css";

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
function Status({ children }) { return <span className="customer-status">{children}</span>; }
function LayoutMessage({ error, success }) { return <>{error && <p className="customer-error customer-banner" role="alert">{error}</p>}{success && <p className="customer-success customer-banner" role="status">{success}</p>}</>; }

export function CustomerDashboardLayout() {
  return <main className="customer-shell"><header className="customer-header"><Link to="/customer/gigs">GigLink Customer</Link><nav><NavLink to="/customer/gigs">My gigs</NavLink><NavLink to="/customer/gigs/new">Create gig</NavLink></nav></header><Outlet /></main>;
}

export function MyGigsPage() {
  const [gigs, setGigs] = useState(null); const [error, setError] = useState("");
  useEffect(() => { listMyGigs().then((data) => setGigs(data.gigs || [])).catch((reason) => setError(apiMessage(reason))); }, []);
  return <section><div className="customer-page-heading"><div><h1>My gigs</h1><p>Manage your drafts, published gigs, and cancellations.</p></div><Link className="customer-primary customer-link" to="/customer/gigs/new">Create a gig</Link></div><LayoutMessage error={error} />{gigs === null && !error ? <p>Loading your gigs…</p> : gigs?.length === 0 ? <div className="customer-empty"><h2>No gigs yet</h2><p>Create your first gig draft when you are ready. Posting fees are paid separately before publication.</p><Link className="customer-primary customer-link" to="/customer/gigs/new">Create a gig</Link></div> : <div className="customer-cards">{gigs?.map((gig) => <article className="customer-card" key={gig._id}><div><Status>{gig.gigType.toUpperCase()}</Status> <Status>{gig.publicationStatus}</Status></div><h2>{gig.title}</h2><p>{gig.eventType} · {new Date(gig.eventDate).toLocaleDateString("en-NG")}</p>{gig.gigType === "paid" && <p>Talent payment: {money.format(gig.paymentRange.min)} – {money.format(gig.paymentRange.max)}</p>}<Link to={`/customer/gigs/${gig._id}`}>Open and manage</Link></article>)}</div>}</section>;
}

export function CreateGigPage() {
  const navigate = useNavigate(); const [error, setError] = useState("");
  async function save(payload) { try { const data = await createGigDraft(payload); navigate(`/customer/gigs/${data.gig._id}`, { state: { success: "Draft created successfully. It remains unpublished until its posting payment is verified." } }); } catch (reason) { setError(apiMessage(reason)); } }
  return <section><div className="customer-page-heading"><div><h1>Create a gig</h1><p>Create a draft now; publication and payment are handled separately.</p></div></div><LayoutMessage error={error} /><GigForm onSubmit={save} submitLabel="Create draft" /></section>;
}

export function ManageGigPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [gig, setGig] = useState(null); const [error, setError] = useState(""); const [success, setSuccess] = useState(history.state?.usr?.success || ""); const [cancelling, setCancelling] = useState(false);
  useEffect(() => { getMyGig(id).then((data) => setGig(data.gig)).catch((reason) => setError(apiMessage(reason))); }, [id]);
  async function save(payload) { try { const data = await updateGig(id, payload); setGig(data.gig); setSuccess("Gig draft updated successfully."); setError(""); } catch (reason) { setError(apiMessage(reason)); } }
  async function cancel() { if (!window.confirm("Cancel this gig? This cannot be undone from this screen.")) return; setCancelling(true); try { const data = await cancelGig(id); setGig(data.gig); setSuccess("Gig cancelled successfully."); } catch (reason) { setError(apiMessage(reason)); } finally { setCancelling(false); } }
  if (!gig && !error) return <p>Loading gig…</p>;
  if (!gig) return <section><Link to="/customer/gigs">Back to My gigs</Link><LayoutMessage error={error} /></section>;
  const isCancelled = gig.publicationStatus === "cancelled";
  return <section><div className="customer-page-heading"><div><Link to="/customer/gigs">← My gigs</Link><h1>Manage {gig.title}</h1><p><Status>{gig.gigType.toUpperCase()}</Status> <Status>{gig.publicationStatus}</Status> {gig.gigType === "paid" && <>Talent payment: {money.format(gig.paymentRange.min)} – {money.format(gig.paymentRange.max)}</>}</p></div>{!isCancelled && <button className="customer-danger" disabled={cancelling} onClick={cancel}>{cancelling ? "Cancelling…" : "Cancel gig"}</button>}</div><LayoutMessage error={error} success={success} />{isCancelled ? <div className="customer-empty"><h2>This gig is cancelled</h2><p>Cancelled gigs are retained for your records and cannot be edited here.</p><button onClick={() => navigate("/customer/gigs")}>Return to My gigs</button></div> : <GigForm key={gig.updatedAt || gig._id} initialValue={gigToForm(gig)} onSubmit={save} submitLabel="Save changes" />}</section>;
}
