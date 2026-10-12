function discoveryError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function asPlainObject(gig) {
  return typeof gig.toObject === "function" ? gig.toObject() : gig;
}

function positionForTalent(position) {
  return {
    _id: position._id,
    roleType: position.roleType,
    instrument: position.instrument,
    slots: position.slots,
    auditionSongs: position.auditionSongs,
  };
}

function publicGig(gig, includeLocation = false) {
  const source = asPlainObject(gig);
  const result = {
    _id: source._id,
    title: source.title,
    eventType: source.eventType,
    description: source.description,
    eventDate: source.eventDate,
    eventTime: source.eventTime,
    applicationDeadline: source.applicationDeadline,
    gigType: source.gigType,
    paymentRange: source.gigType === "paid" ? source.paymentRange : null,
    positions: (source.positions || []).map(positionForTalent),
  };

  if (includeLocation) result.location = source.location;
  return result;
}

function assertTalent(talent) {
  if (!talent || talent.role !== "talent") {
    throw discoveryError("Only talent accounts can browse gigs.", 403);
  }

  if (!talent._id && !talent.id) {
    throw discoveryError("Authenticated talent identity is required.", 401);
  }
}

export function createTalentDiscoveryService({
  gigRepository,
  hasActiveTalentSubscription,
  hasAcceptedApplication,
}) {
  if (!gigRepository || typeof gigRepository.listPublishedGigs !== "function" || typeof gigRepository.findPublishedGigById !== "function") {
    throw new TypeError("Talent discovery requires published-gig query functions.");
  }
  if (typeof hasActiveTalentSubscription !== "function") {
    throw new TypeError("Talent discovery requires hasActiveTalentSubscription.");
  }
  if (typeof hasAcceptedApplication !== "function") {
    throw new TypeError("Talent discovery requires hasAcceptedApplication.");
  }

  async function accessFor(talent) {
    assertTalent(talent);
    const talentId = talent._id || talent.id;
    const subscriptionRequired = Boolean(talent.paidGigSubscriptionRequired);
    const hasActiveSubscription = subscriptionRequired
      ? Boolean(await hasActiveTalentSubscription(talentId))
      : false;

    return {
      talentId,
      subscriptionRequired,
      hasActiveSubscription,
      paidGigAccess: !subscriptionRequired || hasActiveSubscription,
    };
  }

  return {
    async listGigs(talent) {
      const access = await accessFor(talent);
      const gigTypes = access.paidGigAccess ? ["free", "paid"] : ["free"];
      const gigs = await gigRepository.listPublishedGigs({ gigTypes });

      return {
        gigs: gigs.map((gig) => publicGig(gig)),
        ...access,
      };
    },

    async getGig(talent, gigId) {
      const access = await accessFor(talent);
      const gig = await gigRepository.findPublishedGigById(gigId);
      if (!gig) throw discoveryError("Published gig not found.", 404);

      const source = asPlainObject(gig);
      if (source.gigType === "paid" && !access.paidGigAccess) {
        throw discoveryError("An active subscription is required to access paid gigs.", 403);
      }

      const accepted = await hasAcceptedApplication(access.talentId, source._id);
      return {
        gig: publicGig(source, Boolean(accepted)),
        ...access,
      };
    },
  };
}
