import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

export function GigPostingPaymentCallback({ reference, onVerified }) {
  const [state, setState] = useState({ loading: true, error: "", payment: null, publicationStatus: null, verified: false });
  const [gigId] = useState(() => window.sessionStorage.getItem("giglink_posting_payment_gig_id"));

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, error: "Payment reference is missing.", payment: null, publicationStatus: null, verified: false });
      return undefined;
    }

    let isCurrent = true;
    api.get(`/payments/gig-post/verify/${encodeURIComponent(reference)}`)
      .then((response) => {
        if (!isCurrent) return;
        const result = response.data.data;
        const verified = result.payment?.status === "successful" && result.publicationStatus === "published";
        setState({ loading: false, error: "", payment: result.payment, publicationStatus: result.publicationStatus, verified });
        if (verified) onVerified?.(result);
      })
      .catch((requestError) => {
        if (!isCurrent) return;
        setState({
          loading: false,
          error: requestError.response?.data?.message || "Unable to verify the posting payment.",
          payment: null,
          publicationStatus: null,
          verified: false,
        });
      });

    return () => { isCurrent = false; };
  }, [reference, onVerified]);

  if (state.loading) return <p>Verifying your posting payment...</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  if (state.verified) return <section role="status"><p>Posting payment verified. Your gig is paid and published.</p><Link to={gigId ? `/customer/gigs/${gigId}` : "/customer/gigs"}>View refreshed gig</Link></section>;
  return <section><p role="alert">Payment was not successful. Your gig remains a private draft.</p><Link to="/customer/gigs">Return to My Gigs to retry</Link></section>;
}
