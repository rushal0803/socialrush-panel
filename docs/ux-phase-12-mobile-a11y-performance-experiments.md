# Phase 12 — Mobile, Accessibility, Performance + Experimentation

## Goal

Close the redesign program with low-risk safeguards that improve keyboard access, compact-screen resilience, runtime performance measurement and future experiment readiness without changing SocialRUSH business logic.

## Existing strengths confirmed

- public marketing shell already exposes a `Skip to main content` link and `main` landmark
- global CSS already respects `prefers-reduced-motion`
- Phase 11 adds Framer Motion `reducedMotion="user"`
- shared controls already use visible focus states and generally meet 44px touch-target sizing
- Next.js image optimization uses AVIF/WebP with a long cache TTL
- package imports for `lucide-react`, `framer-motion` and `react-icons` are optimized
- first-party analytics is consent-aware, respects Do Not Track and never blocks customer actions

## Changes in this phase

### Dashboard keyboard access

- add a keyboard-visible `Skip to dashboard content` link
- add a focusable dashboard content target without introducing a nested `main` landmark

### Public rendering performance

- use the existing `content-auto` utility around the below-the-fold marketing footer so browsers can defer off-screen rendering work

### Core Web Vitals

- add a client `WebVitalsReporter` using Next.js `useReportWebVitals`
- record the metric name and normalized value through the existing first-party analytics pipeline
- do not send URLs, search terms, user content or financial data

### Experiment readiness

- add a dormant deterministic 50/50 assignment utility
- assignments use a random local-only seed stored in localStorage
- add an `experiment_exposure` analytics event that can use the API's already-allowed `surface` and `step` metadata keys
- no live A/B experiment is activated by this phase

### Regression coverage

- verify the public skip link is keyboard reachable
- verify compact 390px public routes do not create horizontal document overflow

## Protected scope

Phase 12 does **not** change:

- service pricing or availability
- order placement or refill logic
- wallet, Cashfree or manual UPI behavior
- checkout/payment APIs
- support/ticket APIs
- Supabase schemas, queries or RPC contracts
- authentication or middleware
- SEO metadata, schema, canonicals or hreflang
- route structure
- dependencies

## Validation before merge

- `npm ci`
- `npx tsc --noEmit`
- `npm run build`
- Chromium install
- `npm run test:smoke`
- changed-file scope review
- exact runtime-head Vercel preview when deployment capacity is available
