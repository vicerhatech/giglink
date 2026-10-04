# Student 3 Tasks - Talent, Gig Discovery, Auditions and Applications

## Branch

```text
feature/talent-applications
```

Create it only after Captain confirms C00 is merged into `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/talent-applications
git push -u origin feature/talent-applications
```

## Ownership

You own only:

```text
client/src/features/talent/**
server/src/modules/talent/**
server/src/modules/applications/**
server/src/modules/media/**
```

Do not edit Gig persistence owned by Student 2. Read/query the Gig model through the agreed exported module contract after integration. If unavailable on your branch, build against the README schema and clearly report the dependency.

---

## S3-T11 - Talent Profile Backend and UI

### Goal
Implement TalentProfile backend module plus talent profile/onboarding UI.

### Backend routes

```text
GET /api/talent/profile
PUT /api/talent/profile
```

### Fields
- talentType: instrumentalist | backup_vocalist
- instruments[]
- bio
- yearsExperience
- profilePhotoUrl

### Rules
- Only talent accounts can access.
- Instrumentalists should have at least one instrument in completed profile.
- Backup vocalists may leave instruments empty.

Do not build production image upload unless already supported by foundation; a URL/test placeholder is acceptable for profile photo in this MVP. Audition video upload is handled separately.

STOP after report.

---

## S3-T12 - Talent Gig Discovery with Access and Location Rules

### Goal
Implement talent-facing gig query services/endpoints and UI.

### Routes

```text
GET /api/talent/gigs
GET /api/talent/gigs/:id
```

### Required feed rules
A talent with `paidGigSubscriptionRequired=false`:
- sees published Free gigs;
- sees published Paid gigs.

A talent with `paidGigSubscriptionRequired=true` and active subscription:
- sees published Free gigs;
- sees published Paid gigs.

A talent with `paidGigSubscriptionRequired=true` and no active subscription:
- sees published Free gigs;
- does not receive normal Paid gigs in the browse feed;
- frontend displays a ₦5,000/month paid-gig access prompt.

### Location privacy
For normal browsing, exact location must not be included in API response.

For gig details, exact location is returned only if the current talent has an accepted application for that gig.

### Important dependency
Subscription lookup is owned by Captain. Code against an injected/exported function contract such as:

```js
hasActiveTalentSubscription(talentUserId)
```

If unavailable, report `INTEGRATION_REQUIRED`; do not build a duplicate Subscription model.

### UI
- Browse Gigs page.
- Gig cards showing FREE or PAID.
- Paid range shown on Paid cards/details.
- No exact location before acceptance.
- Subscription gate/prompt when required.

STOP after report.

---

## S3-T13 - Application Model and Audition Submission

### Goal
Implement Application persistence and application submission rules.

### Route

```text
POST /api/talent/gigs/:gigId/positions/:positionId/apply
```

### Rules
- Talent-only.
- Gig must be published and application deadline valid.
- Position must exist.
- One active application per talent per position.
- Exactly 3 demos.
- Demo song titles must correspond to the position's three requested audition songs.
- Initial status is pending.
- The talent cannot set status themselves.

### Exported service interface for Student 2/Captain
Provide service functions for:
- list applications for a customer-owned gig;
- get application with demo videos;
- accept application;
- reject application;
- count accepted applications for a position;
- determine whether a talent has an accepted application for a gig.

Acceptance service must prevent exceeding position slots.

When accepting the talent's first Paid gig, expose an integration hook/result telling Captain/User service to set `paidGigSubscriptionRequired=true`. Do not edit Student 1's User model file.

STOP after report.

---

## S3-T14 - Cloudinary Audition Video Upload and Talent Application UI

### Goal
Implement server-side audition video upload integration and talent application UI.

### Route

```text
POST /api/media/videos
```

### Requirements
- Authenticated talent only.
- Use server-held Cloudinary credentials.
- Restrict accepted media to video.
- Enforce a reasonable MVP file limit configured by backend (target <= 30 MB unless instructor changes it).
- Return video URL + public id.
- Do not expose Cloudinary secret to frontend.

### Frontend
- Apply page for a selected gig position.
- Display the 3 requested song names.
- Require one video for each.
- Upload each and retain returned metadata.
- Submit final application.
- Loading/progress/error feedback.

STOP after report.

---

## S3-T15 - My Applications, Acceptance Location Reveal and QA

### Goal
Implement:

```text
GET   /api/talent/applications
PATCH /api/talent/applications/:id/withdraw
```

and corresponding UI.

### Requirements
- Talent sees only their applications.
- Show Pending/Accepted/Rejected/Withdrawn.
- Accepted application response may include exact gig location.
- Non-accepted application response must not include exact location.
- Withdrawing an accepted application is out of MVP; only pending can be withdrawn.

### QA
Test:
- exactly 3 demos required;
- duplicate application blocked;
- location redaction before acceptance;
- location reveal after acceptance;
- slot limit protection in exported accept service;
- paid/free cards;
- subscription-gated browse contract.

### Final handoff
Report:
- router exports;
- Cloudinary setup steps;
- service export paths Student 2/Captain must call;
- acceptance hook needed to trigger paid-gig subscription requirement;
- subscription lookup interface needed from Captain.

Push branch. Do not merge `develop` yourself.
