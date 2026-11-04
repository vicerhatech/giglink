import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-slate-200 text-slate-700",
};

export function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawingId, setWithdrawingId] = useState("");

  async function loadApplications() {
    setError("");
    try {
      const response = await api.get("/talent/applications");
      setApplications(response.data.data.applications || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApplications(); }, []);

  async function withdraw(applicationId) {
    setError("");
    setMessage("");
    setWithdrawingId(applicationId);
    try {
      const response = await api.patch(`/talent/applications/${applicationId}/withdraw`);
      setApplications((current) => current.map((application) => application._id === applicationId
        ? { ...application, status: response.data.data.application.status, canReapply: false }
        : application));
      setMessage("Application withdrawn. You can apply again below if this role is still available.");
      await loadApplications();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not withdraw this application.");
    } finally {
      setWithdrawingId("");
    }
  }

  if (loading) return <main className="mx-auto max-w-4xl px-6 py-10"><section className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm" role="status">Loading your applications...</section></main>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">My applications</h1>
      <p className="mt-2 text-slate-600">Track your audition submissions and application decisions.</p>
      {error && <p className="mt-6 rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
      {message && <p className="mt-6 rounded bg-green-50 p-3 text-green-700" role="status">{message}</p>}
      {!error && applications.length === 0 && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm"><h2 className="font-bold text-slate-900">No applications yet</h2><p className="mt-1">Find a role that fits you, then send the 1–3 demo videos requested by the host.</p><Link className="mt-4 inline-block rounded bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-700" to="/talent/gigs">Browse gigs</Link></section>}
      <section className="mt-6 space-y-4">
        {applications.map((application) => <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={application._id}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{application.gig?.eventType || "Gig"}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{application.gig?.title || "Unavailable gig"}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[application.status] || statusStyles.withdrawn}`}>{application.status}</span></div>
          <p className="mt-3 text-sm text-slate-600">Submitted {new Date(application.createdAt).toLocaleDateString()}</p>
          {application.gig?.location && <p className="mt-3 rounded bg-emerald-50 p-3 text-sm text-emerald-900"><span className="font-semibold">Event location: </span>{application.gig.location}</p>}
          <div className="mt-4"><h3 className="font-semibold text-slate-800">Demo videos</h3><ul className="mt-2 space-y-1 text-sm">{application.demoVideos.map((video) => <li key={video.cloudinaryPublicId}><a className="text-indigo-700 hover:text-indigo-900" href={video.videoUrl} rel="noreferrer" target="_blank">{video.songTitle}</a></li>)}</ul></div>
          {application.status === "pending" && <button className="mt-5 rounded border border-red-300 px-3 py-2 font-semibold text-red-700 disabled:opacity-60" disabled={withdrawingId === application._id} onClick={() => withdraw(application._id)} type="button">{withdrawingId === application._id ? "Withdrawing..." : "Withdraw application"}</button>}
          {application.status === "withdrawn" && application.canReapply && <Link className="mt-5 inline-block rounded bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-700" to={`/talent/gigs/${application.gigId}/positions/${application.positionId}/apply`}>Reapply</Link>}
        </article>)}
      </section>
    </main>
  );
}
