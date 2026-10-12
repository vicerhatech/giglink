import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "../middleware/errorMiddleware.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { requireAuthenticatedUser } from "../modules/auth/auth.middleware.js";
import { userRouter } from "../modules/users/user.routes.js";
import { createCustomerGigRouter, requireCustomer } from "../modules/gigs/gig.router.js";
import { createCustomerReviewRouter } from "../modules/customer/customer.router.js";
import { createTalentRouter } from "../modules/talent/routes.js";
import { createMediaRouter } from "../modules/media/routes.js";
import {
  createGigPostingPaymentRouter,
  createGigPostingPaymentService,
  createPaystackClient,
  createTalentSubscriptionPaymentRouter,
  createTalentSubscriptionPaymentService,
  hasActiveTalentSubscription,
} from "../modules/payments/index.js";
import {
  createAdminGigService,
  createAdminRouter,
  createAdminUserManagementService,
  createMongooseGigRepository,
  createMongooseUserRepository,
} from "../modules/admin/index.js";
import { Gig } from "../modules/gigs/gig.model.js";
import { User } from "../modules/users/user.model.js";
import { createIntegratedApplicationService, createSubscriptionIntegrationRepository } from "./integration.js";

function requireTalent(request, _response, next) {
  if (request.user?.role !== "talent") {
    const error = new Error("Talent access is required.");
    error.statusCode = 403;
    return next(error);
  }
  return next();
}

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      success: true,
      message: "GigLink API is healthy",
      data: { status: "ok" },
    });
  });

  const { applicationService, gigRepository, userRepository } = createIntegratedApplicationService();
  // Keep health/auth routes bootable when payment credentials have not yet been
  // configured. Payment operations still construct the real server-only client.
  const paystackClient = {
    initializeTransaction: (...args) => createPaystackClient().initializeTransaction(...args),
    verifyTransaction: (...args) => createPaystackClient().verifyTransaction(...args),
  };
  const postingPaymentService = createGigPostingPaymentService({ gigRepository, paystackClient });
  const subscriptionPaymentService = createTalentSubscriptionPaymentService({
    userRepository,
    paystackClient,
    subscriptionRepository: createSubscriptionIntegrationRepository(),
  });
  const adminUserService = createAdminUserManagementService({
    userRepository: createMongooseUserRepository({ User }),
  });
  const adminGigService = createAdminGigService({
    gigRepository: createMongooseGigRepository({ Gig }),
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/gigs", createCustomerGigRouter({ authenticate: requireAuthenticatedUser }));
  app.use("/api/customer", createCustomerReviewRouter({ authenticate: requireAuthenticatedUser }));
  app.use("/api/talent", createTalentRouter({
    authenticate: requireAuthenticatedUser,
    gigRepository,
    hasActiveTalentSubscription,
    hasAcceptedApplication: applicationService.hasTalentAcceptedApplicationForGig,
    applicationService,
  }));
  app.use("/api/media", createMediaRouter({ authenticate: requireAuthenticatedUser }));
  app.use("/api/payments", requireAuthenticatedUser, createGigPostingPaymentRouter({
    paymentService: postingPaymentService,
    requireCustomer,
  }));
  app.use("/api/payments", requireAuthenticatedUser, createTalentSubscriptionPaymentRouter({
    paymentService: subscriptionPaymentService,
    requireTalent,
  }));
  app.use("/api/admin", createAdminRouter({
    adminUserService,
    adminGigService,
    authenticate: requireAuthenticatedUser,
  }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
