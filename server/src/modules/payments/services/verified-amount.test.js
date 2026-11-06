import test from "node:test";
import assert from "node:assert/strict";
import { matchesVerifiedAmount } from "./verified-amount.js";
import { createGigPostingPaymentService } from "./gig-posting-payment.service.js";

test("verified amounts accept exact prices and fully evidenced customer-borne fees", () => {
  assert.equal(matchesVerifiedAmount({ amount: 500000 }, 500000), true);
  assert.equal(matchesVerifiedAmount({ amount: 500000, requested_amount: 500000, fees: 17500 }, 500000), true);
  assert.equal(matchesVerifiedAmount({ amount: 517767, requested_amount: 500000, fees: 17767 }, 500000), true);
  for (const transaction of [
    { amount: 499999 }, { amount: 517767 },
    { amount: 517767, requested_amount: 400000, fees: 117767 },
    { amount: 517767, requested_amount: 500000, fees: 0 },
    { amount: 517767, requested_amount: 500000, fees: 17766 },
    { amount: 517767, requested_amount: 500000 },
    { amount: 500000, requested_amount: 400000 },
    { amount: 500000.5 }, { amount: -1 },
  ]) assert.equal(matchesVerifiedAmount(transaction, 500000), false, JSON.stringify(transaction));
});

test("previously failed payment recovers via provider verification and publishes once", async () => {
  const payment = { reference: "fixture", userId: "customer", gigId: "gig", purpose: "free_gig_post", amount: 5000, status: "failed" };
  const gig = { _id: "gig", customerId: "customer", gigType: "free", postingPaymentStatus: "unpaid", publicationStatus: "draft" };
  let verifies = 0, publishes = 0;
  let transaction = { status: "success", reference: "fixture", amount: 517767, requested_amount: 500000, fees: 17767, currency: "NGN" };
  const service = createGigPostingPaymentService({
    paymentRepository: { async findOne(query) { return query.userId === "customer" ? payment : null; }, async findOneAndUpdate(query, update) { Object.assign(payment, update.$set); return payment; } },
    gigRepository: { async findCustomerOwnedGig() { return gig; }, async markPostingPaymentVerified() { publishes++; gig.publicationStatus = "published"; gig.postingPaymentStatus = "paid"; return gig; } },
    paystackClient: { async initializeTransaction() {}, async verifyTransaction() { verifies++; return transaction; } },
  });
  for (const bad of [{ currency: "USD" }, { reference: "wrong" }, { amount: 400000 }]) {
    const original = transaction; transaction = { ...original, ...bad };
    await assert.rejects(service.verify({ reference: "fixture", customerId: "customer" }), error => error.statusCode === 409);
    assert.equal(publishes, 0); assert.equal(payment.status, "failed"); transaction = original;
  }
  await assert.rejects(service.verify({ reference: "fixture", customerId: "other" }), error => error.statusCode === 404);
  const result = await service.verify({ reference: "fixture", customerId: "customer" });
  assert.equal(result.payment.status, "successful"); assert.equal(result.publicationStatus, "published");
  const before = verifies;
  await service.verify({ reference: "fixture", customerId: "customer" });
  assert.equal(publishes, 1); assert.equal(verifies, before);
});
