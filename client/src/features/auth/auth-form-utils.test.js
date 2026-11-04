import test from "node:test";
import assert from "node:assert/strict";
import { validateRegistration } from "./auth-form-utils.js";

const valid = { name: "Demo", email: "demo@example.com", phone: "08000000000", password: "Example-password-123", confirmPassword: "Example-password-123", role: "customer" };
test("registration accepts matching passwords for each public role", () => {
  for (const role of ["customer", "talent"]) assert.deepEqual(validateRegistration({ ...valid, role }), {});
});
test("registration requires password confirmation", () => {
  assert.equal(validateRegistration({ ...valid, confirmPassword: "" }).confirmPassword, "Confirm your password.");
});
test("registration blocks mismatched confirmation", () => {
  assert.equal(validateRegistration({ ...valid, confirmPassword: "different" }).confirmPassword, "Passwords do not match.");
});
