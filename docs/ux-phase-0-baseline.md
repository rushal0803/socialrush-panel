# SocialRUSH UI/UX Phase 0 Baseline Audit

Date: 2026-09-15
Branch: `ux/phase-0-baseline`
Production branch: `main`
Scope: audit and documentation only. No production UI, checkout, auth, payment, order, SEO, database, or pricing behavior changed.

## 1. Stack baseline

- Next.js 14 App Router (`next ^14.2.33`)
- React 18.3.1
- TypeScript 5.6
- Tailwind CSS 3.4
- Supabase SSR + supabase-js
- Framer Motion 12.40 already installed
- Lucide + React Icons
- Playwright smoke tests
- Vercel deployment connected to `rushal0803/socialrush-panel`

Important: Motion is already present under the `framer-motion` package/import path. Do not change or upgrade animation dependencies during Phase 1 unless the migration is isolated and verified.

## 2. Route and shell architecture

### Global root
`app/layout.tsx` is high risk. It owns or composes:
- global CSS
- initial display currency + exchange rates
- global client providers
- Organization/WebSite structured data
- analytics
- floating WhatsApp support
- PWA client

Do not make broad visual refactors in this file.

### Public marketing shell
Homepage composition is intentionally split:
- `app/page.tsx`
- `components/marketing/HomepageContent.tsx`
- `components/marketing/PublicShell.tsx`
- `components/marketing/PremiumHomepage.tsx`
- personalization shelf
- public reviews section
- marketing header/footer

Preserve page metadata and FAQ schema in `app/page.tsx` while redesigning presentation components below it.

### Dashboard shell
`app/dashboard/layout.tsx` is high risk. It combines:
- profile/auth context
- redirect to login for unauthenticated users
- Sidebar
- Header
- Direct UPI checkout bridge
- Professional UPI checkout
- abandoned checkout recovery
- checkout funnel tracking
- mobile bottom navigation

Dashboard redesign must preserve these behaviors and preferably wrap them with presentation components rather than rewrite them together.

## 3. Order flow architecture

`app/dashboard/new-order/page.tsx` is currently ~102 KB in one client component and is the largest immediate UI refactor risk found during Phase 0.

It currently mixes:
- platform/service selection
- static/fallback service definitions
- live service facts
- quantity handling
- URL/link validation
- preferred currency
- Supabase client reads
- service health
- CRO/personalization state
- analytics tracking
- Cashfree SDK loading
- checkout/order state
- UI/progress components

Phase 1 should NOT redesign this file. Before Phase 6, split its presentation from business/checkout logic behind tested interfaces.

## 4. Service and pricing data

Primary reusable sources include:
- `lib/smm-service-catalog.ts`
- `lib/service-pricing.ts`
- `lib/order-service-experience.ts`
- `lib/order-link-validator.ts`
- `lib/service-alternatives.ts`
- `lib/use-service-health.ts`

Important rule: some catalog prices/limits are client-side fallbacks only. The code explicitly states that protected/live service facts from Supabase remain authoritative for some services. A UI redesign must never create a second pricing source.

## 5. Orders, payments and security boundaries

`app/api/orders/route.ts` is high risk and should remain untouched during visual phases. It handles authenticated order retrieval, same-origin/JSON/rate-limit checks, Supabase checkout RPCs, trusted analytics events, initial-count detection, draft cleanup and dashboard revalidation.

`middleware.ts` is also high risk. It currently handles:
- canonical host/HTTPS redirects
- legacy SEO redirects
- Supabase session refresh
- display-currency cookie initialization
- noindex/nofollow headers for private/machine routes

`next.config.mjs` owns security headers/CSP, redirects, image format/cache settings and package import optimization. Do not modify it merely for visual redesign.

## 6. Existing design system baseline

There is already a usable foundation in `app/globals.css`:
- `--sr-*` color/surface/text/border tokens
- orange/gold brand gradient
- radius/focus/shadow/content-width tokens
- `sr-page`, `sr-container`, `sr-section`, `sr-eyebrow`, `sr-surface`
- shared focus-visible treatment
- button, field, panel and dashboard input classes

`tailwind.config.ts` also has brand/rush colors and shared shadows.

Phase 1 should consolidate and expand these existing tokens instead of introducing a competing second theme.

## 7. Reuse candidates

Keep and improve rather than replace blindly:
- PublicShell
- MarketingHeader / MarketingFooter
- Header / Sidebar
- MobileBottomNav
- PlatformIcon
- IconBadge
- ServiceHealthBadge
- currency provider/hooks
- analytics event layer
- service catalog/pricing/validation modules
- existing loading/skeleton route boundaries

## 8. Refactor candidates

Highest priority refactor targets before advanced UX work:
1. `app/dashboard/new-order/page.tsx` — separate UI from checkout/business logic.
2. Large platform-specific marketing landing components — migrate repeated visual patterns into shared service-page primitives without changing SEO copy/routes.
3. Shared button/card/input styling — converge on one component/token layer instead of route-level variants.
4. Public navigation/service discovery components — reuse one filtering/search model where possible.

## 9. Production/Vercel baseline

- Vercel project: `socialrush-panel`
- Git repository: `rushal0803/socialrush-panel`
- Production deployment on `main` inspected during Phase 0: READY.
- A newer failed deployment was from a feature/PR branch, not the production target.

Pre-existing runtime risks recorded before redesign:
- repeated `/api/cron/email` Gateway Timeout errors in the last 24h
- email provider/persistence failures associated with that cron route
- one manual-UPI duplicate-UTR check Gateway Timeout

These are backend baseline issues and must not be attributed to future UI work unless their frequency changes after a release.

## 10. Visual baseline assets

The repository already contains mobile audit screenshots for important flows, including `dashboard-new-order` and `login` at 360, 390, 430 and 768 widths plus viewport captures.

Fresh automated live screenshots/Lighthouse were not generated in this audit runner because its browser environment could not resolve the public domain. Do not invent performance scores. Re-run visual/Lighthouse capture in Codex/local preview before merging Phase 1 and store the results alongside the existing audit assets.

## 11. Existing validation commands

Use the repository's own scripts before and after every UX phase:

```bash
npm run build
npm run test:smoke
npm run test:unit
npm run test:currency
npm run test:international-seo
npm run test:topical-authority
npm run test:trust
npm run test:country-service-seo
npm run test:cro
npm run test:related-services
npm run seo:check
```

Run only scripts that exist on the checked-out branch and record failures as pre-existing vs introduced.

## 12. Protected files / areas for Phase 1

Do not modify without an explicit reason and dedicated tests:
- `app/layout.tsx`
- `app/dashboard/layout.tsx` business/auth wiring
- `middleware.ts`
- `next.config.mjs`
- `app/api/**`
- `lib/supabase/**`
- order/payment/checkout RPC contracts
- `lib/service-pricing.ts`
- authoritative live service retrieval
- metadata/schema/hreflang/canonical behavior
- Supabase migrations

## 13. Phase 0 exit status

Completed:
- repository identified and mapped
- framework/dependency baseline recorded
- shared public/dashboard shells identified
- service/pricing sources identified
- auth/order/payment/security boundaries identified
- high-risk files identified
- reusable UI foundations identified
- pre-existing Vercel/runtime risks recorded
- protected working branch created
- existing mobile baseline screenshots located

Remaining verification gate before a Phase 1 merge:
- capture fresh desktop/mobile screenshots from local/preview build
- capture Lighthouse/Core Web Vitals baseline from an environment with browser/network access
- run the full applicable test/build suite on the working branch

## Phase 1 decision

Proceed with **Design System Foundation only**. Do not touch checkout/order business logic yet. Normalize the existing `--sr-*`/Tailwind foundation, build reusable UI primitives, and migrate a small low-risk surface first. Every change must be previewed, tested and committed separately.
