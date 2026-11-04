import test from "node:test";
import assert from "node:assert/strict";
import { gigDate, gigMoney, gigRoles } from "./gig-display.js";

test("gig labels handle missing dates and fees without NaN or invalid-date text", () => {
  for (const value of [undefined, "", "invalid"]) assert.equal(gigDate(value), "Date to be confirmed");
  assert.equal(gigMoney(undefined), "To be confirmed");
  assert.ok(gigMoney(25000).includes("25,000"));
});
test("gig role summaries support safe public previews and full authenticated gigs", () => {
  assert.deepEqual(gigRoles({ roles: ["Guitar", "Guitar", "Backup vocalist"] }), ["Guitar", "Backup vocalist"]);
  assert.deepEqual(gigRoles({ positions: [{ roleType: "instrumentalist", instrument: "Keyboard" }, { roleType: "backup_vocalist" }] }), ["Keyboard", "Backup vocalist"]);
  assert.deepEqual(gigRoles({}), []);
});
