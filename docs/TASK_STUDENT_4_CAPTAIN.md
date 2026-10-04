# Student 4 Tasks - Captain, Foundation, Payments, Admin and Final Integration

You are the team Captain. You have both feature work and repository-integration responsibilities.

Your work is deliberately different from the other students: you own shared integration files and the final working build.

---

# C00 - Project Foundation (DO THIS BEFORE ANYONE CREATES FEATURE BRANCHES)

## Goal
Create the base MERN project so every student starts from the same commit.

## Branch

```bash
git checkout main
git pull origin main
git checkout -b chore/project-foundation
```

Create `develop` if it does not yet exist after foundation is approved.

## Foundation responsibilities
Create/configure:
- Vite React client.
- Express server.
- Tailwind CSS.
- React Router dependency.
- Axios dependency.
- Mongoose.
- JWT/bcryptjs.
- CORS/dotenv.
- Cloudinary/multer dependencies needed by the agreed implementation.
- Any lightweight validation dependency only if genuinely needed.
- Base folder architecture from README.
- `.gitignore`.
- `.env.example` without secrets.
- base API health endpoint.
- base client shell that compiles.
- shared error/not-found middleware if architecture uses it.

Do not implement another student's feature.

## Important package rule
Install the dependencies the team is reasonably expected to need now so Students 1-3 do not need to edit package manifests later.

## Verify
- client installs/builds;
- server starts;
- health endpoint responds;
- no secrets committed.

## Merge foundation
After instructor approval:

```bash
git checkout main
git merge --no-ff chore/project-foundation
git push origin main

git checkout -b develop
git push -u origin develop
```

If `develop` already exists, merge foundation into it instead of recreating it.

Tell all students to branch only after this step is complete.

STOP and report C00 before beginning C01.

---

# Captain feature branch

After C00 is in `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/payments-admin
git push -u origin feature/payments-admin
```

You own:

```text
client/src/features/payments/**
client/src/features/admin/**
server/src/modules/payments/**
server/src/modules/admin/**
```

You also own shared files only when a task explicitly says integration/foundation permits it.

---

## C01 - Payment and Subscription Models/Services

### Goal
Implement Payment and Subscription persistence plus reusable server services.

### Required fees
- Free gig posting: 5000.
- Paid gig posting: 10000.
- Talent monthly subscription: 5000.

Never trust an amount supplied by frontend. Compute expected amount from purpose/gig type.

### Subscription helper
Export:

```js
hasActiveTalentSubscription(talentUserId)
```

or a clearly equivalent function for Student 3 integration.

An active subscription expires 30 days after verified payment for MVP.

STOP after report.

---

## C02 - Paystack Test Mode Posting Payment

### Goal
Implement:

```text
POST /api/payments/gig-post/initialize
GET  /api/payments/gig-post/verify/:reference
```

### Rules
- Customer owns referenced draft.
- Backend determines ₦5,000 or ₦10,000 based on gigType.
- Paystack secret key only on server.
- Successful backend verification marks Payment successful, gig postingPaymentStatus paid, and gig publicationStatus published.
- Failed/unverified payment never publishes.
- Verification should be idempotent enough for repeated callback/page refresh in MVP.

### Frontend payment feature
Create customer posting-payment button/page/callback logic under `client/src/features/payments/`.

Do not edit Student 2 feature files yet. Report the exact component/callback Student 2 page should invoke during integration.

STOP after report.

---

## C03 - Talent Subscription Payment

### Goal
Implement:

```text
POST /api/payments/subscription/initialize
GET  /api/payments/subscription/verify/:reference
GET  /api/payments/subscription/me
```

### Rules
- Talent-only.
- Fee = ₦5,000.
- Verified test payment creates/renews active subscription for 30 days.
- Expose current active/expired state.

### Frontend
Build subscription page/prompt/payment callback under `client/src/features/payments/`.

STOP after report.

---

## C04 - Admin User Management

### Goal
Implement backend + frontend admin feature.

### Endpoints

```text
GET   /api/admin/users
GET   /api/admin/users/:id
PATCH /api/admin/users/:id/status
GET   /api/admin/gigs
```

### Requirements
- Admin-only authorization.
- Filter/list customers and talents.
- Suspend/reactivate account.
- Do not let admin accidentally suspend their own account through ordinary UI.
- Simple dashboard/table is enough.
- No analytics charts required.

STOP after report.

---

## C05 - Integrate All Student Branches Into Develop

### Goal
Produce one coherent application. This is a Captain-only integration task.

### Before merge
Ensure each student has:
- completed their final QA task;
- pushed their branch;
- provided the latest commit hash;
- listed integration requirements.

### Merge sequence
Start clean:

```bash
git checkout develop
git pull origin develop
git status
```

Merge one feature at a time with `--no-ff`.

Recommended starting order:

```bash
git merge --no-ff feature/auth-users
git merge --no-ff feature/customer-gigs
git merge --no-ff feature/talent-applications
git merge --no-ff feature/payments-admin
```

If Git says the current branch cannot merge itself, remember your own payment/admin commits may already need to be pushed/merged from a different integration branch. Use a clean, understandable Git history; do not force-push shared branches.

### Required shared integration work
You must personally wire:
- backend feature routers into the shared Express app;
- frontend feature routes into the shared React router;
- shared Axios base URL/auth token handling;
- shared auth middleware usage where appropriate;
- Student 2 customer application-review adapter to Student 3 application services;
- Student 3 subscription lookup to your `hasActiveTalentSubscription` service;
- accepted Paid-gig hook so User `paidGigSubscriptionRequired=true` is set after first accepted Paid gig;
- posting-payment UI into Customer draft/publish flow;
- subscription prompt/payment UI into Talent paid-gig gate;
- navigation/sidebar/header links by role.

### Location security integration
Explicitly test that `/api/talent/gigs*` and `/api/talent/applications` do not leak location before accepted status.

### Git conflict procedure
If a conflict happens:
1. Run `git status`.
2. Open every conflicted file.
3. Understand both intended changes.
4. Remove conflict markers.
5. Preserve both features where both are needed.
6. Stage resolved files.
7. Complete the merge commit.
8. Re-run relevant feature tests/build.

Never use blanket `git checkout --ours .` or `--theirs .` simply to make a conflict disappear.

### If integration exposes a bug
Fix glue/integration bugs yourself if they are in Captain-owned/shared integration code.

If the defect is inside another student's owned feature:
- identify the exact failing behavior and file;
- either ask that student to patch their branch or make a clearly documented minimal integration fix if the instructor directs you to do so;
- do not rewrite that student's entire feature.

STOP after a full C05 report.

---

## C06 - Final Cleanup, QA, Deployment and Main Merge

### Goal
You are responsible for turning integrated `develop` into the demo MVP.

### Cleanup responsibilities
- Remove dead imports/debug logs that are not useful.
- Remove abandoned duplicate code created during integration.
- Ensure naming is consistent enough for maintainability.
- Ensure no secrets are tracked.
- Confirm `.env.example` is complete.
- Confirm README setup commands still match the repository.
- Verify responsive critical pages.
- Verify loading, error and empty states on the core flow.
- Do not perform a large aesthetic refactor that risks the demo.

### End-to-end QA checklist
1. Customer registration/login.
2. Talent registration/login/profile.
3. Free draft creation and ₦5,000 posting test payment.
4. Paid draft creation with >= ₦25,000 min and ₦10,000 posting test payment.
5. Published cards show FREE/PAID.
6. Talent initially sees Free + Paid gigs.
7. Talent cannot see exact location.
8. Talent uploads 3 audition videos and applies.
9. Customer sees the three demos.
10. Customer accepts talent without exceeding slots.
11. Accepted talent can see exact location.
12. First accepted Paid gig sets paid-subscription-required.
13. Without subscription, talent feed shows Free but gates Paid gigs.
14. ₦5,000 talent test subscription verifies.
15. Paid gigs become available again.
16. Already accepted Paid gig remains available regardless of feed gate.
17. Admin can list/suspend/reactivate customer/talent.
18. Suspended account is blocked appropriately.
19. Refreshing critical pages does not corrupt state.
20. Client builds and server boots from clean install/setup.

### Deployment
- MongoDB Atlas database.
- Render backend.
- Vercel frontend.
- Configure allowed frontend origin.
- Configure production `VITE_API_BASE_URL`.
- Use Paystack TEST secret/key only for demo.
- Configure Cloudinary credentials on backend host.

### Final merge
Only after QA passes:

```bash
git checkout main
git pull origin main
git merge --no-ff develop
git push origin main
```

Optionally tag:

```bash
git tag -a v1.0.0-mvp -m "GigLink MVP demo"
git push origin v1.0.0-mvp
```

### Final Captain report
Include:
- deployment URLs;
- exact commit merged to main;
- test accounts/roles without sharing passwords publicly;
- known non-blocking limitations;
- confirmation that MVP demo checklist passes;
- any issue the team should avoid changing before demo day.
