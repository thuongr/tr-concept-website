# Email audit — 2026-10-08

Active production transport remains Resend via lib/email.ts until explicit cutover. The code now supports Brevo transactional sending behind EMAIL_PROVIDER=brevo; this is email transport, not CRM integration.

Course/community registration uses register_participation_v1: commit business data and QUEUED email log first; send after commit; update SENT/FAILED. Duplicate registrations return without another email. Provider failure does not cancel enrolment. SENT means provider acceptance, not delivery. No automatic retry worker or delivery webhook exists. A crash can leave QUEUED; check provider before retrying.

Enquiry and case-study permission routes send only after checked business writes, but still use separate statements, not the atomic registration RPC. Enquiry inserts email log after sending and currently ignores log insertion failure: improve with a durable queued log before send and checked result in a later coherent backend pass. Neither workflow is a CRM campaign.

Production query on 2026-10-08 found zero email_logs rows. There is no real delivery evidence. RESEND_API_KEY has been configured previously, but sender domain authorization, provider key validity, inbox delivery and replies are not certified. Defaults EMAIL_FROM / EMAIL_REPLY_TO use hello@trconcept.co. The owner's Gmail admin identity does not change these defaults. Do not substitute Gmail as a Resend sending domain.

Next: verify provider/domain access read-only; confirm owner-approved controlled test inbox and explicit send authorization; exercise registration once, duplicate once (no second mail), inspect stored participation/log/provider acceptance and recipient delivery. Do not email real students or create public fake community sessions. Do not move transport to Brevo as an incidental CRM change.


## Brevo cutover preparation — 2026-10-08
Owner approved the sequence: operational website/email first, minimal CRM later. Owner reports hello@trconcept.co forwards inbound mail to her personal inbox; this does not establish transactional sending readiness.

Vercel environment metadata checked without decrypting values: RESEND_API_KEY exists; BREVO_API_KEY and EMAIL_PROVIDER do not yet exist. Code defaults to Resend to preserve existing behavior. All email call sites now record the selected transport in final email logs. Database QUEUED records retain their historical default until the send completes; a provider-neutral queued-log change is still needed before Brevo activation.

Required cutover steps:
1. Owner saves a Brevo API key (not SMTP key) directly as sensitive BREVO_API_KEY in Vercel production. Never paste credentials into chat.
2. Verify Brevo transactional activation and authenticated sender/domain hello@trconcept.co.
3. Set EMAIL_PROVIDER=brevo, EMAIL_FROM=TRConcept <hello@trconcept.co>, EMAIL_REPLY_TO=hello@trconcept.co and deploy a controlled release.
4. Controlled owner-inbox registration/receipt/reply test, plus duplicate registration and failed-send cases. Confirm provider acceptance separately from inbox delivery.
5. Only after successful cutover remove unused Resend credentials/dependency. No automatic cross-provider fallback: ambiguous timeouts must not create duplicate mail.

Transport fake-based regression tests cover API payload, absent key, provider rejection, ambiguous timeout, malformed success response, invalid provider and Resend compatibility without sending mail. No CRM contacts, lists or campaigns are created.

Launch gates still open: mobile visual QA; real course/community/Admin operational walkthrough; owner enquiry notification (current contact route acknowledges the visitor but does not notify the owner); queued/checkable enquiry/permission email logging; real sender/delivery/reply verification. CRM, online payment, Zoom sync and agents are not launch requirements.
