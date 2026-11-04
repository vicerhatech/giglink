# Account, appearance and Admin release notes

## Subscription cancellation

Talent Settings uses the real `GET /api/payments/subscription/me` state. The pass costs ₦5,000 for 30 days and is a one-off Paystack Test Mode payment, not automatic recurring billing.

`POST /api/payments/subscription/cancel` requires Talent authentication and `{ "confirm": true }`. It ends active subscription discovery access immediately, marks active passes `cancelled`, and records `cancelledAt`. It does not issue a refund. Free gigs and accepted-gig/application access remain available. Repeating cancellation is harmless; verifying an old successful reference does not reactivate a cancelled pass. A new verified payment can create a new pass.

## Account deletion

`DELETE /api/users/me` requires authentication, the current password, and `{ "confirmation": "DELETE" }`. A transaction removes the User and TalentProfile, cancels active subscriptions and open Customer gigs, and closes pending applications. Existing JWTs no longer authenticate because their User is absent. Upcoming accepted bookings block deletion with HTTP 409. Admin self-service deletion is disabled to prevent lockout.

Deletion is irreversible. It is **not** a promise of complete historical erasure: booking/payment records and media already held by Cloudinary remain. The UI explains this before confirmation. Provider-media cleanup and retention-policy review remain operational follow-ups.

## Appearance

Light, Dark and System modes plus Forest & Gold, Ocean Blue and Soft Plum palettes apply across public, auth and authenticated screens. Preferences are stored under `giglink_appearance` on the current browser/device, not in the User record. Header toggles provide quick access; Settings provides the full selection. No dependency was added.

## Admin

The Admin dashboard loads real account and gig summaries through existing Admin-only APIs. The role simulator is a labelled **read-only demonstration** of Customer/Talent navigation and workflows; it does not impersonate accounts, change roles/JWTs, or perform actions as another user. Real role testing requires separate demo accounts.

Provision Admin access only for an explicitly identified account through an approved development/operations mechanism. Public registration remains Customer/Talent only.
