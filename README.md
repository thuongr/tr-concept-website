# TRConcept Website V2

Clean rebuild of the TRConcept public website + lightweight business admin.

## Stack
- Next.js + TypeScript
- Supabase Postgres + Auth
- Resend
- Netlify

## Core architecture
- Education first.
- Public website does **not** read internal Brain/Heart files.
- Business records are saved before email is attempted.
- Detailed class scheduling remains human-managed.
- The website works without agents.
- Future agents connect through controlled APIs, not direct database access.

## Setup
1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project and run `supabase/migrations/001_initial.sql`.
3. Create at least one Supabase Auth admin user.
4. Configure Resend.
5. Run `npm install && npm run dev`.

Hero/founder imagery is replaceable through `NEXT_PUBLIC_HERO_IMAGE_URL`.
