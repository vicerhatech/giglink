import { applicationRepository } from "./application.repository.js";

function applicationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function idMatches(left, right) {
  return String(left) === String(right);
}

function activeApplicationKey(gigId, positionId, talentId) {
  return `${gigId}:${positionId}:${talentId}`;
}

function getPosition(gig, positionId) {
  const position = gig.positions?.find((candidate) => idMatches(candidate._id, positionId));
  if (!position) throw applicationError("Gig position not found.", 404);
  return position;
}

function validateDemos(demoVideos, auditionSongs) {
  if (!Array.isArray(demoVideos) || demoVideos.length !== 3) {
    throw applicationError("Exactly three demo videos are required.");
  }

  const requiredSongs = new Set(auditionSongs || []);
  const submittedSongs = new Set();
  if (requiredSongs.size !== 3) throw applicationError("This position does not have a valid three-song audition requirement.");

  for (const demo of demoVideos) {
    if (!demo || typeof demo.songTitle !== "string" || !demo.songTitle.trim() || !demo.videoUrl || !demo.cloudinaryPublicId) {
      throw applicationError("Each demo needs a song title, video URL, and upload public ID.");
    }
    submittedSongs.add(demo.songTitle.trim());
  }

  if (submittedSongs.size !== 3 || [...submittedSongs].some((song) => !requiredSongs.has(song))) {
    throw applicationError("Demo song titles must match the three requested audition songs.");
  }
}

function assertTalent(talent) {
  if (!talent || talent.role !== "talent") throw applicationError("Only talent accounts can submit applications.", 403);
  const id = talent._id || talent.id;
  if (!id) throw applicationError("Authenticated talent identity is required.", 401);
  return id;
}

function applicationView(application, gig) {
  const source = typeof application.toObject === "function" ? application.toObject() : application;
  const gigSource = typeof gig.toObject === "function" ? gig.toObject() : gig;
  const result = {
    _id: source._id,
    gigId: source.gigId,
    positionId: source.positionId,
    demoVideos: source.demoVideos,
    note: source.note,
    status: source.status,
    createdAt: source.createdAt,
    gig: gigSource ? {
      _id: gigSource._id,
      title: gigSource.title,
      eventType: gigSource.eventType,
      eventDate: gigSource.eventDate,
      eventTime: gigSource.eventTime,
      gigType: gigSource.gigType,
    } : null,
  };

  if (source.status === "accepted" && result.gig) result.gig.location = gigSource.location;
  return result;
}

function assertCustomerOwnsGig(gig, customerId) {
  if (!idMatches(gig.customerId, customerId)) throw applicationError("You can only review applications for your own gigs.", 403);
}

export function createApplicationService({
  gigRepository,
  store = applicationRepository,
  onFirstPaidGigAccepted,
}) {
  if (!gigRepository || typeof gigRepository.findGigById !== "function" || typeof gigRepository.findPublishedGigById !== "function") {
    throw new TypeError("Application service requires Gig query functions.");
  }

  async function getGigForApplication(gigId, publishedOnly, options) {
    const gig = publishedOnly
      ? await gigRepository.findPublishedGigById(gigId, options)
      : await gigRepository.findGigById(gigId, options);
    if (!gig) throw applicationError(publishedOnly ? "Published gig not found." : "Gig not found.", 404);
    return typeof gig.toObject === "function" ? gig.toObject() : gig;
  }

  async function submitApplication({ talent, gigId, positionId, demoVideos, note = "", status }) {
    const talentId = assertTalent(talent);
    if (status !== undefined) throw applicationError("Application status is set by the customer review process.");
    const gig = await getGigForApplication(gigId, true);
    if (gig.publicationStatus !== "published") throw applicationError("Applications are only available for published gigs.", 409);
    const deadline = new Date(gig.applicationDeadline).getTime();
    if (!Number.isFinite(deadline) || deadline < Date.now()) throw applicationError("The application deadline has passed.", 409);

    const position = getPosition(gig, positionId);
    validateDemos(demoVideos, position.auditionSongs);

    const existing = await store.findActive(gigId, positionId, talentId);
    if (existing) throw applicationError("You already have an active application for this position.", 409);

    try {
      return await store.create({
        gigId,
        positionId,
        talentId,
        demoVideos,
        note,
        status: "pending",
        activeApplicationKey: activeApplicationKey(gigId, positionId, talentId),
      });
    } catch (error) {
      if (error?.code === 11000) throw applicationError("You already have an active application for this position.", 409);
      throw error;
    }
  }

  async function getApplicationWithDemoVideos(applicationId) {
    const application = await store.findById(applicationId);
    if (!application) throw applicationError("Application not found.", 404);
    return application;
  }

  async function listApplicationsForCustomerGig({ customerId, gigId }) {
    const gig = await getGigForApplication(gigId, false);
    assertCustomerOwnsGig(gig, customerId);
    return store.findByGigId(gigId);
  }

  async function countAcceptedApplicationsForPosition(gigId, positionId) {
    return store.countAcceptedForPosition(gigId, positionId);
  }

  async function hasTalentAcceptedApplicationForGig(talentId, gigId) {
    const applications = await store.findAcceptedForTalent(talentId);
    return applications.some((application) => idMatches(application.gigId, gigId));
  }

  async function listApplicationsForTalent(talent) {
    const talentId = assertTalent(talent);
    const applications = await store.findByTalentId(talentId);
    return Promise.all(applications.map(async (application) => {
      const gig = await gigRepository.findGigById(application.gigId);
      return applicationView(application, gig);
    }));
  }

  async function withdrawApplication({ talent, applicationId }) {
    const talentId = assertTalent(talent);
    return store.withTransaction(async (transaction) => {
      const application = await store.findById(applicationId, transaction);
      if (!application) throw applicationError("Application not found.", 404);
      if (!idMatches(application.talentId, talentId)) throw applicationError("You can only withdraw your own applications.", 403);
      if (application.status !== "pending") throw applicationError("Only pending applications can be withdrawn.", 409);

      const updated = await store.setStatusIfPending(applicationId, "withdrawn", transaction);
      if (!updated) throw applicationError("Only pending applications can be withdrawn.", 409);
      return updated;
    });
  }

  async function changeStatus({ customerId, applicationId, status }) {
    if (!["accepted", "rejected"].includes(status)) throw applicationError("Status must be accepted or rejected.");

    return store.withTransaction(async (transaction) => {
      const application = await store.findById(applicationId, transaction);
      if (!application) throw applicationError("Application not found.", 404);
      const gig = await getGigForApplication(application.gigId, false, transaction);
      assertCustomerOwnsGig(gig, customerId);
      const position = getPosition(gig, application.positionId);

      if (status === "accepted") {
        const acceptedCount = await store.countAcceptedForPosition(application.gigId, application.positionId, transaction);
        if (acceptedCount >= position.slots) throw applicationError("This position has no remaining slots.", 409);
      }

      const updated = await store.setStatusIfPending(applicationId, status, transaction);
      if (!updated) throw applicationError("Only pending applications can be reviewed.", 409);

      let requiresPaidGigSubscription = false;
      if (status === "accepted" && gig.gigType === "paid") {
        const acceptedApplications = await store.findAcceptedForTalent(application.talentId, transaction);
        const otherAcceptedPaidGig = await Promise.all(
          acceptedApplications.filter((item) => !idMatches(item._id, updated._id)).map(async (item) => {
            const acceptedGig = await gigRepository.findGigById(item.gigId, transaction);
            return acceptedGig?.gigType === "paid";
          }),
        );
        requiresPaidGigSubscription = !otherAcceptedPaidGig.some(Boolean);
        if (requiresPaidGigSubscription && typeof onFirstPaidGigAccepted === "function") {
          await onFirstPaidGigAccepted(application.talentId, transaction);
        }
      }

      return { application: updated, requiresPaidGigSubscription };
    });
  }

  return {
    submitApplication,
    listApplicationsForCustomerGig,
    getApplicationWithDemoVideos,
    acceptApplication: (input) => changeStatus({ ...input, status: "accepted" }),
    rejectApplication: (input) => changeStatus({ ...input, status: "rejected" }),
    countAcceptedApplicationsForPosition,
    hasTalentAcceptedApplicationForGig,
    listApplicationsForTalent,
    withdrawApplication,
  };
}
