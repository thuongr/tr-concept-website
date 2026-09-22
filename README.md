# TRConcept Website V2

Clean rebuild of the TRConcept public website + lightweight business admin.

## Stack

- Next.js 16 + TypeScript
- Supabase Postgres + Auth
- Resend
- Netlify

## Core architecture

- Education first.
- Public website does **not** read internal Brain/Heart files.
- Approved business content lives in the business data layer.
- Business records are saved before email is attempted.
- Detailed class scheduling remains human-managed.
- The website works without agents.
- Future agents connect through controlled APIs, not direct database access.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project.
3. Run the SQL migrations in order:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_content_and_rls.sql`
   - `supabase/migrations/003_case_study_fields.sql`
4. Create at least one Supabase Auth admin user.
5. Configure Resend and the environment variables.
6. Run:
   ```bash
   npm install
   npm run dev
   ```

## Admin

After Supabase Auth is configured:
- `/admin/login`
- `/admin`

Admin currently supports:
- homepage hero + footer brand line editing;
- Community Session creation;
- Community attendance management;
- course enrolment review;
- cohort creation and assignment;
- contacts, submissions, consent and email logs;
- permission-gated case-study publishing.

## Hero image

The founder hero image is replaceable from Admin (stored as a URL in business settings).  
The layout does not depend on one exact photo.

## Pre-launch

- create the real `hello@trconcept.co` mailbox;
- verify the Resend sending domain;
- run all Supabase migrations;
- configure Netlify environment variables;
- create the first admin user;
- replace the founder placeholder with an approved real image;
- create the first Community Session;
- test forms and email failure paths;
- complete final legal/compliance review.

## Security

Do not commit API keys or service-role keys.  
The V2 branch deliberately removes the legacy runtime, old agent/MCP code, committed `node_modules`, and the old hard-coded email credential file.
