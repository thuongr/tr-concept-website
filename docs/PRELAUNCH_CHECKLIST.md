# TRConcept V2 — Pre-launch checklist

## 1. Security first
- [ ] Revoke the legacy Resend API key that was previously committed to repository history.
- [ ] Create a new Resend API key.
- [ ] Confirm no production secrets are stored in Git.
- [ ] Keep the Supabase service-role key server-side only.

## 2. Business email
- [ ] Create the real mailbox: hello@trconcept.co.
- [ ] Confirm inbound mail works.
- [ ] Verify trconcept.co in Resend.
- [ ] Set EMAIL_FROM=TRConcept <hello@trconcept.co>.
- [ ] Set EMAIL_REPLY_TO=hello@trconcept.co.

## 3. Supabase
- [ ] Create/select the production Supabase project.
- [ ] Run 001_initial.sql.
- [ ] Run 002_content_and_rls.sql.
- [ ] Run 003_case_study_fields.sql.
- [ ] Create the first admin Auth user.
- [ ] Confirm /admin requires authentication.
- [ ] Confirm public users cannot write directly to protected tables.

## 4. Netlify environment
- [ ] NEXT_PUBLIC_SITE_URL=https://trconcept.co
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] RESEND_API_KEY
- [ ] EMAIL_FROM
- [ ] EMAIL_REPLY_TO
- [ ] NEXT_PUBLIC_HERO_IMAGE_URL only if using env fallback

## 5. Business content
- [ ] Upload/select final founder hero image.
- [ ] Check hero crop on desktop and mobile.
- [ ] Review Level 1: A$150 / 3 sessions / max 5 students.
- [ ] Review Level 2: A$450 / 9-session CORE / max 5 students.
- [ ] Review consulting: A$190 first 2-hour catch-up; A$150/hour thereafter.
- [ ] Confirm Build remains focused on landing pages / simple small-business web work.
- [ ] Create first Community Session.

## 6. End-to-end tests
- [ ] Level 1 enrolment saves contact + enrolment + submission.
- [ ] Level 2 enrolment saves correctly.
- [ ] Community registration saves correctly.
- [ ] Community registration works even if confirmation email fails.
- [ ] Consulting enquiry saves correctly.
- [ ] Build enquiry saves correctly.
- [ ] Confirmation emails arrive and reply to hello@trconcept.co.
- [ ] Admin can create a cohort and assign an enrolment.
- [ ] Admin can mark Community attendance.
- [ ] Case study cannot publish without APPROVED permission.
- [ ] Withdrawn permission removes/archives public proof.
- [ ] Mobile navigation works.
- [ ] 404, sitemap.xml and robots.txt work.

## 7. Legal/compliance review
- [ ] Confirm business identity and ABN display.
- [ ] Final review of Privacy.
- [ ] Final review of Terms.
- [ ] Finalise course/service cancellation and change-of-mind rules before online payment.
- [ ] Confirm case-study/media permission wording before collecting production permissions.

## 8. Launch
- [ ] npm run check passes.
- [ ] Netlify deploy preview reviewed.
- [ ] Domain points to V2.
- [ ] Smoke-test production forms.
- [ ] Only then merge/retire V1.

## Deliberately NOT in V2 launch scope
- No direct agent database access.
- No automated class scheduling.
- No AI-generated publishing without approval.
- No payment system until commercial/refund rules are final.
- No dependency on Brain/Heart files for public website runtime.
