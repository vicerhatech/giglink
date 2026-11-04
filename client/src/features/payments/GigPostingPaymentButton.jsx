import { useState } from "react";
import { api } from "../../lib/api.js";

export function GigPostingPaymentButton({ gigId, children = "Pay posting fee" }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function beginPayment() {
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/payments/gig-post/initialize", { gigId }, { timeout: 20000 });
      if (!response.data?.data?.authorizationUrl) throw new Error("Checkout URL missing.");
      window.sessionStorage.setItem("giglink_posting_payment_gig_id", gigId);
      window.location.assign(response.data.data.authorizationUrl);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to initialize the posting payment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="payment-checkout">
      <button className="payment-checkout-button" type="button" onClick={beginPayment} disabled={isLoading}>
        {isLoading ? "Preparing payment…" : children}
      </button>
      <small>Paystack Test Mode · Your gig is published only after backend payment verification.</small>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
