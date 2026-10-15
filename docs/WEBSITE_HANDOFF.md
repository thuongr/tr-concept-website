# TRConcept Website — Front-End Visual Handoff

## Purpose
This file is the continuity checkpoint for any ChatGPT Work session, coding agent, or future developer continuing the TRConcept website. Do not restart the visual direction from scratch. Inspect the live implementation and continue from the current `main` branch.


## Password recovery checkpoint — 2026-10-15
- Added login → `/admin/forgot-password` → Supabase Auth email → `/auth/recovery` (PKCE code exchange) → `/admin/reset-password` → sign in again.
- API routes: `/api/admin/forgot-password`, `/api/admin/reset-password`; shared form `components/AdminRecoveryForm.tsx`; canonical origin `lib/recovery.ts`. Password 12–128 characters, confirmation required. Reset requires a verified user and active `is_admin()` membership. Valid signed-in admins may also change their own password here.
- Callback rejects missing/expired/used codes, missing browser verifier and inactive Admin access. No arbitrary redirect accepted. Request responses do not reveal whether an email account exists. Supabase rate limits apply. Password update requests require the configured application origin; global sign-out revokes refresh sessions after success (already issued access tokens expire normally).
- `NEXT_PUBLIC_SITE_URL` is optional and currently absent in Vercel; fallback is `https://tr-concept-website.vercel.app`. Before domain cutover set the canonical URL, update Auth redirect allowlist and retest cookies/recovery. Start recovery and open the newest link in the same browser/device.
- Supabase Auth email is separate from website Brevo API email. Dashboard URL Configuration must allow `https://tr-concept-website.vercel.app/auth/recovery`. Auth email template must retain the provider confirmation URL. Verify Auth SMTP/sender separately; do not assume `BREVO_API_KEY` configures SMTP. Never paste credentials or reset links into chats/docs.
- Tests: TypeScript, production build, 30 existing Admin regressions and focused mocked recovery regression checks passed. No real password was changed. Dashboard config inspection currently blocked by Supabase sign-in in this browser; redirect/SMTP and owner email receipt remain unverified.
- Production: commit `4b18602` reached READY (`dpl_39dL1vfsdLNT4Y45ZLq9pqwY4K3c`). Login, forgot-password and missing-session reset pages inspected at 1440px and 390px with no document overflow. Invalid callback redirects to the visible expired/invalid-link message. These unauthenticated checks do not certify email delivery or successful password update.
- Exact next task: owner verifies Auth redirect/SMTP, requests a reset in her browser, opens email and sets her own password. Then authenticated Cohorts → Enrolments → Community → Registrations walkthrough with explicit test fixtures. Do not mark email/reset/Admin walkthrough complete until observed.
- North Star visual acceptance remains open. No CRM integration, payment, data migration or schema change in this milestone.

## Flowing-wave correction — 12 October 2026, 15:16 Brisbane
- Owner rejected the projected hills as ghost-like dark lumps. This supersedes the raised-terrain interpretation below. Reference is horizontally flowing folds beneath the original tree, with visible metallic light travelling along folds.
- Generator now creates three shallow overlapping wave sheets, fine surface points, low-contrast static ridges and travelling bronze/gold reflections with a narrow bright core and soft halo. No isolated Gaussian hills. Original hero artwork remains unchanged.
- Shared external SVG remains generated at prebuild/predev (about 525 KB raw, down from 1.79 MB). No new dependency or business/backend change.
- Typecheck/build passed. Local Home/Learn checked at 1440/820/390 without horizontal overflow. Two mobile motion frames inspected at 3s and 6.5s show reflection movement; reduced-motion produces zero animations.
- Production commit 61ff5ad reached READY (dpl_Gk7y3nHA8U3Qqnza92R5JEzYS2ah). Home/Learn production screenshots inspected at 1440/820/390; no horizontal overflow. Visual owner acceptance remains open; do not equate QA/build success with likeness approval.

## Terrain correction — 12 October 2026, afternoon
- Owner explicitly rejected the four ribbon-like waves despite earlier responsive checks. The visual authority is the raised dotted landscape in the original tree artwork, not the added foreground ribbons. Earlier statements of visual verification do not mean owner acceptance of that design.
- Replaced parallel contour/ridge SVG with a projected height field: overlapping hills, back-to-front occlusion, slope-based surface shading and fine surface points. No continuous gold outline. Sparse gold points illuminate slowly; SVG includes prefers-reduced-motion handling.
- Removed the extra hero terrain overlay so it cannot obscure the approved tree roots/artwork. Shared transitions and footer use the new surface.
- Source: scripts/generate-terrain.mjs; npm prebuild/predev generates public/terrain-surface.svg. Generated asset is ignored in Git, cached as one shared image, and carries no customer data. Landscape remains a decorative server component; dense geometry is outside the HTML/React tree. Do not run next build directly without generating the asset first; use npm run build.
- Local build and Home/Learn screenshot checks at 1440/820/390 passed with no overflow. Production visual verification follows deployment. All business content, forms, Admin, Supabase and email logic unchanged.
- Next: inspect the deployed terrain at desktop/mobile and record results, then continue the owner password recovery / authenticated Admin checks already documented.

## Frontend correction checkpoint — 2026-10-12
- Owner screenshots exposed a separate `/learn` issue: prior fixes covered homepage only. Removed the subpage curved arrow, 100px desktop offset and mobile indentation; stage actions align with flex layout. Hero headings balance lines, Learn/Build use intentional desktop phrase breaks.
- About hero now links to its own approach section; business pillars read Learn → Build → Solve.
- Build explicitly offers website design/development, with a private management area, forms, registrations and selected integrations scoped per business. Updated metadata, homepage teaser and Start Here wording. No backend feature or CRM is implied to be standard in every project.
- Shared Landscape rebuilt as four overlapping dotted dune surfaces with bronze/gold specular ridges and restrained moving illumination. Existing tree artwork/motion preserved. Fixed Build terrain horizontal overflow found during visual QA. No section clipping added.
- Relevant files: components/PageHero.tsx, components/Landscape.tsx, app/globals.css, app/home.module.css, app/about/page.tsx, app/learn/page.tsx, app/build/page.tsx.
- Typecheck/build pass. Actual local browser screenshots at 1440/820/390 cover Home, About, Learn, Build, Level 1, Level 2, Solve, Community and Start Here; no horizontal overflow after fix. React review: no new client state, dependencies or data fetching; SVG decorative/aria-hidden, motion respects reduced-motion.
- Production verification pending this commit. Exact next task: verify deployed routes at all three widths, links, reduced motion and visible terrain continuity; record results. Then resolve owner password recovery and complete the authenticated operational walkthrough. CRM and online payments remain out of scope.
- Customer/owner operational flows and manual steps: docs/CUSTOMER_ADMIN_JOURNEYS.md. Existing backend/email checkpoint below still applies.

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

### Production follow-up — 12 October 2026
- Frontend commit `9eefbe2` reached READY (`dpl_Dmo1ACknMf976M7CBU2AsozKVWW5`). Live desktop inspection confirms new Build service content and aligned Learn stages with no curved arrow.
- A second pass found the shared footer still clipped its terrain vertically and drew an unrelated horizontal border. Removed both; terrain width is constrained without clipping its upper edge. Homepage secondary services now follow Build → Solve as well.
- Local 1440/820/390 checks cover these refinements; final production verification follows this commit. Operational limits in CUSTOMER_ADMIN_JOURNEYS.md remain unchanged.

### Final production visual verification — 12 October 2026
- `26ca056` is READY in production (`dpl_EmUxoPbzi97WpuJMMDjj33f3vJVD`). After the footer correction, Home, About, Learn and Build were rendered and screenshots inspected at 1440, 820 and 390 CSS pixels on the production alias.
- No horizontal overflow; Learn stages align on desktop/tablet and use equal mobile indentation; curved arrow absent. About CTA targets #approach and Build CTA preserves /contact?type=build. Footer overflow is visible and its obsolete border is removed.
- Mobile menu opened successfully and lists Learn → Build → Solve → Community → Work → About. Reduced-motion emulation showed no running animations. Nine public routes were also captured at all three sizes in the preceding production pass.
- This verifies this frontend correction milestone, not every backend operation or inbox delivery. Follow CUSTOMER_ADMIN_JOURNEYS.md for remaining manual operations and limits. Next task: implement and verify owner password recovery, then authenticated Admin class/community walkthrough; preserve brand assets until the owner supplies replacements.

### Raised-terrain deployment verification — 12 October 2026
- Commit 3018b8c reached READY: dpl_E1Qfos4ZZsCb3LgVYZdSZHD8TTqW. Production Home and Learn screenshots inspected at 1440/820/390; no horizontal overflow. Original tree roots are unobscured; shared terrain uses shaded overlapping hill surfaces, without continuous gold outlines.
- Production generated SVG loads correctly. Its 90 row-light animations are present; reduced-motion media switches all to animation-name:none (zero remaining animations). Gold accents are sparse surface glints, not full-width travelling strokes.
- The shared SVG is about 456 KB gzip / 1.79 MB raw and reused across transitions; a later performance pass may simplify surface geometry if needed. No client rendering dependency was added.
- Owner acceptance of visual likeness remains separate from responsive/technical verification. Preserve the explicit reference distinction: raised terrain above, rejected ribbon waves below.
