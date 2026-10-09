import { Router } from "express";

function getRequestUser(request) {
  return request.user && {
    id: request.user._id || request.user.id,
    email: request.user.email,
  };
}

export function createGigPostingPaymentRouter({ paymentService, requireCustomer } = {}) {
  if (!paymentService || typeof requireCustomer !== "function") {
    throw new Error("Posting payment routes require a payment service and customer authorization middleware.");
  }

  const router = Router();

  router.post("/gig-post/initialize", requireCustomer, async (request, response, next) => {
    try {
      const user = getRequestUser(request);
      const result = await paymentService.initialize({
        gigId: request.body.gigId,
        customerId: user?.id,
        customerEmail: user?.email,
      });

      response.status(201).json({
        success: true,
        message: "Posting payment initialized.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/gig-post/verify/:reference", requireCustomer, async (request, response, next) => {
    try {
      const user = getRequestUser(request);
      const result = await paymentService.verify({
        reference: request.params.reference,
        customerId: user?.id,
      });

      response.status(200).json({
        success: true,
        message: result.payment.status === "successful"
          ? "Posting payment verified."
          : "Posting payment was not successful.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
