# Phase 11 — Motion + Microinteraction Pass

## Goal
Standardize SocialRUSH interaction motion so buttons, interactive surfaces and fields feel deliberate and consistent while respecting users who prefer reduced motion.

## Existing foundation reused
- Framer Motion remains the animation library
- Tailwind already exposes `duration-fast`, `duration-normal` and `ease-sr-out`
- global CSS already disables CSS animation/transition duration for `prefers-reduced-motion: reduce`
- shared `Button`, `Surface` and `Field` primitives from Phase 1 remain the source of truth for reusable interactions

## Phase 11 changes
- add `MotionConfig reducedMotion="user"` inside the existing client-provider boundary so Framer Motion animations follow the operating-system reduced-motion preference
- standardize shared button transitions to transform, shadow, border, background, color and opacity only
- add restrained press feedback to shared buttons
- give secondary and danger buttons the same subtle lift language as primary actions
- refine interactive Surface hover elevation, border response and focus-within feedback
- refine Field focus feedback and leading/trailing icon state transitions
- retain explicit `motion-reduce` fallbacks on shared primitives

## Motion principles
- motion communicates state and hierarchy; it is not decorative noise
- hover lift stays subtle (`0.125rem` or less)
- press feedback is fast and restrained
- no autoplay loops or large parallax effects are introduced
- no new animation dependency is added
- reduced-motion preference takes priority over decorative movement

## Protected scope
- no pricing or service availability changes
- no checkout/payment/wallet changes
- no support/order API changes
- no Supabase query/schema/RPC changes
- no auth/middleware changes
- no SEO/schema/metadata changes
- no route structure changes
- no dependency upgrades

## Validation before merge
- `npx tsc --noEmit`
- `npm run build`
- Playwright smoke tests
- exact runtime-head Vercel preview reaches READY
- compare branch with `main` and confirm no unrelated files changed
