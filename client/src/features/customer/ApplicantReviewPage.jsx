import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { listGigApplicants, setApplicantStatus } from "./applicantApi";
import { apiMessage } from "./gigApi";

const displayName = (application) => application.talent?.name || application.talentProfile?.name || application.talentName || "Applicant";
const profile = (application) => application.talentProfile || application.talent?.profile || {};

function statusClass(status) { return `customer-status customer-application-${status || "pending"}`; }

export function ApplicantReviewPage() {
  const { id: gigId } = useParams();
  const [data, setData] = useState(null); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busyId, setBusyId] = useState("");
  const groups = useMemo(() => {
    if (!data) return [];
    const applications = data.applications || [];
    return (data.gig?.positions || []).map((position) => ({
      position,
      applications: applications.filter((application) => String(application.positionId?._id || application.positionId) === String(position._id)),
    }));
  }, [data]);
  useEffect(() => { listGigApplicants(gigId).then(setData).catch((reason) => setError(apiMessage(reason))); }, [gigId]);
  async function changeStatus(applicationId, status) {
    setBusyId(applicationId); setError(""); setSuccess("");
    try {
      const result = await setApplicantStatus(applicationId, status);
      setData((current) => ({ ...current, applications: current.applications.map((application) => application._id === applicationId ? { ...application, ...result.application } : application) }));
      setSuccess(`Application ${status}.`);
    } catch (reason) { setError(apiMessage(reason)); } finally { setBusyId(""); }
  }
  if (!data && !error) return <section><p>Loading applicants…</p></section>;
  if (!data) return <section><Link to={`/customer/gigs/${gigId}`}>← Back to gig</Link><p className="customer-error customer-banner" role="alert">{error}</p></section>;
  return <section className="customer-applicants"><Link to={`/customer/gigs/${gigId}`}>← Back to gig</Link><h1>Applicants for {data.gig?.title || "this gig"}</h1><p>Review audition demos and make a decision for each position.</p>{error && <p className="customer-error customer-banner" role="alert">{error}</p>}{success && <p className="customer-success customer-banner" role="status">{success}</p>}{groups.length === 0 ? <div className="customer-empty"><h2>No positions or applicants yet</h2><p>Applicants will appear here when talents apply.</p></div> : groups.map(({ position, applications }) => {
    const accepted = applications.filter((application) => application.status === "accepted").length;
    const full = accepted >= position.slots;
    return <section className="customer-applicant-group" key={position._id}><h2>{position.roleType === "instrumentalist" ? `${position.instrument} instrumentalist` : "Backup vocalist"}</h2><p>{accepted} of {position.slots} slot{position.slots === 1 ? "" : "s"} accepted. {full && <strong>This position is full.</strong>}</p><p>Requested songs: {position.auditionSongs.join(", ")}</p>{applications.length === 0 ? <p className="customer-note">No applications for this position.</p> : applications.map((application) => <ApplicantCard key={application._id} application={application} full={full} busy={Boolean(busyId)} active={busyId === application._id} onAction={changeStatus} />)}</section>;
  })}</section>;
}

function ApplicantCard({ application, full, busy, active, onAction }) {
  const applicantProfile = profile(application); const status = application.status || "pending";
  const demos = application.demoVideos || [];
  return <article className="customer-applicant-card"><div className="customer-applicant-heading"><div><h3>{displayName(application)}</h3><p>{applicantProfile.talentType || application.talentType || "Talent"}{applicantProfile.instruments?.length ? ` · ${applicantProfile.instruments.join(", ")}` : ""}</p>{applicantProfile.bio && <p>{applicantProfile.bio}</p>}</div><span className={statusClass(status)}>{status}</span></div><h4>Audition demos (3)</h4>{demos.length === 0 ? <p className="customer-note">No demo videos are available.</p> : <ol className="customer-demos">{demos.map((demo, index) => <li key={demo._id || `${demo.songTitle}-${index}`}><strong>{demo.songTitle || `Requested song ${index + 1}`}</strong>{demo.videoUrl ? <video controls preload="metadata" src={demo.videoUrl}>Your browser cannot play this audition video.</video> : <span className="customer-note">Video unavailable</span>}</li>)}</ol>}{status === "pending" && <div className="customer-actions">{full ? <span className="customer-note">Acceptance unavailable because this position is full.</span> : <button className="customer-primary" disabled={busy} onClick={() => onAction(application._id, "accepted")}>{active ? "Saving…" : "Accept"}</button>}<button className="customer-danger" disabled={busy} onClick={() => onAction(application._id, "rejected")}>{active ? "Saving…" : "Reject"}</button></div>}</article>;
}
