# GigLink

## MERN Stack MVP Project Specification

GigLink is a responsive web marketplace that connects event hosts/customers with instrumentalists and backup vocalists. Customers post free or paid gigs, specify the talent they need and three audition songs, and review three demo videos submitted by applicants. Talents browse eligible gigs, apply to a specific position, and customers accept or reject applicants.

This repository is intentionally scoped as a **demo-ready MVP** for a four-student MERN Stack project. The architecture prioritizes independent feature ownership, predictable Git integration, and low AI-agent usage.

---

## 1. MVP Goals

The demo must prove this complete flow:

1. A customer registers and logs in.
2. The customer creates a draft gig.
3. The customer chooses whether the gig is Free or Paid.
4. A Free gig requires a ₦5,000 posting fee before publication.
5. A Paid gig requires a ₦10,000 posting fee before publication.
6. A paid gig contains a talent payment range with a minimum value of ₦25,000 and no platform maximum.
7. The customer defines required positions and exactly three audition songs for each position.
8. A talent registers and logs in.
9. An eligible talent browses gigs without seeing the exact gig location.
10. The talent applies to a position and submits exactly three demo videos, one for each requested song.
11. The customer reviews the application and demo videos.
12. The customer accepts or rejects the applicant.
13. When accepted, that talent can see the exact location for that accepted gig.
14. After a talent receives their first accepted Paid gig, future access to Paid gigs requires an active ₦5,000/month talent subscription. Free gigs remain visible even without a subscription.
15. An admin can manage customer and talent accounts.

---

## 2. Roles

### Customer
A customer/event host can:
- Register and log in.
- Create Free or Paid gig drafts.
- Add gig title, description, event date/time, exact location, application deadline and required positions.
- For each position, specify the role/instrument, number of slots and exactly three audition songs.
- For Paid gigs, enter a payment range.
- Pay the required posting fee before a gig becomes public.
- View their gigs and applicants.
- Watch submitted audition videos.
- Accept or reject applicants.
- Edit/cancel their own eligible gigs within MVP rules.

### Talent
A talent can:
- Register and log in.
- Complete a talent profile.
- Choose `instrumentalist` or `backup_vocalist`.
- For instrumentalists, select one or more instruments.
- Browse Free gigs at all times.
- Browse Paid gigs until their first Paid gig is accepted.
- After their first accepted Paid gig, browse Paid gigs only while their ₦5,000 monthly subscription is active.
- Apply to a position.
- Upload exactly three requested audition videos.
- Track application status.
- See the exact location only for a gig where their own application has been accepted.

### Admin
An admin can:
- Log in through the normal auth system using an account whose role is `admin`.
- View customers and talents.
- View basic account details and status.
- Suspend/reactivate customer and talent accounts.
- View basic gig information for oversight.

The MVP does not require an admin to impersonate users, edit user passwords, process refunds or edit payment records.

---

## 3. Critical Business Rules

### 3.1 Free vs Paid gigs
Every published gig has:

```js
gigType: "free" | "paid"
```

Cards and detail pages must visibly show `FREE` or `PAID`.

### 3.2 Paid-gig talent payment range
For a Paid gig:

```js
paymentRange: {
  min: Number,
  max: Number
}
```

Rules:
- `min >= 25000`.
- `max >= min`.
- No application-defined maximum cap.
- Both values are stored in Nigerian naira as whole-number naira amounts for this MVP.
- Free gigs store `paymentRange: null`.

The payment range is informational. GigLink does **not** pay the talent or hold the talent's fee in escrow in this MVP.

### 3.3 Customer posting fees
Before publication:
- Free gig: ₦5,000.
- Paid gig: ₦10,000.

Flow:

```text
Create draft -> initialize Paystack test payment -> verify payment on backend -> mark posting fee paid -> publish gig
```

A gig must never become `published` because the frontend says payment succeeded. Backend verification is required.

### 3.4 Early-posting notice
The customer Create Gig experience must prominently display:

> For the best results, post your gig at least 2 months before the event. This gives talents enough time to apply and submit demos, and gives you enough time to review applicants and select the best fit.

This is advisory only. The system must **not** block a customer from posting an event less than two months away.

### 3.5 Talent paid-gig subscription rule
Talent subscription price:

```text
₦5,000 / month
```

A talent starts with:

```js
paidGigSubscriptionRequired = false
```

When that talent's application is first changed to `accepted` for a `paid` gig, the backend sets:

```js
paidGigSubscriptionRequired = true
```

After that point:
- Free gigs remain visible.
- Paid gigs are included in Browse Gigs only if the talent has an active subscription.
- If there is no active subscription, the UI shows a subscription prompt instead of Paid gigs.
- The already-accepted Paid gig remains accessible through My Applications/My Gigs so the talent does not lose access to a commitment already accepted.

### 3.6 Location privacy
Exact gig location is sensitive.

The backend is the source of truth and must redact/omit the exact `location` from talent-facing responses unless:
- the authenticated talent has an `accepted` application for that gig; or
- the requesting user is the owning customer; or
- the requesting user is an admin.

Hiding a location only with CSS is not acceptable.

### 3.7 Audition requirement
Each gig position contains exactly three requested audition songs.

An application must contain exactly three demo entries, each corresponding to one requested song.

### 3.8 Acceptance
For MVP simplicity, a customer may accept applicants until a position reaches its configured number of slots. The backend must prevent accepting more applicants than the position's slot count.

---

## 4. MVP Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing

### External services
- MongoDB Atlas: hosted database.
- Cloudinary: audition video uploads.
- Paystack Test Mode: posting-fee and talent-subscription demonstrations.
- Render: backend deployment.
- Vercel: frontend deployment.
- Postman: API testing.
- Google Stitch: UI reference/generation before implementation.
- GitHub: source control and collaboration.

No production money should be used for the class demo. Use Paystack test keys and test transactions only.

---

## 5. Out of Scope for MVP

Do not add these unless the entire required MVP is already complete and the instructor explicitly approves it:
- Real talent payouts.
- Escrow.
- Recurring card mandates or automatic subscription renewal.
- In-app chat.
- Push/SMS/email notifications.
- Google Maps/live tracking.
- Ratings/reviews.
- AI matching.
- Video calls.
- Social login.
- Password-reset email.
- Mobile application.
- Production identity/KYC verification.
- Refund/dispute automation.
- Wallets.
- Referral system.

---

## 6. Repository Structure

```text
giglink/
├── client/
│   └── src/
│       ├── app/                 # CAPTAIN ONLY shared app/router integration
│       ├── components/          # shared primitives created in foundation
│       ├── features/
│       │   ├── auth/            # Student 1
│       │   ├── customer/        # Student 2
│       │   ├── talent/          # Student 3
│       │   ├── payments/        # Student 4 / Captain
│       │   └── admin/           # Student 4 / Captain
│       ├── lib/                 # CAPTAIN ONLY shared API/config integration
│       └── main.jsx             # CAPTAIN ONLY
│
├── server/
│   └── src/
│       ├── app/                 # CAPTAIN ONLY startup/shared registration
│       ├── middleware/          # foundation/shared middleware: Captain
│       ├── modules/
│       │   ├── auth/            # Student 1
│       │   ├── users/           # Student 1
│       │   ├── gigs/            # Student 2
│       │   ├── customer/        # Student 2
│       │   ├── talent/          # Student 3
│       │   ├── applications/    # Student 3
│       │   ├── media/           # Student 3
│       │   ├── payments/        # Student 4 / Captain
│       │   └── admin/           # Student 4 / Captain
│       └── server.js            # CAPTAIN ONLY
│
├── docs/
│   ├── TASK_STUDENT_1.md
│   ├── TASK_STUDENT_2.md
│   ├── TASK_STUDENT_3.md
│   ├── TASK_STUDENT_4_CAPTAIN.md
│   └── CODEX_PROMPTS.md
│
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
└── package files
```

### Shared-file rule
Students 1-3 must not modify Captain-owned integration files, `package.json`, lockfiles, `.env.example`, `README.md` or `AGENTS.md` while implementing assigned feature tasks.

If their feature needs a shared integration change, they must report it as:

```text
INTEGRATION_REQUIRED:
- File: client/src/app/router.jsx
- Needed change: register TalentRoutes exported by features/talent/routes.jsx
```

The Captain performs that integration later.

---

## 7. Data Model Contract

### User

```js
{
  name: String,
  email: String,
  passwordHash: String,
  phone: String,
  role: "customer" | "talent" | "admin",
  accountStatus: "active" | "suspended",
  paidGigSubscriptionRequired: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### TalentProfile

```js
{
  userId: ObjectId,
  talentType: "instrumentalist" | "backup_vocalist",
  instruments: [String],
  bio: String,
  yearsExperience: Number,
  profilePhotoUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

For backup vocalists, `instruments` may be empty.

### Gig

```js
{
  customerId: ObjectId,
  title: String,
  eventType: String,
  description: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  applicationDeadline: Date,
  gigType: "free" | "paid",
  paymentRange: null | {
    min: Number,
    max: Number
  },
  positions: [
    {
      _id: ObjectId,
      roleType: "instrumentalist" | "backup_vocalist",
      instrument: String | null,
      slots: Number,
      auditionSongs: [String, String, String]
    }
  ],
  postingFee: Number,
  postingPaymentStatus: "unpaid" | "paid",
  publicationStatus: "draft" | "published" | "cancelled" | "completed",
  createdAt: Date,
  updatedAt: Date
}
```

### Application

```js
{
  gigId: ObjectId,
  positionId: ObjectId,
  talentId: ObjectId,
  demoVideos: [
    {
      songTitle: String,
      videoUrl: String,
      cloudinaryPublicId: String
    }
  ],
  note: String,
  status: "pending" | "accepted" | "rejected" | "withdrawn",
  createdAt: Date,
  updatedAt: Date
}
```

Unique business rule: one talent may submit at most one active application to the same position in the same gig.

### Payment

```js
{
  userId: ObjectId,
  gigId: ObjectId | null,
  purpose: "free_gig_post" | "paid_gig_post" | "talent_subscription",
  amount: Number,
  reference: String,
  status: "initialized" | "successful" | "failed",
  paidAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription

```js
{
  talentId: ObjectId,
  amount: 5000,
  paymentReference: String,
  status: "active" | "expired",
  startsAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. API Contract

All successful JSON responses should follow:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

### Auth / User - Student 1

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/users/me
```

### Customer / Gigs - Student 2

```text
POST   /api/gigs
GET    /api/gigs/customer/mine
GET    /api/gigs/customer/:id
PATCH  /api/gigs/:id
DELETE /api/gigs/:id
```

`POST /api/gigs` creates a DRAFT only. It does not publish without verified posting payment.

### Talent browsing/profile/applications - Student 3

```text
GET    /api/talent/profile
PUT    /api/talent/profile
GET    /api/talent/gigs
GET    /api/talent/gigs/:id
POST   /api/talent/gigs/:gigId/positions/:positionId/apply
GET    /api/talent/applications
PATCH  /api/talent/applications/:id/withdraw
POST   /api/media/videos
```

### Customer application review - Student 2 + Student 3 contract

Student 3 owns Application model/query services. Student 2 owns customer-facing review screens and customer controller entrypoint. They communicate through exported module services, not duplicated application logic.

```text
GET    /api/customer/gigs/:gigId/applications
PATCH  /api/customer/applications/:applicationId/status
```

During integration the Captain wires Student 2's customer controller to Student 3's exported application service.

### Payments/subscription - Student 4 / Captain

```text
POST   /api/payments/gig-post/initialize
GET    /api/payments/gig-post/verify/:reference
POST   /api/payments/subscription/initialize
GET    /api/payments/subscription/verify/:reference
GET    /api/payments/subscription/me
```

Verified gig-post payment publishes the matching draft.

### Admin - Student 4 / Captain

```text
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/status
GET    /api/admin/gigs
```

---

## 9. Security and Authorization Rules

- Passwords are hashed with bcryptjs.
- JWT is required for protected routes.
- Role checks happen on the backend.
- Suspended accounts cannot perform protected application actions.
- Customers may modify only their own gigs.
- Talents may modify only their own talent profile/applications.
- Exact gig location is redacted for unauthorized talent responses.
- Payment verification happens server-side using Paystack Test Mode credentials.
- Secret keys never appear in the client repository.
- Cloudinary secret/API secret stays on the server.
- Validate file type/size before upload.
- Do not trust role, price, posting fee, subscription state or application status sent by the client.

---

## 10. Environment Variables

Expected server variables:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
PAYSTACK_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Expected client variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Never commit real `.env` files.

---

## 11. Git Branching Strategy

Permanent branches:

```text
main     -> final known-good/demo branch
develop  -> integration branch managed by Captain
```

Students do not develop directly on `main` or `develop`.

### Initial foundation
Captain completes Task C00 first and merges it to `develop`.

After the Captain announces that C00 is complete, every student starts from the same base:

```bash
git checkout develop
git pull origin develop
```

Then create the assigned feature branch.

### Student branches

```text
Student 1: feature/auth-users
Student 2: feature/customer-gigs
Student 3: feature/talent-applications
Student 4: feature/payments-admin
```

### Create a branch

Example for Student 2:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/customer-gigs
git push -u origin feature/customer-gigs
```

### Commit style

```text
feat(auth): add registration service
feat(gigs): add paid gig validation
feat(talent): add application submission
fix(payments): verify gig posting reference
chore(integration): register feature routes
```

Commit after each approved task, not after the entire two-week project.

---

## 12. Integration Workflow

When a student's assigned task is approved:

1. Student commits the task.
2. Student pushes their feature branch.
3. Student gives the Captain the commit hash/task completion notice.
4. The Captain does **not** merge partial/unapproved work merely because it exists.
5. When the student's feature sequence is ready for integration, Captain updates `develop` and merges that feature branch.

Captain integration example:

```bash
git checkout develop
git pull origin develop
git merge --no-ff feature/auth-users
git merge --no-ff feature/customer-gigs
git merge --no-ff feature/talent-applications
git merge --no-ff feature/payments-admin
```

The exact order may change if integration testing reveals a dependency.

### Conflict rule
Even with isolated folders, Git conflicts can still happen because of accidental edits, formatting, lockfiles or shared files. Never assume conflicts are impossible.

If a conflict occurs, the Captain must:
- inspect both versions;
- preserve the intended behavior from both features;
- never choose `ours` or `theirs` blindly;
- run tests/build after resolution;
- document what was resolved.

Only Captain resolves integration conflicts on `develop`.

---

## 13. Final Merge to Main

The Captain may merge `develop` to `main` only after Task C06's final acceptance criteria pass.

```bash
git checkout main
git pull origin main
git merge --no-ff develop
git push origin main
```

Tag the demo build if desired:

```bash
git tag -a v1.0.0-mvp -m "GigLink demo MVP"
git push origin v1.0.0-mvp
```

---

## 14. Demo Seed Scenario

Prepare at least:

### Customer
- One customer account.
- One published Paid gig with a payment range such as ₦50,000-₦80,000.
- One published Free gig.

### Talent
- One instrumentalist account.
- Completed talent profile.
- Three short demo video files suitable for Cloudinary test uploads.

### Demo flow
1. Customer shows existing gig cards with FREE/PAID labels.
2. Talent browses gigs; location is hidden.
3. Talent applies to the Paid gig and submits 3 demos.
4. Customer opens applicants and accepts the talent.
5. Talent refreshes My Applications and sees `Accepted` plus the exact location.
6. Talent's first accepted Paid gig triggers the paid-gig subscription requirement.
7. Browse Gigs now shows Free gigs but gates Paid gigs.
8. Talent completes a ₦5,000 Paystack test subscription.
9. Paid gigs become visible again.
10. Admin shows customer/talent account management.

---

## 15. Definition of Done

The MVP is done when:
- New customer and talent accounts can register/login.
- Auth persists correctly during ordinary navigation.
- Customer can create valid Free/Paid gig drafts.
- Paid gig payment minimum is enforced.
- Posting-fee payment verification publishes the draft.
- FREE/PAID labels are visible.
- Talent can browse according to subscription rules.
- Exact location is not leaked before acceptance.
- Talent can submit exactly three requested demos.
- Customer can review/accept/reject.
- Slot over-acceptance is blocked.
- First accepted Paid gig triggers paid-gig subscription requirement.
- Subscription payment restores Paid gig feed access.
- Admin can list/suspend/reactivate customers/talents.
- Suspended-user protection works.
- Integrated client and server build/run without fatal errors.
- No secrets are committed.
- No placeholder critical flow remains.
- Demo flow has been rehearsed from a fresh browser session.

---

## 16. Student Task Documents

Each student must read this README and only their assigned file:

```text
docs/TASK_STUDENT_1.md
docs/TASK_STUDENT_2.md
docs/TASK_STUDENT_3.md
docs/TASK_STUDENT_4_CAPTAIN.md
```

Everyone must also follow `AGENTS.md` and `docs/CODEX_PROMPTS.md`.

The AI agent must execute one task ID at a time and stop for instructor approval after each task.
