import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createTalentSubscriptionPaymentRouter } from "./routes/talent-subscription-payment.routes.js";
import { Subscription } from "./models/subscription.model.js";

test("cancellation requires confirmation, role authorization, and uses only authenticated owner", async () => {
  const cancelled = [];
  const app = express(); app.use(express.json());
  app.use((request, _response, next) => { request.user = { _id: "authenticated-owner", role: request.get("x-test-role") || "talent" }; next(); });
  app.use(createTalentSubscriptionPaymentRouter({ paymentService: { getStatus: async ({ talentId }) => ({ talentId, hasActiveSubscription: false }) }, cancelSubscription: async id => { cancelled.push(id); }, requireTalent: (request, response, next) => request.user.role === "talent" ? next() : response.sendStatus(403) }));
  const server=app.listen(0,"127.0.0.1"); await new Promise(resolve=>server.once("listening",resolve));
  try {
    const url=`http://127.0.0.1:${server.address().port}/subscription/cancel`;
    for(const confirm of [undefined,false,"true"]) {
      const result=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirm}),signal:AbortSignal.timeout(3000)});
      assert.equal(result.status,400);
    }
    assert.deepEqual(cancelled,[]);
    const forbidden=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","x-test-role":"customer"},body:JSON.stringify({confirm:true}),signal:AbortSignal.timeout(3000)});
    assert.equal(forbidden.status,403); assert.deepEqual(cancelled,[]);
    const result=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirm:true,talentId:"forged-owner"}),signal:AbortSignal.timeout(3000)});
    assert.equal(result.status,200); assert.deepEqual(cancelled,["authenticated-owner"]);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
test("cancelled subscriptions preserve their original period and cancellation timestamp", async () => {
  const subscription=new Subscription({talentId:"507f1f77bcf86cd799439011",paymentReference:"test",status:"cancelled",startsAt:new Date(),expiresAt:new Date(Date.now()+86400000),cancelledAt:new Date()});
  await subscription.validate(); assert.ok(subscription.cancelledAt);
});
