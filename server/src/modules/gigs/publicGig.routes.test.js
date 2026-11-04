import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createPublicGigRouter } from "./publicGig.router.js";

test("public event previews constrain published queries and never serialize private fields", async () => {
  const queries = [];
  let selected, offset, limit;
  const model = {
    find(filter) {
      queries.push(filter);
      return {
        select(fields) { selected = fields; return this; },
        sort() { return this; },
        skip(value) { offset = value; return this; },
        limit(value) { limit = value; return this; },
        async lean() { return [{ _id: "gig-preview", title: "Evening performance", eventType: "Reception", eventDate: "2027-12-15", gigType: "paid", location: "PRIVATE", customerId: "PRIVATE", paymentRange: { min: 25000, max: 30000 }, description: "PRIVATE", positions: [{ roleType: "instrumentalist", instrument: "Guitar", auditionSongs: ["PRIVATE"] }, { roleType: "backup_vocalist" }] }]; },
      };
    },
    async countDocuments(filter) { queries.push(filter); return 25; },
  };
  const app = express();
  app.use("/api/public/gigs", createPublicGigRouter({ model }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/public/gigs?type=paid&page=2`, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(queries, [{ publicationStatus: "published", gigType: "paid" }, { publicationStatus: "published", gigType: "paid" }]);
    assert.equal(selected, "title eventType eventDate gigType positions.roleType positions.instrument");
    assert.equal(offset, 12);
    assert.equal(limit, 12);
    assert.equal(body.data.pages, 3);
    assert.deepEqual(body.data.gigs[0].roles, ["Guitar", "Backup vocalist"]);
    assert.equal(JSON.stringify(body).includes("PRIVATE"), false);
    assert.deepEqual(Object.keys(body.data.gigs[0]).sort(), ["_id", "eventDate", "eventType", "gigType", "roles", "title"]);
  } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
});
