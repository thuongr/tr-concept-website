# Homepage visual checkpoint — 5 October 2026 (Brisbane)

Production: https://tr-concept-website.vercel.app/
Implementation: `6bd0a911f9a823d815df8ef2ea447b6c57695bc0`

## What changed
- Continued from `f4572aa` and retained the approved growth-tree asset.
- Replaced the homepage's accumulated visual overrides with a scoped CSS module.
- Created a server-rendered Landscape component with layered dotted terrain, variable ridges, depth and restrained travelling light. SVG IDs are unique per instance.
- Hero balances editorial text with the tree. Tablet and mobile use separate compositions.
- Clarity / Structure / Growth uses open typography and icons; Level 1 leads into Level 2; Community remains human and practical; Solve and Build are secondary.
- Only permission-approved published testimonials render. Removed the large empty proof placeholder.
- Header and footer join the homepage navy environment through homepage-scoped selectors. Other routes retain their existing design.
- Light treatment follows the original artwork; reduced-motion users see a static composition.

## Deployment and visual checks
1. Built and deployed `48b4f7b`; inspected the live desktop page and production captures at 1440, 820 and 390 px.
2. Found clipped tree labels at intermediate width and insufficient terrain depth.
3. Corrected the tablet hero, strengthened layered terrain, varied contours, and deployed `6bd0a91`.
4. Inspected final production captures at all three widths, including mobile hero, pathway, Community and footer. No horizontal overflow; tree image loads at its original 1536px resolution.

| Production viewport | Document width | Result |
|---|---:|---|
| 1440 × 900 | 1440 | Balanced two-column hero; full system artwork; continuous footer |
| 820 × 900 | 820 | Separate tablet composition; outer labels visible |
| 390 × 900 | 390 | Copy → tree → concise content rhythm; no clipping/overflow |

## Functional verification
- `npm run check` passed (TypeScript and production build); subsequent terrain/tablet build passed.
- Mobile navigation opens, navigates to Learn and closes after route change.
- Start Here, Level 1, Level 2, Community, Solve, Build, About, Work, Privacy, Terms, Refund & Cancellation and Admin Login returned HTTP 200. No horizontal overflow on these routes at 390px.
- Both course forms retain required name/email/phone/country/state fields; optional marketing consent is unchecked.
- Invalid empty payloads to course registration, community registration and contact endpoints returned HTTP 400 before database writes.
- Reduced-motion inspection found zero running homepage CSS animations.
- No browser page errors during the route checks.
- API handlers, Supabase clients, migrations/data model, email implementation, registration forms and legal content were not modified.

## Operational limits and existing issues
- No live customer registrations, database writes or transactional emails were submitted in this visual QA pass. Successful end-to-end delivery is not claimed.
- Production Community displayed no registration form (no available published session in the rendered page). A real published session is needed for seat-reservation testing.
- Admin login page was checked; authenticated admin actions were not performed.
- The custom domain `trconcept.co` displayed a Netlify 404. Vercel production is verified at the URL above; DNS was left unchanged.
- Homepage hero remains the approved static North Star copy, as it was before this change. The existing admin hero-content editor was already disconnected from this rendering; this pass does not change that business/content behaviour.

## Maintenance
Keep future homepage rules in `app/home.module.css`. Do not append new versioned overrides to globals.css. Keep decorative motion and terrain out of business-data components. Test 390px and intermediate widths as well as desktop whenever artwork sizing changes.