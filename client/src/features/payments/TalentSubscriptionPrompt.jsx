import { useState } from "react";
import { api } from "../../lib/api.js";

export function TalentSubscriptionPrompt({ children = "Subscribe for ₦5,000/month" }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function beginSubscription() {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/payments/subscription/initialize");
      window.location.assign(response.data.data.authorizationUrl);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to initialize your subscription payment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h2>Keep access to new Paid gigs</h2>
      <p>After your first accepted Paid gig, subscribe for ₦5,000/month to browse new Paid gigs.</p>
      <p>Free gigs remain available, and your already accepted Paid gig stays accessible.</p>
      <button type="button" onClick={beginSubscription} disabled={isLoading}>
        {isLoading ? "Preparing payment…" : children}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
