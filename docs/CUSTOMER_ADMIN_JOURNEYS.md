# Customer and Admin journeys — 12 October 2026

Current implementation, not a roadmap promise. No legacy data migration, online payments, CRM sync, Zoom sync or agent orchestration is active. See ARCHITECTURE_DECISIONS.md and EMAIL_FLOW_AUDIT.md for boundaries and delivery evidence.

## Customer journey

| Entry / intent | Public route and action | Business record / next step |
| --- | --- | --- |
| Find the right route | Home → Start Here | Choose Learn, Build, Solve or Community; no account required |
| Understand TRConcept | About → Explore the approach | Read founder/approach; About hero no longer sends directly to Community |
| Learn practical AI | Learn → Level 1 / Level 2 → registration form | Contact, enrolment, submission, optional consent and queued email saved atomically; acknowledgement follows |
| Try a community session | Community → available session → Reserve a seat | Contact and session registration saved; confirmation email follows; owner sends access details before session |
| Commission a website | Build → Talk about your website → contact form | Enquiry saved; visitor acknowledgement and independent owner notification |
| Discuss a business problem | Solve → contact form | Same enquiry workflow with Solve intent |

Level 1 is the foundation and Level 2 expands the architecture. Course registration is an expression of interest/registration, not automatic payment or a guaranteed cohort assignment. Class dates and confirmation are arranged directly. Duplicate course/session registrations do not resend email or reset state.

Build offers website design/development with optional business-specific administration, forms and integrations, scoped per project. It does not promise a full CRM or identical backend for every client.

## Owner / Admin journey

1. Log in at `/admin` with the website Admin account. Supabase Auth verifies identity; active Admin membership grants access. There is currently no self-service forgot-password screen; owner recovery remains an open task.
2. Review Dashboard, then Form submissions for enquiries and Contacts for the linked person. Owner enquiry notifications go to `hello@trconcept.co` by default; Reply-To is the enquirer's email.
3. For courses: create a cohort, review Enrolments, confirm/waitlist/assign a person as appropriate. Record payment independently as PENDING/PARTIAL/PAID/REFUNDED/NOT_REQUIRED. Payment collection is manual.
4. For Community: create/publish the session and review registrations. Send Zoom/access details manually. Mark ATTENDED/NO_SHOW/CANCELLED manually; this is not an automatic Zoom attendance feed.
5. Open the person's Contact journey to see linked community/course participation and current marketing permission. Where a community session led to an enrolment, select that source explicitly. Do not infer conversion merely from two records existing.
6. Review Email logs for FAILED or QUEUED attempts. SENT means provider acceptance, not guaranteed inbox delivery. Inspect ambiguous attempts before any manual resend; no retry worker is active.
7. Review consents, authorised public content and case-study permissions in their respective areas. Existing next-action/follow-up fields are internal planning; saving does not send marketing messages.

## Ownership and verification limits

Supabase owns stable UUIDs, readable record codes, registrations, enrolments, operational states and consent. Admin remains useful without CRM. Future Brevo/other CRM sync must occur server-side after business records are saved, with failures isolated from registration.

Contact acknowledgement reached the owner's Gmail inbox on 9 October. New owner-alert email was accepted by Brevo; forwarding and Reply-To still await owner confirmation. Full authenticated production class/community mutation walkthrough is not certified. Visual checks and local regression tests must not be described as that certification.
