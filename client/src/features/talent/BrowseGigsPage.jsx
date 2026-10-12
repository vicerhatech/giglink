import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function GigCard({ gig }) {
  const paid = gig.gigType === "paid";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{gig.eventType}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{gig.title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{paid ? "PAID" : "FREE"}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-slate-600">{gig.description}</p>
      <dl className="mt-4 space-y-1 text-sm text-slate-600">
        <div><dt className="inline font-semibold text-slate-700">Date: </dt><dd className="inline">{new Date(gig.eventDate).toLocaleDateString()}</dd></div>
        <div><dt className="inline font-semibold text-slate-700">Time: </dt><dd className="inline">{gig.eventTime}</dd></div>
        {paid && <div><dt className="inline font-semibold text-slate-700">Talent fee: </dt><dd className="inline">{formatNaira(gig.paymentRange.min)} – {formatNaira(gig.paymentRange.max)}</dd></div>}
      </dl>
      <Link className="mt-5 inline-block font-semibold text-indigo-700 hover:text-indigo-900" to={`/talent/gigs/${gig._id}`}>View gig</Link>
    </article>
  );
}

export function BrowseGigsPage() {
  const [gigs, setGigs] = useState([]);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGigs() {
      try {
        const response = await api.get("/talent/gigs");
        setGigs(response.data.data.gigs || []);
        setSubscriptionRequired(Boolean(response.data.data.subscriptionRequired && !response.data.data.hasActiveSubscription));
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load available gigs.");
      } finally {
        setLoading(false);
      }
    }
    loadGigs();
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Loading available gigs…</p>;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Browse gigs</h1>
      <p className="mt-2 text-slate-600">Event locations are shared after your application is accepted.</p>
      {subscriptionRequired && <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <h2 className="font-bold">Paid-gig access requires a subscription</h2>
        <p className="mt-1">Subscribe for ₦5,000 per month to browse paid gigs. Free gigs remain available.</p>
      </section>}
      {error && <p className="mt-6 rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
      {!error && gigs.length === 0 && <p className="mt-6 text-slate-600">No gigs are available right now.</p>}
      <section className="mt-6 grid gap-5 md:grid-cols-2">{gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}</section>
    </main>
  );
}
