import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

export function GigDetailsPage() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/talent/gigs/${id}`)
      .then((response) => setGig(response.data.data.gig))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load this gig."));
  }, [id]);

  if (error) return <main className="mx-auto max-w-3xl p-6"><p className="rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p></main>;
  if (!gig) return <p className="p-6 text-slate-600">Loading gig…</p>;

  const paid = gig.gigType === "paid";
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link className="font-semibold text-indigo-700" to="/talent/gigs">← Back to gigs</Link>
      <article className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{paid ? "PAID" : "FREE"}</span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{gig.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-slate-700">{gig.description}</p>
        <dl className="mt-6 grid gap-3 text-slate-700 sm:grid-cols-2">
          <div><dt className="font-semibold">Event type</dt><dd>{gig.eventType}</dd></div>
          <div><dt className="font-semibold">Event date</dt><dd>{new Date(gig.eventDate).toLocaleDateString()} at {gig.eventTime}</dd></div>
          <div><dt className="font-semibold">Application deadline</dt><dd>{new Date(gig.applicationDeadline).toLocaleDateString()}</dd></div>
          {paid && <div><dt className="font-semibold">Talent fee</dt><dd>{formatNaira(gig.paymentRange.min)} – {formatNaira(gig.paymentRange.max)}</dd></div>}
          {gig.location && <div><dt className="font-semibold">Event location</dt><dd>{gig.location}</dd></div>}
        </dl>
        <section className="mt-7">
          <h2 className="text-xl font-bold text-slate-900">Positions needed</h2>
          <ul className="mt-3 space-y-3">{gig.positions.map((position) => <li className="rounded border border-slate-200 p-4" key={position._id}>
            <p className="font-semibold capitalize text-slate-900">{position.instrument || position.roleType.replace("_", " ")} · {position.slots} slot{position.slots === 1 ? "" : "s"}</p>
            <p className="mt-1 text-sm text-slate-600">Audition songs: {position.auditionSongs.join(", ")}</p>
            <Link className="mt-3 inline-block font-semibold text-indigo-700" to={`/talent/gigs/${gig._id}/positions/${position._id}/apply`}>Apply for this position</Link>
          </li>)}</ul>
        </section>
      </article>
    </main>
  );
}
