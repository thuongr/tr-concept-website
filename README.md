# TRConcept Website V2

Clean rebuild of the TRConcept public website + lightweight business admin.

## Stack

- Next.js 16 + TypeScript
- Supabase Postgres + Auth
- Resend
- Vercel

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
2. Create a **new independent** Supabase project. Do not import the old website data.
3. Run the SQL migrations in order:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_content_and_rls.sql`
   - `supabase/migrations/003_case_study_fields.sql`
   - `supabase/migrations/004_contact_location.sql`
   - `supabase/migrations/005_people_operations.sql`
   - `supabase/migrations/006_atomic_registration.sql`
4. Create the verified owner Auth account and insert its UUID into `admin_members`. Authentication alone does not grant admin access.
5. Configure Resend and the environment variables.
6. Run:
   ```bash
   npm install
   npm run dev
   ```

## Admin

After the new Supabase project, migrations, environment and owner membership are configured:
- `/admin/login`
- `/admin`

Admin currently supports:
- homepage hero + footer brand line editing;
- Community Session creation;
- Community attendance management;
- course enrolment review;
- cohort creation and assignment;
- a single-person journey across community and courses, immutable display codes, status history and follow-up planning;
- explicit community-to-course source attribution and marketing-consent withdrawal;
- contacts, submissions, consent and email logs;
- permission-gated case-study publishing.

## Visual and backend handoff

Read `docs/WEBSITE_HANDOFF.md` before frontend changes. The approved growth-tree artwork is fixed so traced motion stays aligned.

Read `docs/PEOPLE_AND_COMMUNITY_BACKEND.md` for the ID dictionary, status definitions, agent boundaries, fresh-project activation and verification limits. Production is not operational until Supabase is connected.

Run `npm run test:admin`, `npm run test:database`, and `npm run check`. Database regression tests run in isolated in-memory PostgreSQL with no production credentials.

## Pre-launch

- create the real `hello@trconcept.co` mailbox;
- verify the Resend sending domain;
- run all Supabase migrations;
- configure Vercel environment variables;
- create and allowlist the verified owner;
- create the first Community Session;
- test forms and email failure paths;
- complete final legal/compliance review.

## Security

Do not commit API keys or service-role keys.  
The V2 branch deliberately removes the legacy runtime, old agent/MCP code, committed `node_modules`, and the old hard-coded email credential file.
