import test from "node:test";
import assert from "node:assert/strict";
import { createApplicationController } from "./application.controller.js";

test("application bodies cannot override authenticated identity or URL targets", async () => {
  const user = { _id: "real-talent", role: "talent" };
  let input;
  const controller = createApplicationController({ submitApplication: async values => { input = values; return { _id: "new-application" }; } });
  const response = { status() { return this; }, json() {} };
  await controller.submit({ user, params: { gigId: "real-gig", positionId: "real-role" }, body: { talent: { _id: "forged" }, gigId: "forged", positionId: "forged", demoVideos: [] } }, response, error => { throw error; });
  assert.equal(input.talent, user);
  assert.equal(input.gigId, "real-gig");
  assert.equal(input.positionId, "real-role");
});
