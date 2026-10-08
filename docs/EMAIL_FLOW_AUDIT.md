# Email audit — 2026-10-08

Current transport: Resend via lib/email.ts. Brevo is an existing owner business system/candidate CRM, not an implemented website integration.

Course/community registration uses register_participation_v1: commit business data and QUEUED email log first; send after commit; update SENT/FAILED. Duplicate registrations return without another email. Provider failure does not cancel enrolment. SENT means provider acceptance, not delivery. No automatic retry worker or delivery webhook exists. A crash can leave QUEUED; check provider before retrying.

Enquiry and case-study permission routes send only after checked business writes, but still use separate statements, not the atomic registration RPC. Enquiry inserts email log after sending and currently ignores log insertion failure: improve with a durable queued log before send and checked result in a later coherent backend pass. Neither workflow is a CRM campaign.

Production query on 2026-10-08 found zero email_logs rows. There is no real delivery evidence. RESEND_API_KEY has been configured previously, but sender domain authorization, provider key validity, inbox delivery and replies are not certified. Defaults EMAIL_FROM / EMAIL_REPLY_TO use hello@trconcept.co. The owner's Gmail admin identity does not change these defaults. Do not substitute Gmail as a Resend sending domain.

Next: verify provider/domain access read-only; confirm owner-approved controlled test inbox and explicit send authorization; exercise registration once, duplicate once (no second mail), inspect stored participation/log/provider acceptance and recipient delivery. Do not email real students or create public fake community sessions. Do not move transport to Brevo as an incidental CRM change.
