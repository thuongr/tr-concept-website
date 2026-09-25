# TRConcept V2 — Pre-launch QA

## Automated / code-level
- [x] Public site is independent from Brain/Heart/agent runtime.
- [x] Admin routes require Supabase authentication.
- [x] RLS enabled for business/customer tables.
- [x] Community registration saves DB record before attempting email.
- [x] Course registration saves DB record before attempting email.
- [x] Marketing consent is separate from service registration.
- [x] Case studies require APPROVED permission before public publishing.
- [x] Founder image is replaceable.
- [x] Legacy V1 runtime removed from V2 branch.
- [x] Hard-coded legacy Resend credential removed from V2 tree.
- [x] robots.txt excludes /admin and /api.
- [x] Sitemap present.
- [x] CI performs TypeScript check + production build.
- [x] User-controlled values inserted into transactional email are HTML-escaped.

## Production configuration — requires owner/account access
- [ ] Revoke/rotate the Resend API key that existed in legacy Git history.
- [ ] Create/confirm hello@trconcept.co mailbox.
- [ ] Verify trconcept.co sending domain in Resend.
- [ ] Create Supabase production project.
- [ ] Run migrations 001 → 002 → 003.
- [ ] Create the owner/admin Supabase Auth account.
- [ ] Add Netlify environment variables from .env.example.
- [ ] Confirm NEXT_PUBLIC_SITE_URL=https://trconcept.co.
- [ ] Add approved founder image URL through Admin.
- [ ] Create first Community Session through Admin.

## End-to-end QA after production configuration
- [ ] Community: valid registration.
- [ ] Community: duplicate registration.
- [ ] Community: full session.
- [ ] Community: closed session.
- [ ] Community: Resend failure still preserves registration.
- [ ] Course: Level 1 registration.
- [ ] Course: Level 2 registration.
- [ ] Course: waitlist.
- [ ] Course: duplicate registration.
- [ ] Course: Resend failure still preserves enrolment.
- [ ] Contact form.
- [ ] Case-study permission form.
- [ ] Case-study publish blocked without approval.
- [ ] Case-study withdrawal archives public item.
- [ ] Admin login/logout.
- [ ] Mobile navigation.
- [ ] Mobile forms.
- [ ] Legal links.
- [ ] 404 page.
- [ ] Sitemap and robots.
- [ ] Production build and Netlify deploy.

## Launch rule
Do not add agents, Zoom API, automated scheduling, LMS, CRM, or workflow automation before this list passes. V2 launches as the minimum sufficient operating system.
