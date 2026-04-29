# DreamCatcher.AI UX/UI Audit Baseline

Date: 2026-04-28
Base branch: `dev`
Audit branch: `ux/audit-baseline`

## Goal

Move DreamCatcher.AI from a functional project into a polished product experience:

- Clear primary flow: write a dream, receive an interpretation, save/share it.
- Calm, premium visual system that supports the dream/AI theme without visual overload.
- Human error states that never expose provider names, raw API details, or technical URLs.
- Fast mobile-first experience with stable RTL behavior.
- Profile, auth, dream interpretation, and browsing flows that feel non-technical.

## Current Baseline

Build command:

```bash
cd client
npm run build
```

Build result:

- Main JS: `index-C36D1xtX.js` - 435.33 KB, gzip 143.38 KB.
- Heavy deferred chunk: `PopularDreams-D5Drz5sr.js` - 347.18 KB, gzip 104.35 KB.
- CSS: `index-DLXWwJza.css` - 122.90 KB, gzip 18.83 KB.
- Modules transformed: 3788.

Codebase signals:

- `framer-motion` is still imported by dream-related components:
  - `PopularDreams`
  - `FlipDreamCard`
  - `DreamFlipCardMini`
  - `CategoryPills`
  - `RecentDreams`
  - `NotFoundPage`
- `recharts` is used inside `FlipDreamCard`, which contributes to the large `PopularDreams` chunk.
- There are about 250 uses of visual-heavy classes or patterns such as gradients, shadows, blur, and large rounded corners.
- There are about 104 accessibility-related markers found (`aria-*`, `focus-visible`, `sr-only`, `role`, `alt`), so accessibility exists but needs a full pass.

## High-Priority Findings

### 1. Profile UX Still Exposes Technical Concepts

Current issue:

- The profile form has a visible image URL field.
- Users can see internal asset paths such as `/avatars/avatar-1.webp`.
- Upload and avatar selection are not separated into simple user-facing actions.

Impact:

- This makes the product feel technical and unfinished.
- It creates avoidable validation confusion.

Target:

- Profile image should be changed through visual avatar selection, file upload, and optionally an advanced URL field.
- The default path should never be the main user-facing affordance.

Next PR:

- `feature/profile-ux-polish`

### 2. Error UX Is Inconsistent

Current issue:

- Some components still show raw `error.message`.
- Some server routes can still return raw internal messages.
- The client error boundary displays `error.message` directly.
- Popular dreams and profile upload can expose technical errors.

Impact:

- Users can see `Network Error`, provider errors, status codes, or internal strings.
- Trust drops quickly when the product uses technical wording.

Target:

- Add a shared client-side error message mapper.
- Keep detailed errors in logs only.
- UI should show short, Hebrew-first, action-oriented messages.

Next PR:

- `feature/human-error-states`

### 3. Visual System Is Overloaded

Current issue:

- Many components combine gradients, shadows, blur, glass effects, bright accent colors, and rounded large cards.
- The visual language is inconsistent between homepage, cards, profile, auth, and legal pages.
- Purple/amber gradients dominate too many elements.

Impact:

- The app feels visually heavy even when network performance is acceptable.
- Primary actions compete with decorative styling.

Target:

- Reduce decorative gradients to brand moments and primary CTAs.
- Use flatter surfaces, fewer nested cards, quieter shadows, and tighter spacing.
- Establish reusable visual tokens for buttons, panels, inputs, and empty states.

Next PR:

- `design/visual-system-polish`

### 4. Homepage Primary Flow Is Not Sharp Enough

Current issue:

- The homepage contains a strong interpretation form, but sections below it compete for attention.
- Stats load immediately.
- Popular dreams is deferred, but it remains a very large chunk.
- The section fallback is visually empty, so loading can feel like blank space.

Impact:

- The first user decision is not focused enough.
- The product feels heavier than needed on mobile.

Target:

- Make "write a dream and interpret it" the unmistakable first action.
- Defer non-essential stats.
- Improve skeleton states.
- Simplify popular dreams cards.

Next PR:

- `feature/homepage-polish`

### 5. Popular Dreams Is The Largest Product Chunk

Current issue:

- `PopularDreams` chunk is 347.18 KB.
- It imports `FlipDreamCard`, `framer-motion`, and `recharts`.
- This work is deferred, but still expensive when the section enters the viewport.

Impact:

- Scrolling into popular dreams can feel heavy.
- The chunk is too large for a secondary homepage section.

Target:

- Replace chart-heavy cards with lighter trend indicators for the first pass.
- Lazy-load charts only after interaction, or remove charts from cards.
- Remove `framer-motion` from simple list reveals.

Next PR:

- `perf/popular-dreams-weight`

### 6. Mobile And RTL Need A Dedicated Pass

Current issue:

- Layout mostly supports RTL, but some icon spacing and button content use mixed `ml`/`mr`.
- Several controls are visually dense and may wrap awkwardly on small widths.
- The header and account form need mobile review after profile changes.

Impact:

- Hebrew mobile users may see spacing and alignment inconsistencies.

Target:

- Audit 360px, 390px, 430px, tablet, and desktop widths.
- Prefer logical spacing classes (`ms`, `me`) where possible.
- Ensure no horizontal overflow.

Next PR:

- `fix/mobile-rtl-polish`

## Proposed PR Sequence

1. `ux/audit-baseline`
   - This document and current measured baseline.

2. `feature/profile-ux-polish`
   - Hide technical URL field behind advanced options.
   - Add visual built-in avatar picker.
   - Keep upload as the primary action.
   - Improve preview, save, reset, and error states.

3. `feature/human-error-states`
   - Shared error mapper.
   - Friendly messages for API, upload, image proxy, popular dreams, and interpretation failures.
   - Sanitized error boundary.

4. `design/visual-system-polish`
   - Reduce gradients, shadows, blur, and oversized rounding.
   - Create reusable UI surface patterns.
   - Make visual hierarchy quieter and more premium.

5. `feature/homepage-polish`
   - Sharpen hero and interpretation flow.
   - Improve loading/empty states.
   - Defer stats or make them less prominent.

6. `feature/interpretation-flow-polish`
   - Better AI loading state.
   - Preserve dream text on failure.
   - Better result layout and next actions.

7. `perf/popular-dreams-weight`
   - Reduce `PopularDreams` chunk size.
   - Remove unnecessary `framer-motion`.
   - Lazy-load or simplify charts.

8. `fix/mobile-rtl-polish`
   - Full responsive RTL pass.
   - Fix icon spacing, wrapping, overflow, and mobile nav polish.

9. `feature/accessibility-trust-polish`
   - Keyboard pass.
   - Focus states.
   - Labels and ARIA review.
   - Contrast review.

10. `qa/release-hardening`
    - End-to-end manual smoke checklist.
    - Render/Netlify deploy verification.
    - Console/network cleanup.

## Definition Of 10/10 For This Product

- A first-time Hebrew user understands the product within 5 seconds.
- The first screen makes dream interpretation the obvious action.
- No user-facing raw technical errors.
- Profile image change works without exposing internal paths.
- Mobile experience has no overflow and no awkward wrapping.
- Homepage initial load is light enough to feel instant on mobile.
- Visual styling feels intentional, calm, and consistent rather than decorative everywhere.
- AI failure states preserve user input and offer a clear retry path.
- Auth and account flows feel trustworthy.
- Console is clean in normal user flows.

