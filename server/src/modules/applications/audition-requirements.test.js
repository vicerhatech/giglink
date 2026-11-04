import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { Gig } from "../gigs/gig.model.js";
import { validateGigDraft } from "../gigs/gig.validation.js";
import { Application } from "./Application.js";
import { createApplicationService } from "./application.service.js";
import { blankGig, validateAndSerialize } from "../../../../client/src/features/customer/gigForm.js";

const titles = ["Song one", "A short improvisation", "Harmony sample"];
const videos = (songs) => songs.map((songTitle, i) => ({ songTitle, videoUrl: `https://example.test/demo-${i}.mp4`, cloudinaryPublicId: `qa-${i}` }));
const makeGig = (songs) => ({ _id: new mongoose.Types.ObjectId(), customerId: new mongoose.Types.ObjectId(), title: "Audition test", description: "Test event", eventType: "Reception", eventDate: new Date("2027-12-15"), eventTime: "18:00", applicationDeadline: new Date("2027-11-15"), location: "Private venue", gigType: "free", paymentRange: null, postingFee: 5000, publicationStatus: "published", postingPaymentStatus: "paid", positions: [{ _id: new mongoose.Types.ObjectId(), roleType: "instrumentalist", instrument: "Guitar", slots: 1, auditionSongs: songs }] });

for (const count of [1, 2, 3]) {
  test(`${count} requested sample(s) work in customer validation, schemas and application service`, async () => {
    const songs = titles.slice(0, count);
    const gig = makeGig(songs);
    const validated = validateGigDraft(gig);
    assert.equal(validated.positions[0].auditionSongs.length, count);
    await new Gig(gig).validate();
    const talent = { id: new mongoose.Types.ObjectId(), role: "talent" };
    let writes = 0;
    const service = createApplicationService({ gigRepository: { findGigById: async () => gig, findPublishedGigById: async () => gig }, store: { findActive: async () => null, create: async (data) => { const app = new Application(data); await app.validate(); writes++; return app; } } });
    const input = { talent, gigId: gig._id, positionId: gig.positions[0]._id };
    const result = await service.submitApplication({ ...input, demoVideos: videos(songs) });
    assert.equal(result.demoVideos.length, count);
    for (const invalid of [[], videos([...songs, "Extra sample"]), videos(songs).map((demo, i) => i === 0 ? { ...demo, songTitle: "Wrong title" } : demo)]) {
      await assert.rejects(service.submitApplication({ ...input, demoVideos: invalid }), (error) => error.statusCode === 400);
    }
    if (count > 1) await assert.rejects(service.submitApplication({ ...input, demoVideos: videos(songs.map(() => songs[0])) }), (error) => error.statusCode === 400);
    assert.equal(writes, 1, "invalid demos must not reach persistence");
    const form = { ...blankGig(), title: "Test gig", description: "Test", eventType: "Reception", location: "Private venue", eventDate: "2027-12-15", eventTime: "18:00", applicationDeadline: "2027-11-15", positions: [{ roleType: "instrumentalist", instrument: "Guitar", slots: "1", auditionSongs: songs }] };
    assert.equal(validateAndSerialize(form).payload.positions[0].auditionSongs.length, count);
  });
}

for (const songs of [[], ["1", "2", "3", "4"], [""], ["Song one", "Song one"]]) {
  test(`invalid request list ${JSON.stringify(songs)} is rejected by validation and Gig schema`, async () => {
    const gig = makeGig(songs);
    assert.throws(() => validateGigDraft(gig), (error) => error.statusCode === 400);
    await assert.rejects(new Gig(gig).validate());
  });
}

test("Application schema rejects zero and four demos, and the new form starts with one request", async () => {
  assert.equal(blankGig().positions[0].auditionSongs.length, 1);
  for (const songs of [[], ["1", "2", "3", "4"]]) {
    await assert.rejects(new Application({ gigId: new mongoose.Types.ObjectId(), positionId: new mongoose.Types.ObjectId(), talentId: new mongoose.Types.ObjectId(), demoVideos: videos(songs) }).validate());
  }
});
