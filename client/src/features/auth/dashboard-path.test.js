import test from "node:test";
import assert from "node:assert/strict";
import { dashboardPathForRole } from "./dashboard-path.js";

test("workspace links use the signed-in role rather than the public home or signup page", () => {
  for (const role of ["customer", "talent", "admin"]) assert.equal(dashboardPathForRole(role), `/${role}/dashboard`);
  assert.equal(dashboardPathForRole(undefined), "/");
});
