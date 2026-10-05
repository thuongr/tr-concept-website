# Admin flow audit — 5 October 2026

Scope: all admin route handlers, client forms, public registration/enquiry inputs that feed admin, source schema/RLS and published-content reads. No live customer records changed and no real emails sent. Payments remain manual.

## Fixed in application code
- Captured form elements before asynchronous work. Successful create/register actions no longer call `reset()` on a cleared React event target.
- Shared request helper returns actionable errors on network failure/timeout; saving buttons can recover. Contact prevents repeated clicks while sending.
- Logout redirects with HTTP 303 (GET), rather than forwarding POST to the login page.
- Community datetime input explicitly means Brisbane/AEST and is parsed as UTC+10; invalid calendar dates, fractional/negative capacities and unsafe URLs rejected. Admin date displays use Brisbane time.
- Duplicate course registration inserts with conflict-ignore rather than resetting existing paid/assigned/completed enrolments to NEW/PENDING. No duplicate acknowledgement is sent.
- Community rejects past sessions, recognises existing registrations and avoids overwriting attendance/cancelled records. Capacity query errors fail closed.
- Cohort assignment checks course, accepting status and available seats, and rejects ASSIGNED without a cohort.
- Missing case-study/community-registration updates return 404 rather than false success.
- Enquiry submission failure no longer sends a success email; name interpolation is escaped. Permission-record insertion errors are checked; selected consent rows are inserted together, and submission failures are surfaced.
- Course/community/contact confirmation text only promises email when the sender reports success.
- Admin submissions show person and submitted payload; consents show email and permission scope.
- Removed stray literal newline text from dashboard.
- CMS hero editor and public homepage now share `hero_landscape` content with the approved current copy as fallback. Legacy `hero` records are untouched. Newline separates gold emphasis. CTA must be an internal path. Image replacement field removed because the approved tree and traced motion are a single designed asset. Footer content remains editable.

## Remaining database/account checks — NOT certified by local tests
1. **High priority: owner-only access.** `requireAdmin` and API handlers currently accept an authenticated Supabase user. Checked-in RLS grants authenticated users broad management rights, based on a one-owner MVP assumption. Confirm production signup is disabled and only the owner account exists; then introduce an explicit owner/admin allowlist in both server checks AND database RLS before enabling other account types. Changing only the web UI is insufficient. No guessed owner ID or email was used and no access policy was changed without knowing the actual account.
2. **Capacity concurrency.** Application checks reject full sessions/cohorts, but count-then-write is not atomic. Database row locks/transactional RPC or triggers are needed to prevent simultaneous last-seat writes. No migration was applied in this session.
3. **Multi-table transactions.** Registration, submission, consent and email-log writes are separate requests. The new checks prevent several false-success paths, but cannot make the overall operation atomic. Plan transactional database functions and an email outbox before scaling.
4. **Meeting link privacy.** The public session UI omits the meeting URL, but checked-in public-read RLS is row-level and includes all columns of open sessions. Confirm actual grants and move/restrict meeting links at the database level; hiding a field in the page is not access control.
5. **Consent workflow.** Scope is now visible, but there is no owner UI for withdrawal/correction linked automatically to published proof. Case-study publication approval remains manually managed.
6. **Operational verification.** A signed-in owner session, applied migration state, provider delivery and real database permissions were not available for verification. Local/API tests are not a substitute for these checks.

## Validation
- `node tests/admin-regressions.cjs`: 20 cases pass with fake database/auth/email boundaries, covering authentication, dates, duplicate registration, full cohort, missing records, safe CTA, consent and enquiry failure handling, publication permission and logout.
- TypeScript + Next production build pass.
- Browser checks with intercepted responses passed for cohort/session/case-study/content forms (network failure, API rejection, success), community registration (same three cases), and public course/permission/contact forms (API rejection and success). Course network failure also passed. No browser exceptions in the completed public-form run. A temporary local-only component harness was removed before final build.
- Wave screenshots checked locally at 1440/820/390: no horizontal overflow, no clipped hero boundary, broad gold illumination across mesh and crests.

## Payment direction (not implemented)
Start with registration → owner confirms cohort/availability → owner sends payment link → owner marks payment received. Stripe Payment Links fits this stage. Later use Checkout with verified webhooks, enrolment IDs and idempotent event handling to automate reconciliation. Do not mark PAID from a success-page redirect. No checkout, processor account, payment link or live charge was created.
