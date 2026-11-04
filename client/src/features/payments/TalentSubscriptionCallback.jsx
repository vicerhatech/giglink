import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Link } from "react-router-dom";

export function TalentSubscriptionCallback({ reference, onVerified }) {
  const [state, setState] = useState({ loading: true, error: "", payment: null, active: false });

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, error: "Payment reference is missing.", payment: null });
      return undefined;
    }

    let isCurrent = true;
    api.get(`/payments/subscription/verify/${encodeURIComponent(reference)}`)
      .then((response) => {
        if (!isCurrent) return;
        const result = response.data.data;
        setState({ loading: false, error: "", payment: result.payment, active: result.access?.hasActiveSubscription === true });
        if (result.payment.status === "successful" && result.access?.hasActiveSubscription) onVerified?.(result);
      })
      .catch((requestError) => {
        if (!isCurrent) return;
        setState({
          loading: false,
          error: requestError.response?.data?.message || "Unable to verify your subscription payment.",
          payment: null,
        });
      });

    return () => { isCurrent = false; };
  }, [reference, onVerified]);

  if (state.loading) return <p>Verifying your subscription payment…</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  return <section className="settings-extra" role="status"><h1>Subscription payment</h1><p>{state.payment.status === "successful" ? state.active ? "Your subscription is active." : "This payment was verified, but its subscription is no longer active. A cancelled or expired pass is not reactivated by reopening this callback." : "Payment was not successful."}</p><Link className="button button-primary" to="/settings">Manage subscription</Link></section>;
}
