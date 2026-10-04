# Student 2 Tasks - Customer and Gig Management

## Branch

```text
feature/customer-gigs
```

Create it only after Captain confirms C00 is merged into `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/customer-gigs
git push -u origin feature/customer-gigs
```

## Ownership

You own only:

```text
client/src/features/customer/**
server/src/modules/gigs/**
server/src/modules/customer/**
```

You do not own Payment or Application persistence. Use the README contracts and exported service interfaces.

---

## S2-T06 - Gig Model and Domain Validation

### Goal
Implement the Gig schema/model and reusable validation/service logic.

### Required rules
- Customer owns the gig.
- `gigType`: free or paid.
- Free gig: `paymentRange` is null and postingFee = 5000.
- Paid gig: paymentRange.min >= 25000; max >= min; postingFee = 10000.
- No upper maximum on paid range.
- Each position has roleType, slots and exactly 3 non-empty audition songs.
- Instrumentalist position requires instrument.
- Backup vocalist may have instrument null.
- Draft starts `postingPaymentStatus=unpaid` and `publicationStatus=draft`.
- Posting date is never blocked because event is less than 2 months away.

STOP after report.

---

## S2-T07 - Customer Gig CRUD API

### Goal
Implement feature routers/controllers for:

```text
POST   /api/gigs
GET    /api/gigs/customer/mine
GET    /api/gigs/customer/:id
PATCH  /api/gigs/:id
DELETE /api/gigs/:id
```

### Requirements
- Customer-only authorization.
- Customers can access/modify only their own gigs.
- Create produces draft only.
- Customer cannot manually mark payment as paid or publication as published through update payload.
- Customer cannot set postingFee directly.
- Return complete location to owning customer.
- Export router; do not mount globally.

STOP after report.

---

## S2-T08 - Customer Gig Creation and Management UI

### Goal
Build customer-facing feature UI under `client/src/features/customer/`.

### Required pages/components
- Customer dashboard shell for feature area.
- Create Gig form.
- My Gigs list.
- Customer Gig Details/Edit view.

### Create Gig requirements
Show the prominent advisory:

> For the best results, post your gig at least 2 months before the event. This gives talents enough time to apply and submit demos, and gives you enough time to review applicants and select the best fit.

Form supports:
- title
- event type
- description
- event date/time
- exact location
- application deadline
- Free/Paid selector
- Paid payment min/max
- one or more required positions
- exactly three audition songs per position

Show calculated posting fee:
- Free = ₦5,000
- Paid = ₦10,000

Creating the form saves a draft. Do not fake publication before payment.

STOP after report.

---

## S2-T09 - Customer Applicant Review Interface

### Goal
Build customer-facing review screens and controller entrypoints, while relying on Student 3's Application service contract for application data/mutations.

### Required UI
- Applicants grouped by position.
- Applicant identity/basic talent information when available.
- Three audition song/video pairs.
- Pending/Accepted/Rejected status.
- Accept button.
- Reject button.
- Clear loading/error/empty states.

### Backend entrypoints
Prepare customer-side endpoints/controllers for:

```text
GET   /api/customer/gigs/:gigId/applications
PATCH /api/customer/applications/:applicationId/status
```

Do not create a second Application model.

If Student 3 service is not available yet, define a small adapter/service interface in `server/src/modules/customer/` and report:

```text
BLOCKED_BY: S3-T13 / S3-T14
```

Do not implement Student 3's persistence logic.

STOP after report.

---

## S2-T10 - Customer/Gig QA and Integration Handoff

### Goal
Validate Customer/Gig behavior and prepare branch for integration.

### Checks
- Free draft automatically has ₦5,000 posting fee.
- Paid draft automatically has ₦10,000 posting fee.
- Paid minimum below ₦25,000 fails.
- Paid max lower than min fails.
- No arbitrary upper cap exists.
- Exactly 3 audition songs per position are required.
- Less-than-two-month event is allowed.
- Customer ownership protection works.
- UI displays advisory and correct fee.
- Applicant UI consumes the documented application interface and does not duplicate it.

### Final handoff
List exact router/component exports and every `INTEGRATION_REQUIRED` item, especially:
- global route mounting;
- payment button/redirect wiring to Captain payment feature;
- application service wiring to Student 3.

Push branch. Do not merge `develop` yourself.
