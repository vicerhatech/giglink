import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { buildEventRoleFilter } from "./event-role-filter.js";
import { createPublicGigRouter } from "./publicGig.router.js";
import { createTalentDiscoveryService } from "../talent/talentDiscovery.service.js";
import { errorHandler } from "../../middleware/errorMiddleware.js";

test("role/instrument filters target the same role and treat search input literally", () => {
  assert.deepEqual(buildEventRoleFilter(), {});
  assert.deepEqual(buildEventRoleFilter({ role: "backup_vocalist" }), { positions: { $elemMatch: { roleType: "backup_vocalist" } } });
  const match = buildEventRoleFilter({ instrument: "  Keyboard  " }).positions.$elemMatch;
  assert.equal(match.roleType, "instrumentalist");
  assert.ok(match.instrument.test("keyboard")); assert.equal(match.instrument.test("Bass keyboard"), false);
  assert.equal(buildEventRoleFilter({ instrument: ".*" }).positions.$elemMatch.instrument.test("Keyboard"), false);
  for (const query of [{ role: "admin" }, { role: ["instrumentalist"] }, { instrument: {} }, { instrument: "x".repeat(81) }, { role: "backup_vocalist", instrument: "Piano" }]) {
    assert.throws(() => buildEventRoleFilter(query), error => error.statusCode === 400);
  }
});

test("public filters affect both count and page queries while retaining publication/type checks", async () => {
  const queries = [];
  const model = {
    find(filter) { queries.push(filter); return { select() { return this; }, sort() { return this; }, skip(value) { assert.equal(value, 12); return this; }, limit() { return this; }, async lean() { return []; } }; },
    async countDocuments(filter) { queries.push(filter); return 13; },
  };
  const app = express(); app.use("/gigs", createPublicGigRouter({ model })); app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1"); await new Promise(r => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/gigs`;
  try {
    const response = await fetch(`${base}?page=2&type=paid&role=instrumentalist&instrument=Keyboard`);
    assert.equal(response.status, 200); assert.equal((await response.json()).data.pages, 2);
    assert.equal(queries.length, 2); assert.deepEqual(queries[0], queries[1]);
    assert.equal(queries[0].publicationStatus, "published"); assert.equal(queries[0].gigType, "paid");
    assert.equal(queries[0].positions.$elemMatch.roleType, "instrumentalist");
    assert.ok(queries[0].positions.$elemMatch.instrument.test("keyboard"));
    assert.equal((await fetch(`${base}?role=admin`)).status, 400);
  } finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
});

test("Talent role filters cannot override subscription-gated gig types", async () => {
  let query;
  const service = createTalentDiscoveryService({
    gigRepository: { async listPublishedGigs(input) { query = input; return []; }, async findPublishedGigById() { return null; } },
    hasActiveTalentSubscription: async () => false, hasAcceptedApplication: async () => false,
  });
  await service.listGigs({ id: "talent", role: "talent", paidGigSubscriptionRequired: true }, { role: "instrumentalist", instrument: "Piano", gigTypes: ["paid"] });
  assert.deepEqual(query.gigTypes, ["free"]);
  assert.ok(query.roleFilter.positions.$elemMatch.instrument.test("piano"));
});
