import { Router } from "express";

function getRequestUserId(request) {
  return request.user?._id || request.user?.id;
}

/**
 * C05 must supply Student 1's JWT authentication middleware as `authenticate`.
 * This local middleware only authorizes an already-authenticated principal.
 */
export function requireAdminRole(request, response, next) {
  if (request.user?.role !== "admin") {
    return response.status(403).json({
      success: false,
      message: "Admin access is required.",
      errors: [],
    });
  }
  return next();
}

export function createAdminRouter({ adminUserService, adminGigService, authenticate, authorizeAdmin = requireAdminRole } = {}) {
  if (!adminUserService || !adminGigService || typeof authenticate !== "function" || typeof authorizeAdmin !== "function") {
    throw new Error("Admin routes require services plus authentication and admin authorization middleware.");
  }

  const router = Router();
  router.use(authenticate, authorizeAdmin);

  router.get("/users", async (request, response, next) => {
    try {
      const users = await adminUserService.listUsers({
        role: request.query.role,
        accountStatus: request.query.accountStatus,
      });
      response.status(200).json({ success: true, message: "Users retrieved.", data: { users } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/users/:id", async (request, response, next) => {
    try {
      const user = await adminUserService.getUser({ userId: request.params.id });
      response.status(200).json({ success: true, message: "User retrieved.", data: { user } });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/users/:id/status", async (request, response, next) => {
    try {
      const user = await adminUserService.updateAccountStatus({
        actorId: getRequestUserId(request),
        userId: request.params.id,
        accountStatus: request.body?.accountStatus,
      });
      response.status(200).json({ success: true, message: "Account status updated.", data: { user } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/gigs", async (_request, response, next) => {
    try {
      const gigs = await adminGigService.listGigs();
      response.status(200).json({ success: true, message: "Gigs retrieved.", data: { gigs } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
