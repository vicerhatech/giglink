export const PAYSTACK_BASE_URL = "https://api.paystack.co";
export const PAYSTACK_CURRENCY = "NGN";

export class PaystackRequestError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "PaystackRequestError";
    this.statusCode = statusCode;
  }
}

export function nairaToKobo(amountInNaira) {
  if (!Number.isInteger(amountInNaira) || amountInNaira < 1) {
    throw new Error("Paystack amount must be a positive whole-naira amount.");
  }

  return amountInNaira * 100;
}

export function createPaystackClient({
  secretKey = process.env.PAYSTACK_SECRET_KEY,
  fetchImplementation = globalThis.fetch,
  timeoutMs = 15000,
} = {}) {
  if (!secretKey) {
    throw new PaystackRequestError("Paystack is not configured on the server.", 503);
  }

  if (typeof fetchImplementation !== "function") {
    throw new PaystackRequestError("A server-side HTTP client is required for Paystack.", 500);
  }

  async function request(path, options = {}) {
    let response;
    let body;
    try {
      response = await fetchImplementation(`${PAYSTACK_BASE_URL}${path}`, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      try {
        body = await response.json();
      } catch (error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") throw error;
        throw new PaystackRequestError("Paystack returned an invalid response.");
      }
    } catch (error) {
      if (error instanceof PaystackRequestError) throw error;
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        throw new PaystackRequestError("Paystack took too long to respond. Please try again.", 504);
      }
      throw new PaystackRequestError("Unable to reach Paystack.");
    }

    if (!response.ok || !body?.status || !body.data) {
      throw new PaystackRequestError(body?.message || "Paystack request failed.");
    }

    return body.data;
  }

  return {
    initializeTransaction({ email, amountInKobo, reference, callbackUrl }) {
      const payload = {
        email,
        amount: amountInKobo,
        currency: PAYSTACK_CURRENCY,
        reference,
      };

      if (callbackUrl) payload.callback_url = callbackUrl;

      return request("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    verifyTransaction(reference) {
      return request(`/transaction/verify/${encodeURIComponent(reference)}`);
    },
  };
}
