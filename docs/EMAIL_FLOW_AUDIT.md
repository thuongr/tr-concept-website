# Email audit — current checkpoint 2026-10-09

Brevo is active; owner confirmed the 9 October visitor acknowledgement reached Gmail Inbox. CRM is not integrated. Signature/logo unchanged pending new brand identity.

Contact saves the submission before sending two separately logged emails: ENQUIRY_ACKNOWLEDGEMENT to the visitor and ENQUIRY_OWNER_NOTIFICATION to CONTACT_NOTIFICATION_EMAIL (default hello@trconcept.co). Owner Reply-To is the validated visitor address. Case-study permission confirmation also uses lib/logged-email.ts. The helper requires a successful QUEUED insert before sending and checks SENT/FAILED update errors. If logging fails before sending, business data is preserved and the send is skipped with an operational error. If result persistence fails, QUEUED remains; check provider before any manual retry. SENT means provider acceptance, not delivery.

Course/community registrations retain their atomic registration/consent/queued-log RPC, followed by send. Duplicates do not resend. No automatic retry, delivery webhook, or atomic Contact outbox yet. A process interruption between submission and queue creation is a remaining recovery limitation; Admin submissions remain the business source of truth.

Tests: 30 route regressions, email transport success/rejection/timeout/no-fallback checks, TypeScript/build. Owner notification production receipt and reply routing await controlled verification. Do not label the complete email system certified from a successful acknowledgement alone.

Operational history: 8 October controlled test failed HTTP401 because owner supplied SMTP key. On 9 October replacement API key and redeploy succeeded; acknowledgement log BREVO/SENT, owner confirmed Inbox. Clearly labelled test enquiries remain in business data and should be excluded from reporting.
