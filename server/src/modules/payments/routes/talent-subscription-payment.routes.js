import { Router } from "express";

function getTalentId(request) {
  return request.user?._id || request.user?.id;
}

export function createTalentSubscriptionPaymentRouter({ paymentService, requireTalent } = {}) {
  if (!paymentService || typeof requireTalent !== "function") {
    throw new Error("Subscription routes require a payment service and talent authorization middleware.");
  }

  const router = Router();

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
