import { Router } from "express";
import { cancelTalentSubscription } from "../services/subscription.service.js";

function getTalentId(request) {
  return request.user?._id || request.user?.id;
}

export function createTalentSubscriptionPaymentRouter({ paymentService, requireTalent, cancelSubscription = cancelTalentSubscription } = {}) {
  if (!paymentService || typeof requireTalent !== "function") {
    throw new Error("Subscription routes require a payment service and talent authorization middleware.");
  }

  const router = Router();

  router.post("/subscription/cancel", requireTalent, async (request, response, next) => {
    try {
      if (request.body?.confirm !== true) {
        return response.status(400).json({ success: false, message: "Confirm that you want to end subscription access now.", errors: [] });
      }
      await cancelSubscription(getTalentId(request));
      const result = await paymentService.getStatus({ talentId: getTalentId(request) });
      return response.status(200).json({ success: true, message: "Subscription cancelled. Accepted gigs remain accessible.", data: result });
    } catch (error) { return next(error); }
  });

  router.post("/subscription/initialize", requireTalent, async (request, response, next) => {
    try {
      const result = await paymentService.initialize({ talentId: getTalentId(request) });
      response.status(201).json({ success: true, message: "Subscription payment initialized.", data: result });
    } catch (error) {
      next(error);
    }
  });

  router.get("/subscription/verify/:reference", requireTalent, async (request, response, next) => {
    try {
      const result = await paymentService.verify({
        reference: request.params.reference,
        talentId: getTalentId(request),
      });
      response.status(200).json({
        success: true,
        message: result.payment.status === "successful"
          ? "Subscription payment verified."
          : "Subscription payment was not successful.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/subscription/me", requireTalent, async (request, response, next) => {
    try {
      const result = await paymentService.getStatus({ talentId: getTalentId(request) });
      response.status(200).json({ success: true, message: "Subscription status retrieved.", data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
