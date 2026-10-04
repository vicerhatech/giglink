# Student 1 Tasks - Authentication and User Foundation

## Branch

```text
feature/auth-users
```

Create it only after Captain confirms C00 is merged into `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/auth-users
git push -u origin feature/auth-users
```

## Ownership

You own only:

```text
client/src/features/auth/**
server/src/modules/auth/**
server/src/modules/users/**
```

Do not edit Captain/shared router files. Export routes/components/services for Captain to register later.

---

## S1-T01 - Backend User and Authentication Models/Services

### Goal
Implement the backend user/auth domain without registering it in shared `app.js`.

### Requirements
- User schema must follow README contract.
- Roles: `customer`, `talent`, `admin`.
- Account status: `active`, `suspended`.
- Default `paidGigSubscriptionRequired` is `false`.
- Normalize email to lowercase.
- Hash passwords with bcryptjs.
- Provide service functions for registration, credential validation and safe user serialization.
- Never return passwordHash.

### Allowed files
`server/src/modules/auth/**`, `server/src/modules/users/**`

### Acceptance criteria
- Duplicate email is rejected.
- Password is stored hashed.
- Safe serialized user omits password hash.
- Valid role constraints exist.
- Suspended-user state can be checked by service layer.

STOP after report.

---

## S1-T02 - Auth Controllers and Router Export

### Goal
Implement:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Requirements
- JWT returned on successful register/login.
- Backend validates required input.
- Login refuses invalid credentials.
- Protected `/me` reads authenticated user.
- Export a router from your module; do not mount it in the global app.

### Dependency behavior
If shared auth middleware does not yet exist, create feature-local middleware under `server/src/modules/auth/` and report whether Captain should adopt/register it globally. Do not edit Captain middleware directory.

STOP after report.

---

## S1-T03 - User Self-Profile API

### Goal
Implement:

```text
PATCH /api/users/me
```

### Requirements
Allow safe profile updates only:
- name
- phone

Do not permit changing:
- role
- accountStatus
- paidGigSubscriptionRequired
- passwordHash

Export the users router for Captain integration.

STOP after report.

---

## S1-T04 - Frontend Authentication Feature

### Goal
Build authentication UI and feature-local state/utilities under `client/src/features/auth/`.

### Screens/components
- Register page/form.
- Login page/form.
- Auth provider/hook or equivalent feature-local state.
- Logout action.
- Role-aware helper.
- Protected-route wrapper component that Captain can register/use.

### Requirements
- Registration lets user choose Customer or Talent, never Admin.
- Store token using the project's chosen simple MVP strategy.
- Show useful validation/API errors.
- Do not modify global router.
- Export route definitions/components needed by Captain.

STOP after report.

---

## S1-T05 - Auth/User QA and Integration Handoff

### Goal
Test your complete feature and prepare it for Captain merge.

### Checks
- Customer registration/login.
- Talent registration/login.
- Duplicate registration failure.
- Invalid login failure.
- `/me` with/without token.
- Suspended account behavior in your auth layer.
- Profile update allowlist.
- Frontend forms compile within feature context.

### Final handoff report must additionally include
- Backend router export path.
- Frontend route/component export path.
- Any middleware Captain must register.
- Any package/config requirement.
- Exact environment variables used.

Do not merge into `develop`; push your branch and give the Captain the branch name/commit.
