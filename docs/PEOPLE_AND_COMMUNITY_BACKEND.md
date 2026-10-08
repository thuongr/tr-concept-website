# People, learning and community — backend contract v1

Updated 2026-10-05. This is the new `thuongr/tr-concept-website` backend only. No records, accounts, database connections or legacy API integrations are imported from the old site. Domain routing is unchanged. Existing public content and routes remain intact.

## Architecture boundary (2026-10-08)

See `ARCHITECTURE_DECISIONS.md`: this Admin owns TRConcept operations, not generic CRM. Existing relationship/follow-up fields remain transitional and must not be expanded into sales pipelines or campaigns. Future CRM sync is server-side, provider-neutral and follows the committed business record; no integration is implemented.

## Deployment status

Fresh project `trconcept-website` (`auxqtrwkqywpkvgqyqqt`) now exists in `thuongr’s team`, Sydney (`ap-southeast-2`), on the confirmed free plan. All repository migrations, including internal-function hardening, are applied. PostgreSQL is 17.11. The website's URL and publishable key are configured for Vercel production only.

Server secret was configured and redeployed on 2026-10-06; owner Auth membership and owner login were verified. End-to-end registration/email delivery certification remains incomplete. The connected plugin supports SQL and public keys but not secret-key retrieval or Auth account management; dashboard sign-in is needed for those steps. Do not create another project or import legacy data. No real participant registrations or emails were used in tests.

## Identity and relationships

Every table retains its full UUID `id` as the canonical key. Foreign keys use descriptive names. Display codes use a global sequence, e.g. `PER-00000001`; they are not credentials, not URLs for public access, and need not be consecutive within one table. IDs and codes cannot be edited. Never join records by name or display code.

| Entity | Display prefix | Canonical relationships | Meaning |
|---|---|---|---|
| contacts | PER | `id` / downstream `contact_id` | One person across all journeys |
| courses | CRS | `offer_id` | Curriculum/product, not a class cohort |
| cohorts | COH | `course_id` | A particular small class group |
| enrolments | ENR | `contact_id`, `course_id`, optional `cohort_id` | A person's registration for a course |
| community_sessions | COM | `id` / downstream `community_session_id` | One scheduled community/Zoom event |
| community_registrations | REG | `contact_id`, `community_session_id` | One person's participation in one event |
| form_submissions | SUB | `contact_id` | Submitted details and source evidence |
| consent_records | CNS | `contact_id` | An append-only consent decision |
| email_logs | EML | `contact_id`, `submission_id` | Transactional email attempt and provider acceptance |
| activity_events | UUID only | `contact_id`, `entity_type`, `entity_id` | Append-only operational state history |

Emails are trimmed/lowercased and unique. This is an email-based contact identity, not proof of a person's identity. A person returning with the same email reuses the contact. A different email is not silently merged. Shared emails, typos and identity corrections need an owner-reviewed future merge/correction workflow.

Public forms cannot overwrite an existing person's name/business/profile. Each new submission keeps the supplied details for review. Course registration still permits one enrolment per contact/course, preserving existing business behaviour. Repeat-course enrolments would need a deliberate model change; do not remove that uniqueness just to resolve duplicates.

## Separate state dimensions

| Field | Values | Interpretation |
|---|---|---|
| `contacts.relationship_status` | NEW, ENGAGED, INTERESTED, FOLLOW_UP, NOT_NOW | Owner's relationship assessment; not academic or payment status |
| `contacts.next_action` | Free text, max 1,000 characters | Internal plan; saving never sends a message |
| `contacts.follow_up_on` | Date | Owner's Brisbane-calendar planning date |
| `community_registrations.status` | REGISTERED, ATTENDED, NO_SHOW, CANCELLED | Actual event participation |
| `enrolments.status` | NEW, CONFIRMED, WAITLIST, ASSIGNED, COMPLETED, CANCELLED | Course participation |
| `enrolments.payment_status` | PENDING, PARTIAL, PAID, REFUNDED, NOT_REQUIRED | Manual payment record; separate from participation |
| `enrolments.currency` | AUD | Current approved pricing currency |
| `email_logs.status` | QUEUED, SENT, FAILED | SENT means provider accepted, not confirmed delivered |

Selecting ATTENDED records when attendance was marked; it is not a Zoom join timestamp. Saving ATTENDED again preserves the timestamp. Correcting it to NO_SHOW/CANCELLED clears the current attendance timestamp but the earlier value remains in history. Attendance is manual: there is no Zoom integration yet.

Current course status/payment/cohort validation remains. Database triggers also enforce allowed values, cohort/course consistency, assigned-cohort presence and parent-row-locked capacity checks. Cancelled participation does not consume a seat. Historical non-cancelled community participation does; marking ATTENDED must not open an extra place.

History records old/new operational values, event time, full entity ID and authenticated actor UUID. Sensitive full profile snapshots are not copied into audit events. Browser users cannot modify/delete history. Retention/deletion operations need a separate owner-controlled workflow.

## Sources, conversion and consent

- `contacts.first_source` is the first entry route (COMMUNITY, COURSE or WEBSITE).
- A participation links to its `submission_id`. Submissions retain approved source page and current-page `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` if supplied.
- UTM labels are unverified attribution metadata, not identity or consent. There are no new tracking cookies or cross-site IDs. Labels are captured only on the submitted page; cross-page first-touch tracking is not implemented.
- `enrolments.source_community_registration_id` is an **explicit owner-selected** community source. It must belong to the same contact, enforced by the database. Do not auto-attribute every later purchase to the most recent event.
- A course registration is not a purchase. A payment status is not confirmed attendance/completion. Reports must name the metric they count.
- Community participation is not marketing consent. The registration checkbox is an optional grant with versioned wording and source evidence.
- Current marketing permission is the most recently recorded MARKETING_EMAIL event, ordered by database event number. Absence of consent = false. A withdrawal creates another event; it never erases a grant.
- Admin can record a withdrawal with evidence. It cannot grant consent on a person's behalf. An explicit later public grant can supersede withdrawal; this records the submitted choice, not independently verified email ownership.
- `community_registrations.marketing_consent` is a historical checkbox snapshot only. Always read current permission from the contact journey before planning outreach.
- No marketing campaign or automated outreach was activated. The profile UI is internal planning only.

## Atomic registration and email boundary

`register_participation_v1` is executable only by `service_role` on the server. It validates availability, serializes same-email requests, locks the community session, resolves the contact and commits participation + submission + optional consent + queued email log in one transaction. Failure rolls all those writes back. Duplicate registration returns without resetting payment/status or sending another email.

Email is sent after commit. The existing queued log is updated to SENT/FAILED. A crash or failed log update leaves QUEUED visible under “Emails to check”. Check the provider before resending; there is no automatic retry worker yet. Registration itself must not be rolled back because an email provider failed.

The enquiry and case-study-permission handlers retain their existing multi-write flow, with identity overwrite protection. They are not part of the atomic course/community RPC. Their transaction/outbox hardening remains separate follow-up work.

## Admin screens

- `/admin/contacts`: paginated/searchable people, relationship state, counts, follow-up dates, current marketing permission.
- `/admin/contacts/[id]`: linked community/course records, submission source labels, next action, withdrawal workflow, latest 100 history events. This page clearly labels its history limits.
- `/admin/enrolments`: participation/payment/cohort, plus explicit community source selection.
- `/admin/community/registrations`: attendance and links back to the person. Registration checkbox shown as historical consent, not current permission.
- Cohorts, sessions, enrolments and email logs show human-readable codes.
- Class scheduling remains the existing human-managed cohort workflow. No lesson-by-lesson attendance, homework, Zoom synchronization or agent scheduler has been added.

## Access and future agents

Being authenticated is insufficient. Every protected page and mutation checks `is_admin()`, backed by `admin_members`. RLS independently requires active membership. Public signup cannot create membership; no owner is seeded from an unverified email address. Login rejects non-admin accounts.

Anonymous session reads have an explicit column grant excluding `meeting_url`. This avoids relying on row policies to protect a private Zoom link. Public forms use server credentials; the service-role key must never reach a browser or agent prompt.

Versioned reporting views:

- `contact_journey_v1`: one row per person; distinct state dimensions and current permission.
- `community_course_journey_v1`: one row per registration/explicitly linked enrolment; includes course, cohort, attendance and payment fields. Unattributed enrolments are intentionally not fabricated as conversions.

Both use `security_invoker=true`; non-admin authenticated users see no people/participation data. These are reporting foundations, **not a deployed agent API**. For future agents: introduce a separate authenticated, read-only reporting endpoint with a minimal field allowlist; use stable UUIDs and versioned responses; deny general SQL/service keys. Management actions should use narrow validated commands, an explicit agent principal, idempotency keys and the existing audit history. Agent-specific principals/permissions and automatic messages require another implementation pass.

## Fresh-project activation

1. Create a new Supabase project for this site, separate from the old system. Confirm account/region/plan before paid provisioning.
2. Apply all files in `supabase/migrations` in filename order, including the timestamped hardening migration. Do not import legacy data. Migration 002 no longer installs any blanket authenticated policies; 005 installs explicit membership policies.
3. Create the owner's auth account using Supabase's authenticated owner setup. Record its actual UUID. Disable public signups if no public auth is needed.
4. In the new project's SQL editor, insert that verified UUID into `public.admin_members(user_id,role)` with role OWNER. Do not seed public business email as an owner automatically.
5. Set Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY` (legacy `SUPABASE_SERVICE_ROLE_KEY` remains a compatibility fallback) for intended environments. A separate preview project is preferred; never run fixture tests on production.
6. Keep the legacy `WEBSITE_API_URL` unused. Do not point it at the old backend. Do not change domain/DNS yet.
7. Redeploy. Verify owner login, outsider denial, RLS, public private-link protection, one isolated test community registration → attendance → course registration → cohort/payment → follow-up → consent withdrawal. Use a controlled test inbox before enabling delivery; do not send to real participants.
8. Recheck desktop/mobile admin, provider delivery configuration, remaining open audit items, and the production error logs. Only then call the backend operational.

## Verification

- `npm run test:database`: all migrations exercised in isolated PGlite PostgreSQL. Tests cover public/private access, admin membership, atomic rollback, identity reuse, idempotence, attendance timestamps, immutable IDs/history, withdrawal, explicit attribution, capacity and RLS-aware views. Only the `pgcrypto` extension declaration is omitted in this harness; `gen_random_uuid()` is built into PostgreSQL.
- `npm run test:admin`: mocked HTTP-route tests; no real auth/database/email writes.
- `npm run typecheck` and `npm run build`.
- Local real-page rendering with synthetic fixtures at 1440/820/390, plus interactive form checks. Fixtures are not published customer evidence.
- Embedded tests do not prove hosted Supabase/PostgREST behaviour or simultaneous real-connection concurrency. Run those checks after connection.

### Production checkpoint

- Foundation commit `6ded097292b2f283417081a287c4ca67d1e9654d` deployed READY on Vercel, production alias confirmed.
- Homepage and Level 1 inspected at 1440/820/390: no horizontal overflow; terrain remains unclipped; reduced-motion mode has no active animations.
- All nine protected admin mutation routes return setup-unavailable (503) with the missing configuration, rather than accepting writes. This is a blocker, not a passing authenticated end-to-end test.
- Direct admin subpages initially showed an empty content area while configuration was absent; the shared admin layout now supplies the same explicit setup state on every route.
- No Vercel drains are configured. The runtime-error query returned 403, so no clean runtime-log claim is made.


### Hosted database verification — 2026-10-05

- Applied 001–006 plus `20261005094139_harden_internal_function_access.sql` to the fresh project.
- Automatic review rejected historical migration 002's unrestricted authenticated access. Removed that block from the repository and applied the safer migration successfully; no broad policy was approved or bypassed.
- Moved privileged trigger handlers and the membership lookup into `private`. Public `is_admin` is an invoker wrapper; display-code generation no longer uses elevated privileges.
- Supabase Security Advisor now has no WARN/ERROR entries. One INFO remains for `admin_members`: RLS with no direct policies is deliberate, and direct anon/authenticated table privileges are revoked. The private membership function reads only the caller's own membership. See https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.
- Hosted rollback-only SQL smoke test verified atomic registration, case-insensitive duplicate prevention, full-session rollback, shared identity, explicit course source, consent withdrawal, audit events, immutable identity, anonymous denial/private meeting column denial, private RPC denial and non-admin reporting denial. Persisted contacts and community sessions both remained zero. No email provider was invoked.
- This does not yet verify a real owner login, hosted HTTP form submission, delivery or multi-connection capacity contention. Finish those after dashboard credentials/configuration are available.
