import { User } from "../modules/users/user.model.js";
import { Gig } from "../modules/gigs/gig.model.js";
import { Subscription } from "../modules/payments/models/subscription.model.js";
import { createApplicationService } from "../modules/applications/application.service.js";
import { configureCustomerApplicationService } from "../modules/customer/customer.application-adapter.js";
import { createPaidGigSubscriptionRequirementService } from "../modules/payments/services/subscription-requirement.service.js";

function withSession(query, options = {}) {
  return options.session ? query.session(options.session) : query;
}

function idsMatch(left, right) {
  return String(left) === String(right);
}

function integrationError(message, statusCode = 403) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function createGigIntegrationRepository(model = Gig) {
  return {
    listPublishedGigs({ gigTypes }) {
      return model.find({ publicationStatus: "published", gigType: { $in: gigTypes } }).sort({ createdAt: -1 });
    },
    findPublishedGigById(gigId, options) {
      return withSession(model.findOne({ _id: gigId, publicationStatus: "published" }), options);
    },
    findGigById(gigId, options) {
      return withSession(model.findById(gigId), options);
    },
    findCustomerOwnedGig({ gigId, customerId }) {
      return model.findOne({ _id: gigId, customerId });
    },
    markPostingPaymentVerified({ gigId, customerId }) {
      return model.findOneAndUpdate(
        { _id: gigId, customerId, postingPaymentStatus: "unpaid", publicationStatus: "draft" },
        { $set: { postingPaymentStatus: "paid", publicationStatus: "published" } },
        { new: true, runValidators: true },
      );
    },
  };
}

export function createUserIntegrationRepository(model = User) {
  return {
    findTalentById({ talentId }) {
      return model.findOne({ _id: talentId, role: "talent" });
    },
    setPaidGigSubscriptionRequired({ talentId }) {
      return model.findOneAndUpdate(
        { _id: talentId, role: "talent" },
        { $set: { paidGigSubscriptionRequired: true } },
        { new: true, runValidators: true },
      );
    },
  };
}

export function createSubscriptionIntegrationRepository(model = Subscription) {
  return {
    findLatestByTalentId({ talentId }) {
      return model.findOne({ talentId }).sort({ createdAt: -1 });
    },
  };
}

/**
 * Adds ownership checks around Student 3's exported application service before
 * Student 2's customer controller consumes it.
 */
export function createCustomerApplicationIntegrationAdapter({ applicationService, gigRepository }) {
  async function assertCustomerOwnsApplication(customerId, application, expectedGigId) {
    const applicationGigId = application.gigId?._id || application.gigId;
    if (expectedGigId && !idsMatch(applicationGigId, expectedGigId)) {
      throw integrationError("Application not found.", 404);
    }
    const gig = await gigRepository.findGigById(applicationGigId);
    if (!gig || !idsMatch(gig.customerId, customerId)) {
      throw integrationError("You can only review applications for your own gigs.");
    }
  }

  return {
    listApplicationsForCustomerGig: (input) => applicationService.listApplicationsForCustomerGig(input),
    async getApplicationWithDemoVideos(input) {
      const application = await applicationService.getApplicationWithDemoVideos(input.applicationId);
      await assertCustomerOwnsApplication(input.customerId, application, input.gigId);
      return application;
    },
    acceptApplication: (input) => applicationService.acceptApplication(input),
    rejectApplication: (input) => applicationService.rejectApplication(input),
    countAcceptedApplicationsForPosition: (input) => applicationService.countAcceptedApplicationsForPosition(input),
  };
}

export function createIntegratedApplicationService() {
  const gigRepository = createGigIntegrationRepository();
  const userRepository = createUserIntegrationRepository();
  const requirementService = createPaidGigSubscriptionRequirementService({ userRepository });
  const applicationService = createApplicationService({
    gigRepository,
    onFirstPaidGigAccepted: (talentId) => requirementService.markRequiredAfterFirstAcceptedPaidGig(talentId),
  });

  configureCustomerApplicationService(
    createCustomerApplicationIntegrationAdapter({ applicationService, gigRepository }),
  );

  return { applicationService, gigRepository, userRepository };
}
