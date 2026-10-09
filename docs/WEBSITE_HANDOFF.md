# TRConcept Website — Front-End Visual Handoff

## Purpose
This file is the continuity checkpoint for any ChatGPT Work session, coding agent, or future developer continuing the TRConcept website. Do not restart the visual direction from scratch. Inspect the live implementation and continue from the current `main` branch.


## Current engineering checkpoint — 2026-10-09
- Architecture: Admin owns TRConcept operations; no CRM synchronization or agent orchestration. See ARCHITECTURE_DECISIONS.md. No old-site migration or online payment.
- Public navigation: LEARN → BUILD → SOLVE. Approved North Star unchanged; latest mobile/terrain visual QA is still open. Owner is revising brand identity: retain existing signature/logo until supplied.
- Supabase is active, owner access confirmed. UUIDs are canonical; PER/CRS/COH/ENR/COM/REG/SUB/CNS/EML are display codes. Registration RPC commits participation/consent and email attempt atomically; duplicate registration does not resend.
- Brevo transactional transport is active. Initial SMTP-key mistake caused HTTP401; replaced API key succeeded on 9 October. Owner confirmed test acknowledgement arrived in Gmail Inbox. Reply routing has not been verified.
- Contact now saves enquiry first, then sends independent visitor acknowledgement and owner alert. Owner alert defaults to hello@trconcept.co; CONTACT_NOTIFICATION_EMAIL may override server-side. Reply-To is the validated enquirer email. No marketing subscription is created.
- lib/logged-email.ts creates QUEUED before sending Contact/permission emails and checks result updates. Queue-write failure prevents that send, preserves business record and emits an operational error. Result-update failure leaves QUEUED for review; never blindly retry an ambiguous attempt. No automatic retry worker/webhook exists. These writes are sequential, not one atomic outbox transaction.
- Required env names (no secrets): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, EMAIL_PROVIDER=brevo, BREVO_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO. CONTACT_NOTIFICATION_EMAIL optional. RESEND_API_KEY retained for manual rollback; SUPABASE_SERVICE_ROLE_KEY legacy fallback; WEBSITE_API_URL unused legacy. NEXT_PUBLIC_SITE_URL should be reviewed before domain cutover.
- Important routes/files: lib/registration.ts, lib/logged-email.ts, lib/email.ts, app/api/contact, app/api/case-study-permission; /admin/submissions and /admin/email-logs for operational review. Transitional generic follow-up fields remain, with no expansion toward a full CRM.
- Verification: typecheck/build and transport tests pass; route regression suite expanded to 30 checks. Full production owner-notification receipt and authenticated class/community operational walkthrough remain to verify. Local database tests do not certify the hosted UI.
- Exact next task: deploy this backend milestone and test a clearly marked owner-controlled Contact enquiry, inspect both email logs and confirm owner forwarding/reply. Then verify course/community registration and Admin status changes end-to-end with controlled fixtures; complete outstanding mobile visual QA. CRM follows only after these operational gates.

## People/community backend — 2026-10-05
- New owner direction: no data/account/API migration from the old site; domain switch waits until completion.
- See `docs/PEOPLE_AND_COMMUNITY_BACKEND.md` for the identity dictionary, independent state dimensions, source attribution, consent, activation steps and agent boundaries.
- Migrations 005–006 add immutable display codes alongside UUIDs, owner membership/RLS, append-only activity, consent withdrawal, reporting views and atomic community/course registration.
- Admin adds a person journey page, follow-up planning and explicit community → enrolment attribution. Payments remain manual; no Zoom or agent integration is active.
- Run `npm run test:database` and `npm run test:admin`. Local tests are not production certification; Supabase provisioning and owner login are complete; full operational/email verification remains pending.

## Supabase activation checkpoint — 2026-10-05
- New independent project created: `auxqtrwkqywpkvgqyqqt`, `trconcept-website`, Sydney, `thuongr’s team`, free plan. **Do not create another project.**
- All migrations applied, broad historical authenticated policy removed, internal definer functions moved to private schema. Hosted rollback-only registration/RLS checks passed; no participant data remains.
- Vercel production URL, publishable key and sensitive SUPABASE_SECRET_KEY configured. Owner Auth account and active OWNER membership provisioned on 2026-10-06; owner supplied a screenshot of successful /admin login. Full operational/email verification remains pending.
- Use `SUPABASE_SECRET_KEY` for the new server credential; legacy env name remains only as fallback. Never print or commit either secret.
- Dashboard authentication is needed for operations the plugin does not expose. See `docs/PEOPLE_AND_COMMUNITY_BACKEND.md` for current status and tested limits.

## Gold-wave and admin audit follow-up — 2026-10-05
- Subpage terrain no longer clips at the hero boundary. A broad animated gold illumination mask lights mesh dots and multiple ridges, with reduced-motion support.
- Homepage hero text now reads `hero_landscape` from CMS; current approved copy is the fallback. Legacy `hero` content is intentionally preserved separately. The approved tree remains fixed so traced animation stays aligned.
- `docs/ADMIN_AUDIT_2026-10-05.md` records application fixes, regression coverage and unresolved database/account requirements. Do not claim full operational certification until authenticated/database checks are completed.
- Run `npm run test:admin` for the mocked route regression suite. No online payments enabled.

## Terrain and motion update — 2026-10-05
- `5b41ce793aeec20b009363c51a6ab8705473995e`: layered dotted mesh landscape, shared footer terrain, traced root/branch illumination and artwork-based flower blooms.
- `components/TreeMotion.tsx` owns native-artwork coordinate paths. Keep the original artwork and reduced-motion fallback.
- See `docs/MOTION_AND_ADMIN_CHECKPOINT.md` for timing and the current admin implementation/limitations.

## Current checkpoint
- Homepage visual implementation: `6bd0a911f9a823d815df8ef2ea447b6c57695bc0` (2026-10-05 Brisbane).
- Production verified: https://tr-concept-website.vercel.app/
- Final production screenshots inspected at 1440, 820 and 390 CSS pixels after two implementation/deployment passes.
- See `docs/HOMEPAGE_VISUAL_QA.md` for changes, checks and remaining operational limitations.
- Homepage styling now lives in `app/home.module.css`; reusable terrain is `components/Landscape.tsx`. Do not restore the deleted historical homepage overrides.
- Historical 2026-10-05 observation: `trconcept.co` resolved to a Netlify 404. Current DNS has not been reverified; do not change domain routing as part of this work.

### Public subpage system — 2026-10-05
- See `docs/SUBPAGE_VISUAL_QA.md` for production desktop/mobile/tablet checks and scope limitations.
- Shared public layout implementation: `f92758b531cfc4e3f9e84c26655e29c65b4a2ca4`.
- All public pages now share the homepage navy / cream / gold environment, serif–sans typography, header and footer.
- `app/globals.css` owns shared tokens, chrome, subpage composition, diagrams, forms and responsive rules. Do not reintroduce homepage-only global chrome overrides.
- `components/PageHero.tsx` uses the reusable landscape; `app/home.module.css` retains only homepage composition and terrain mechanics.
- Learn is a sequential Level 1 → Level 2 pathway. Start Here uses open numbered route rows. Course and business diagrams become vertical paths on mobile.
- `app/admin/admin.css` scopes the practical light administrative work surface. Do not let public editorial rules flatten admin tables or controls.
- Business content, API handlers, Supabase/data model, email, registration and consent logic remain unchanged.

### Historical handoff baseline
- Repository: `thuongr/tr-concept-website`
- Branch: `main`
- Handoff baseline commit: `a0af604c18d73e669b03f781bc0c5057c757c76d`
- Baseline Vercel status at handoff: SUCCESS
- Deployment target: Vercel
- Continue with an iterative loop: inspect → fix → commit → deploy → inspect desktop + mobile → fix again.
- Do not stop after every small visual change to ask for approval. Work through a coherent visual pass first.

## NON-NEGOTIABLE: FRONT-END MUST BE BEAUTIFUL
The front end is not complete merely because it is functional, responsive, or technically correct.

The approved quality bar is the North Star visual direction discussed with the owner: an elegant, premium, editorial business-system landscape built around deep navy, warm luminous gold/orange, the approved growth-tree artwork, atmospheric flowing terrain/waves, strong typography, intentional whitespace, and information architecture that becomes visual.

The desired feeling is:
**Editorial clarity + system architecture + real human presence = TRConcept.**

Core visual line:
**TRConcept should look like it understands technology — not like it was generated by technology.**

The website must feel designed as ONE visual world from hero to footer, not a collection of rectangular website sections.

## Approved North Star composition
The homepage should visually approach the approved reference composition:
1. Hero: strong editorial headline + approved luminous growth tree as the central visual anchor.
2. Tree communicates the system: Business as roots/outcome; Brain, Heart, Skills and Workflow as meaningful parts of the architecture.
3. Landscape/waves should flow naturally out of the hero and continue between sections.
4. Following sections should feel embedded in the same landscape rather than separated into boxes.
5. Content should use diagrams, pathways, hierarchy, spatial composition and typography rather than card grids wherever possible.
6. Footer should dissolve naturally into the same navy world rather than appear as a separate colour block.

Do NOT recreate the reference literally. Preserve TRConcept's real architecture and content. Match its visual coherence, depth, rhythm and premium finish.

## Growth tree
Use the approved growth-tree artwork already in the repository. Do not replace it with a thin CSS/SVG line-art tree.

Desktop:
- Tree should have visual presence and scale comparable to the North Star.
- It must not look like a small isolated asset floating in empty space.
- Hero copy and tree should form one composition.

Mobile:
- Do not squeeze the desktop hero into a phone.
- Tree, headline and CTA need their own deliberate mobile composition.
- Avoid headline/tree collisions.
- Preserve enough of the tree to feel rich and luminous without creating an excessively tall dead scroll.

Desired restrained motion:
- light/energy should appear to travel from roots upward;
- subtle bloom/glow can appear in flowers/nodes;
- motion should feel organic and premium, not like an animated GIF;
- provide `prefers-reduced-motion` fallback.
Do not fake a convincing tree-growth animation with crude moving dots if it degrades the artwork.

## Waves / terrain
Previous thin, broken divider lines were rejected.

Required:
- organic layered terrain/wave forms;
- warm luminous gold/orange energy accent;
- subtle depth using multiple low-contrast navy/blue contours;
- waves should feel connected to the tree landscape;
- use them as atmospheric transitions, not decorative horizontal separators;
- they may cross/overlap section boundaries where appropriate;
- avoid identical repeated SVG dividers at every section.

The desired result is flowing landscape continuity, not a 'sợi chỉ đứt' / broken-thread appearance.

## No box/card website
This is a major owner requirement.

Avoid:
- stacked rectangular boxes from top to bottom;
- identical cards for every idea;
- borders around every content group;
- desktop two-column cards simply stacked vertically on mobile;
- large empty spacer bands containing a wave;
- section-after-section of heading + paragraph + rectangle.

Instead use:
- editorial compositions;
- asymmetric rhythm;
- connected pathways;
- floating typography;
- architecture diagrams;
- selective rules/lines;
- landscape depth;
- intentional overlaps;
- visual hierarchy and whitespace.

Cards are allowed only when the information genuinely needs a bounded container. They must not become the default layout primitive.

## Mobile is a separate composition
The owner reviews frequently on a phone. Mobile quality is therefore first-class, not cleanup after desktop.

For every major pass, inspect both desktop and mobile.

Mobile should:
- preserve the North Star visual story;
- use less copy;
- avoid giant headings that consume several screens;
- avoid repeated boxed modules;
- create varied rhythm between sections;
- maintain readable body text;
- keep CTAs obvious without making every CTA full-width;
- keep the landscape/wave system subtle and continuous.

## Typography
Use the established direction:
- sophisticated editorial display serif selectively for major statements;
- clean modern sans for body/UI/system labels;
- cream/off-white primary text on navy;
- muted blue-grey for secondary copy;
- warm orange/gold for meaningful emphasis.

Do not allow dark text intended for light backgrounds to remain on navy sections.

## Colour world
Established palette:
- Luster White: `#F4F1EC`
- Aster Flower Blue: `#9BACD8`
- Habañero: `#F98513`
- Jodhpur Tan: `#DAD1C8`
- Deep Space Royal: `#223382`
- Deadly Depths: `#111144`
- Current continuous dark landscape may use the existing deep navy implementation around `#061631`.

Avoid generic purple/cyan AI gradients, neon-tech clichés, glassmorphism everywhere, random glowing blobs, robot hands, AI brains/circuits and fake futuristic dashboards.

## Content hierarchy
Homepage should remain concise. Do not solve design problems by adding more copy.

Primary route:
SOCIAL / AI GROUP → AI COMMUNITY SESSION → experience TRConcept teaching → Level 1 → Level 2, or 1:1 consulting.

LEARN is primary.
Community is low-friction.
SOLVE / BUILD are secondary.

Level 1 and Level 2 are a progression, NOT two equivalent products to 'compare'.
- Level 1: Task → Context → Skill Set → AI Assistant.
- Level 2: Business → Brain → Heart → Skills → Agents → Workflow → Connections → Automation → AI-First Operating System.

Teaching lines:
- Teach AI how to do ONE job well.
- Practical before theoretical.
- Structure before tools.
- AI-First ≠ AI-Everything.
- Business-correct > technically impressive.
- Prefer the minimum sufficient system.

Do not invent testimonials, metrics, case studies or business claims.

## Homepage visual sequence
The page may be reordered when it improves the North Star composition. The sequence should tell a visual story, not merely preserve legacy section order.

Recommended narrative:
1. HERO — Build the system. Then let it grow.
2. APPROACH — Practical AI for real businesses / Clarity → Structure → Growth.
3. PRACTICAL PATHWAY / LEARN — foundation into system.
4. COMMUNITY — human/practical entry point.
5. SOLVE / BUILD — secondary ways TRConcept helps.
6. PROOF — only real approved evidence.
7. FOOTER — integrated into landscape.

If a different order produces a stronger coherent story while preserving business priorities, it may be used.

## Proof
Never manufacture proof to fill visual space.
If approved proof is unavailable, either use a restrained honest placeholder or reduce the section prominence. Do not let an empty proof section dominate the page.

## Footer
Footer must feel like the natural final depth of the same landscape:
- same navy family;
- subtle transition rather than a sudden purple/different-colour slab;
- legal/business details remain readable;
- no unnecessary visual box around it.

## Implementation discipline
Do not accumulate endless CSS overrides as the long-term solution. Historical homepage visual passes were removed in the October 2026 refactor. The shared subpage stylesheet retains earlier subpage styles. For future work:
1. identify active rules;
2. consolidate them;
3. remove obsolete overrides;
4. preserve responsive behaviour;
5. re-test.

Prefer maintainable components for repeated visual systems such as terrain/waves.

## Definition of done
Do not call the front end finished merely because Vercel deploys successfully.

A pass is complete only when:
- Vercel deployment is successful;
- desktop hero resembles the intended North Star composition in scale and balance;
- mobile hero is deliberately composed and collision-free;
- the growth tree has strong presence on both;
- sections no longer read as a stack of boxes/cards;
- wave/terrain transitions feel organic, luminous and continuous;
- there are no literal escaped strings such as `\\n` visible in the UI;
- text colours are correct on navy;
- footer belongs to the same visual world;
- no horizontal overflow/cropping bugs;
- CTAs remain usable;
- motion is restrained and reduced-motion-safe;
- both desktop and mobile live deployment have been visually inspected after the final deploy.

## Working instruction for ChatGPT Work
Start by reading this file and inspecting the current `main` branch and live Vercel deployment. Continue from the existing implementation; do not redesign from zero.

Operate as a long-running implementation loop:
**repo → inspect → code → commit → deploy → inspect desktop/mobile → fix → repeat**

Prioritise visual coherence and production quality over adding features. Keep the approved TRConcept business architecture and content principles intact. Do not ask the owner to approve every small adjustment; make a coherent pass, verify it, then report meaningful milestones.

### Production verification — 8 October 2026
- Architecture checkpoint `e3cd471` and Learn/email-audit checkpoint `795bd14` are committed on main. Vercel reports the latter READY in production (`dpl_4guf5K6Uaheqgk22kN7VwBk4B3aW`).
- TypeScript and production build passed after replacing a corrupt local Turbopack cache; no application fix was needed for the cache failure.
- Live desktop browser inspection confirmed the open, aligned Level 1/Level 2 layout and removal of the isolated curved progression arrow. The approved tree, terrain and public routes remain.
- Responsive QA is NOT complete for this checkpoint: local Chromium exited with SIGSEGV before rendering; fallback cloud browser exposes no viewport resize control. Do not claim 390px/820px visual verification from source inspection.
- Exact next task: finish production Learn visual QA at 390px, 820px and 1440px, fix any spacing/overflow issues, then address the email-log error handling documented in `docs/EMAIL_FLOW_AUDIT.md`. Real email delivery remains unverified; no test email was sent in this pass.


### Email transport preparation — 8 October 2026
- Owner approved moving toward Brevo email first and a minimal CRM connection later. lib/email.ts now selects server-side transport using EMAIL_PROVIDER; default remains resend until verified cutover. BREVO_API_KEY is required for brevo. No CRM integration implemented.
- Vercel metadata confirms BREVO_API_KEY is missing. Owner must enter it directly in Vercel; no secret values were read. Incoming hello@trconcept.co forwarding is owner-reported, not proof of outbound website delivery.
- Added tests/email-regressions.cjs (fake transport, no real email). Call sites record actual transport on send completion. See EMAIL_FLOW_AUDIT.md for cutover steps and remaining logging limitations.
- Exact next task: fix queued email logging and add owner notification for website enquiries, then complete Brevo controlled delivery testing once credentials are configured. Finish pending mobile visual/registration/Admin walkthrough before declaring public enrolment launch ready. CRM is not a launch blocker.


### Metallic terrain refinement — 8 October 2026
- Owner reiterated the North Star: metallic gold highlights, not an evenly cream-coloured moving mesh. Shared Landscape now uses bronze/gold/sharp highlight stops, darker/finer background particles, and a narrower light sweep on the foreground ridge only. Sweep is slower (19s); removed redundant travelling dash. Reduced-motion fallback retains static terrain.
- Applies to homepage and existing shared subpage/footer terrain; no artwork, routes or business logic changed. Typecheck/build pass. Live desktop/mobile inspection of this revision remains required; do not mark overall visual work complete.


### Brevo configuration — evening 8 October 2026
- Owner saved production BREVO_API_KEY (sensitive metadata verified; value not read). Configured EMAIL_PROVIDER=brevo and hello@trconcept.co sender/reply-to; requested production redeploy of 09a0ddf.
- Real send/receipt/reply remains unverified. Do not describe deployment success as email delivery success. Resend retained only for manual rollback.
- Next: owner-approved controlled email test to thuongrejeehan@gmail.com; examine business record/email log and confirm recipient inbox. Contact-owner notification and logging improvements, mobile QA remain open as previously recorded.


### Controlled Brevo test — 9 October 2026, 08:44 Brisbane
- Owner confirmed replacing the incorrectly supplied SMTP key with a Brevo API key. Sensitive production metadata showed the update; secret value was not read.
- Redeployment dpl_3mPaXeUntRo798zQEHqCXDspTDLM (88032b) reached READY before testing.
- With existing explicit owner approval, submitted one clearly labelled test enquiry to thuongrejeehan@gmail.com. API returned ok=true/emailSent=true; Supabase email log shows BREVO/SENT with provider message ID and no error. Previous 8 October attempt remains FAILED/HTTP401 for audit history.
- This proves contact persistence and Brevo acceptance; inbox delivery and reply routing await owner confirmation. No other recipients contacted. Test enquiry records remain marked as tests; exclude them from future business reporting.
- Next: confirm inbox/reply, then complete owner enquiry notifications and reliable queued email logs, followed by remaining registration/Admin and responsive visual checks. Do not claim complete launch readiness.


### Owner confirmation and navigation — 9 October 2026
- Owner confirmed the Brevo test reached Gmail Inbox (not Spam). Reply routing still untested.
- Canonical business navigation is LEARN → BUILD → SOLVE. Updated desktop/mobile header and footer link order; existing URLs unchanged.
- Website transactional signatures are currently literal HTML in lib/registration.ts and contact/case-study-permission API routes, not Gmail or Brevo templates. No Admin signature editor exists. Signature wording change awaits owner's desired text.
