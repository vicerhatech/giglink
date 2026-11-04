import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { TalentSubscriptionPrompt } from "./TalentSubscriptionPrompt";

export function SubscriptionSettings() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api.get("/payments/subscription/me", { signal: controller.signal, timeout: 15000 }).then(response => setStatus(response.data.data)).catch(error => { if (!controller.signal.aborted) setError(error.response?.data?.message || "Could not load subscription status."); });
    return () => controller.abort();
  }, [attempt]);
  async function cancel() {
    if (!window.confirm("Cancel your current subscription? New Paid gigs will be hidden immediately. Accepted gigs and Free gigs remain accessible. This does not issue a refund; there is no automatic renewal to stop.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await api.post("/payments/subscription/cancel", { confirm: true }, { timeout: 15000 });
      setStatus(response.data.data); setMessage(response.data.message);
    } catch (error) { setError(error.response?.data?.message || "Could not cancel your subscription."); }
    finally { setBusy(false); }
  }
  return <section className="settings-extra"><h2>Your subscription</h2><p>₦5,000 for 30 days. Paystack Test Mode only. These passes do not renew or charge you automatically.</p>{error && <p role="alert">{error} <button type="button" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}{message && <p role="status">{message}</p>}{!status && !error && <p role="status">Loading subscription…</p>}{status && <><p><strong>{status.hasActiveSubscription ? "Active" : status.subscription?.status === "cancelled" ? "Cancelled" : status.paidGigSubscriptionRequired ? "No active pass" : "No subscription required yet"}</strong>{status.hasActiveSubscription && status.subscription?.expiresAt && <> · valid until {new Date(status.subscription.expiresAt).toLocaleDateString()}</>}</p>{status.hasActiveSubscription ? <button className="danger-action" type="button" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Cancel subscription"}</button> : status.paidGigSubscriptionRequired && <TalentSubscriptionPrompt />}</>}</section>;
}
