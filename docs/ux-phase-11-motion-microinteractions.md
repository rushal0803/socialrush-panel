# Phase 11 — Motion + Microinteraction Pass

## Goal
Standardize SocialRUSH interaction motion so buttons, interactive surfaces and fields feel deliberate and consistent while respecting users who prefer reduced motion.

## Existing foundation reused
- Framer Motion remains the animation library
- Tailwind already exposes `duration-fast`, `duration-normal` and `ease-sr-out`
- global CSS already disables CSS animation/transition duration for `prefers-reduced-motion: reduce`
- shared `Button`, `Surface` and `Field` primitives from Phase 1 remain the source of truth for reusable interactions

## Phase 11 changes
- keep the global client-provider boundary free of Framer Motion runtime; route-local motion must continue to respect reduced motion
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


## 2026-09-30 performance-safe refresh

The original Phase 11 implementation added a global `MotionConfig` wrapper. A later performance change intentionally removed that global Framer Motion runtime from `ClientProviders`. This refresh preserves that performance decision rather than restoring a site-wide animation runtime.

Current standardization:
- shared CSS motion remains the default for common buttons and surfaces
- global CTA/dashboard button transitions are restricted to transform, shadow, border, background, color and opacity
- shared hover lift is capped at `2px`, matching the Phase 11 motion principle
- press feedback is standardized to `scale(.985)` rather than stronger compression
- reduced-motion keeps transforms disabled for shared public/dashboard button primitives
- route-local Framer Motion can continue where it already provides meaningful state transitions; no new global runtime is introduced

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
