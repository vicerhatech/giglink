import test from "node:test";
import assert from "node:assert/strict";
import { deleteOwnAccount } from "./account-deletion.service.js";

test("account deletion requires both exact confirmation and a password before any DB action", async () => {
  for (const body of [undefined, {}, { confirmation: "delete", password: "fixture" }, { confirmation: "DELETE", password: "" }, { confirmation: "DELETE", password: {} }]) {
    await assert.rejects(deleteOwnAccount("unused", body), error => error.statusCode === 400);
  }
});
