import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export function TalentSubscriptionCallback({ reference, onVerified }) {
  const [state, setState] = useState({ loading: true, error: "", payment: null });

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
        setState({ loading: false, error: "", payment: result.payment });
        if (result.payment.status === "successful") onVerified?.(result);
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
  return <p>{state.payment.status === "successful" ? "Your subscription is active." : "Payment was not successful."}</p>;
}
