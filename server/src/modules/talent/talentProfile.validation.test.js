import test from "node:test";
import assert from "node:assert/strict";
import { saveTalentProfile } from "./talentProfile.service.js";

const profile = { talentType: "backup_vocalist", instruments: [], bio: "Hello", yearsExperience: 2, genres: [], city: "Lagos" };
test("profile rejects experience outside schema bounds before database access", async () => {
  for (const yearsExperience of [-1, 101, 1.5, "invalid"]) {
    await assert.rejects(saveTalentProfile("not-used", { ...profile, yearsExperience }), error => error.statusCode === 400);
  }
});
test("oversized profile bio returns controlled validation error before database access", async () => {
  await assert.rejects(saveTalentProfile("not-used", { ...profile, bio: "a".repeat(2001) }), error => error.statusCode === 400 && error.message.includes("2000"));
});
test("city and instrument validation remain enforced", async () => {
  for (const fields of [{ city: "a".repeat(121) }, { talentType: "instrumentalist", instruments: [] }]) {
    await assert.rejects(saveTalentProfile("not-used", { ...profile, ...fields }), error => error.statusCode === 400);
  }
});
