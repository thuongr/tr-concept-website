# TRConcept architecture decisions

## ADR-001 — Business control Admin and connected CRM
**Date:** 2026-10-08 (Australia/Brisbane)  
**Decision:** Keep a lightweight TRConcept Admin and own business-specific logic/data in Supabase. Use a replaceable external CRM for generic relationship capabilities. Brevo is the first candidate, not a permanent dependency.  
**Context:** The new independent website has operational registration/admin functionality plus some contact follow-up fields. The owner already uses Brevo for business email infrastructure; this repository currently sends transactional email through Resend. Website completion remains the priority.  
**Why:** Own your business logic. Connect commodity infrastructure. Avoid rebuilding a CRM or making registration dependent on one.  
**Consequences:**
- Public website → TRConcept server/API → business data, managed by TRConcept Admin. Future server-side CRM integration reads committed business events. Admin must remain useful during CRM outages; frontend must never call Brevo directly.
- Supabase owns courses, cohorts, enrolments, registrations, attendance, consent evidence/current permission, case-study publishing permission, CMS and TRConcept operational state/history.
- Retain minimal local contact identity and canonical contact UUID for operational joins. Submitted profile snapshots remain evidence. Future CRM may own generic profile, lead/deal pipeline, segmentation, campaigns, sales follow-up and marketing activity. Before sync, define per-field source of truth, direction and conflict rules; do not assume both systems are authoritative.
- Preserve existing contacts, relationship_status, next_action, follow_up_on and UI. These are transitional overlap, not a mandate to expand the Admin. Refactor only with a reviewed migration and no loss of operational data.
- No new CRM tables, SDKs, credentials or interfaces now. At first useful integration, add a small server-only CRMService and adapter for only needed operations (initially contact upsert/sync). Potential later operations: getContact, createDeal, updateDeal, addTag, recordRelevantEvent. Do not implement speculative methods/providers.
- Business transaction first, external sync second. Later use durable retryable sync work with idempotency, operational status and provider/external-ID mapping when required. CRM failure must never roll back a valid registration or require CRM availability to use Admin.
- Consent remains a business source of truth: synchronize permitted changes only, reconcile CRM-originated withdrawal into local consent evidence, and never treat registration or tags as marketing permission. Define this before enabling campaigns.
- Do not migrate email transport merely because Brevo is the CRM candidate. Delivery infrastructure and CRM are separate integration choices.
- No generic CRM, deals/pipeline UI, campaign engine, marketing automation or communication-history clone in this rebuild. No destructive table removal or old-site migration.
**Status:** Accepted; documented boundary applies now. CRM implementation deferred.

## ADR-002 — USE / CONNECT / BUILD
**Date:** 2026-10-08  
**Decision:** Build what is specific. Use what is commodity. Connect what is complex. Minimum sufficient system first.  
**Context:** Both custom development and extra SaaS can increase operational burden.  
**Why:** Assess Money, Time, Mental Load, Risk, owner/team capability and business complexity/scale together.  
**Consequences:** USE existing SaaS when it sufficiently solves the problem at low total burden. CONNECT mature systems already depended upon or unreasonable to rebuild. BUILD lightweight business-specific capability where technically reasonable and more efficient. This is not authorization to add systems. Record consequential provider/ownership decisions here.  
**Status:** Accepted.

## ADR-003 — Future agent boundary
**Date:** 2026-10-08  
**Decision:** Future agents use controlled APIs/services for business workflows and the same integration layer for external systems.  
**Context:** Stable IDs, audit records and RLS-aware reporting views already exist, but no agent API exists.  
**Why:** Preserve authorization, auditability and human approval for consequential actions.  
**Consequences:** No unrestricted database/service key access for agents. Later use least privilege, validated commands, idempotency and actor tracking; preserve human approval. No agent orchestration in the website MVP.  
**Status:** Accepted direction; implementation deferred.
