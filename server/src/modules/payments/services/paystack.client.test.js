import test from "node:test";
import assert from "node:assert/strict";
import { createPaystackClient } from "./paystack.client.js";

test("Paystack initialization preserves trusted amount and sends a deadline", async () => {
  const client = createPaystackClient({ secretKey: "test-fixture", fetchImplementation: async (url, options) => {
    assert.equal(url, "https://api.paystack.co/transaction/initialize");
    assert.equal(JSON.parse(options.body).amount, 500000);
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ status: true, data: { authorization_url: "https://checkout.paystack.com/example" } }) };
  } });
  assert.ok((await client.initializeTransaction({ email: "qa@example.com", amountInKobo: 500000, reference: "fixture" })).authorization_url);
});
test("Paystack network failure is controlled", async () => {
  const client = createPaystackClient({ secretKey: "test-fixture", fetchImplementation: async () => { throw new TypeError("private network detail"); } });
  await assert.rejects(client.verifyTransaction("fixture"), error => error.statusCode === 502 && error.message === "Unable to reach Paystack.");
});
test("Paystack timeout is controlled", async () => {
  const client = createPaystackClient({ secretKey: "test-fixture", fetchImplementation: async () => { throw new DOMException("timeout", "TimeoutError"); } });
  await assert.rejects(client.verifyTransaction("fixture"), error => error.statusCode === 504);
});
test("Paystack invalid JSON and empty payloads are rejected", async () => {
  for (const json of [async () => { throw new SyntaxError("invalid"); }, async () => null, async () => ({ status: true })]) {
    const client = createPaystackClient({ secretKey: "test-fixture", fetchImplementation: async () => ({ ok: true, json }) });
    await assert.rejects(client.verifyTransaction("fixture"), error => error.statusCode === 502);
  }
});
