import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createAdminGigService } from "./services/admin-gig.service.js";
import { createAdminUserManagementService } from "./services/admin-user-management.service.js";

function createUserRepository() {
  const users = [
    { _id: "customer-1", name: "Customer One", email: "customer@example.test", phone: "08000000001", role: "customer", accountStatus: "active", passwordHash: "private", createdAt: "2026-01-01" },
    { _id: "talent-1", name: "Talent One", email: "talent@example.test", phone: "08000000002", role: "talent", accountStatus: "suspended", passwordHash: "private", createdAt: "2026-01-02" },
    { _id: "admin-1", name: "Admin One", email: "admin@example.test", role: "admin", accountStatus: "active", passwordHash: "private" },
  ];
  const manageable = (user) => user && ["customer", "talent"].includes(user.role);
  return {
    listUsers: async ({ role }) => users.filter((user) => manageable(user) && (!role || user.role === role)),
    findManageableUserById: async ({ userId }) => users.find((user) => user._id === userId && manageable(user)) || null,
    updateAccountStatus: async ({ userId, accountStatus }) => {
      const user = users.find((item) => item._id === userId && manageable(item));
      if (user) user.accountStatus = accountStatus;
      return user || null;
    },
  };
}

function authenticate(request, response, next) {
  const token = request.get("authorization");
  const identities = {
    "Bearer admin": { id: "admin-1", role: "admin" },
    "Bearer customer": { id: "customer-1", role: "customer" },
    "Bearer talent": { id: "talent-1", role: "talent" },
  };
  if (!identities[token]) return response.status(401).json({ success: false, message: "Authentication is required.", errors: [] });
  request.user = identities[token];
  return next();
}

async function withServer(run) {
  const adminUserService = createAdminUserManagementService({ userRepository: createUserRepository() });
  const adminGigService = createAdminGigService({ gigRepository: { listGigs: async () => [{ _id: "gig-1", title: "Live set" }] } });
  const app = express();
  app.use(express.json());
  app.use("/api/admin", createAdminRouter({ adminUserService, adminGigService, authenticate }));
  app.use((error, _request, response, _next) => response.status(error.statusCode || 500).json({ success: false, message: error.message, errors: [] }));
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("admin routes reject unauthenticated, customer, and talent requests", async () => {
  await withServer(async (baseUrl) => {
    for (const authorization of [undefined, "Bearer customer", "Bearer talent"]) {
      const response = await fetch(`${baseUrl}/api/admin/users`, { headers: authorization ? { authorization } : {} });
      assert.equal(response.status, authorization ? 403 : 401);
    }
  });
});

test("an admin lists safe customer and talent accounts and changes only account status", async () => {
  await withServer(async (baseUrl) => {
    const headers = { authorization: "Bearer admin", "content-type": "application/json" };
    const listResponse = await fetch(`${baseUrl}/api/admin/users`, { headers });
    const listPayload = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.deepEqual(listPayload.data.users.map((user) => user.role), ["customer", "talent"]);
    assert.equal(Object.hasOwn(listPayload.data.users[0], "passwordHash"), false);

    const gigsResponse = await fetch(`${baseUrl}/api/admin/gigs`, { headers });
    assert.deepEqual((await gigsResponse.json()).data.gigs, [{ _id: "gig-1", title: "Live set" }]);

    const suspendResponse = await fetch(`${baseUrl}/api/admin/users/customer-1/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ accountStatus: "suspended", role: "admin", passwordHash: "attempted" }),
    });
    const suspendPayload = await suspendResponse.json();
    assert.equal(suspendResponse.status, 200);
    assert.equal(suspendPayload.data.user.accountStatus, "suspended");
    assert.equal(suspendPayload.data.user.role, "customer");
    assert.equal(Object.hasOwn(suspendPayload.data.user, "passwordHash"), false);

    const reactivateResponse = await fetch(`${baseUrl}/api/admin/users/customer-1/status`, {
      method: "PATCH", headers, body: JSON.stringify({ accountStatus: "active" }),
    });
    assert.equal((await reactivateResponse.json()).data.user.accountStatus, "active");

    const selfResponse = await fetch(`${baseUrl}/api/admin/users/admin-1/status`, {
      method: "PATCH", headers, body: JSON.stringify({ accountStatus: "suspended" }),
    });
    assert.equal(selfResponse.status, 403);
  });
});
