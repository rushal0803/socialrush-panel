# Phase 19 — Instagram Mobile-First UX

## Scope

Phase 19 follows the Phase 18 Core Web Vitals pass and focuses on the mobile usability of the six canonical Instagram commercial journeys:

- Instagram Followers
- Instagram Likes
- Instagram Views
- Instagram Comments
- Instagram Saves
- Instagram Shares

This phase does not change service pricing, availability, checkout calculations, order validation, Supabase data, sitemap ownership, canonical URLs, or structured-data claims.

## Audit findings

The site already had strong shared mobile foundations: the responsive public header and menu, Phase 12 overflow/tap-target smoke coverage, a global WhatsApp support control, mobile dashboard navigation, mobile payment flows, and an existing reusable mobile service-order dock.

The remaining Instagram-specific gaps were:

1. Follower-only mobile CSS was scoped to the generic `.service-money-page` class. That allowed follower-specific rules such as hiding the second section to affect unrelated money-page templates.
2. Some Instagram order inputs use Tailwind text sizes below 16px. On iOS Safari, focusing those controls can trigger viewport zoom and interrupt the order flow.
3. The six canonical Instagram templates did not share a single mobile-UX marker, making route-specific regression protection inconsistent.
4. The existing mobile service-order dock was not wired into these six pages even though it already reserves space for the global WhatsApp control.
5. A fixed order dock should not cover the order builder once the user has reached it.

## Changes

- Added a shared `.instagram-mobile-ux` layer for the six canonical Instagram money templates.
- Added an `.instagram-followers-mobile` scope so follower-only hero rules no longer leak to other service pages.
- Normalized mobile order form controls to a 16px minimum font size to prevent Safari focus zoom.
- Standardized mobile in-page scroll offsets for `#order`, `#packages`, and `#pricing`.
- Reused `ServiceOrderStickyCta` across all six Instagram pages rather than creating a duplicate CTA system.
- Enhanced the shared mobile order dock so it hides while its target order builder is visible.
- Preserved the dock's existing right-side clearance for the global WhatsApp button.
- Added unit regression coverage and Playwright mobile smoke coverage at 320, 360, 390, and 430px widths.

## Business / SEO / CRO target

Phase 19 targets fewer mobile usability failures before checkout: no route-level horizontal overflow, no accidental follower-style section hiding on other Instagram services, no iOS input zoom, clearer access to the order builder, and fewer sticky-control conflicts.

The expected business effect is a cleaner path from mobile landing-page visit to order configuration. The SEO benefit is indirect: stronger mobile usability and stable page behavior support engagement and reduce UX regressions without changing the Phase 16–18 SEO/CWV architecture.

## Intentionally unchanged

- Current catalog pricing and currency authority
- Discounts and package economics
- Service availability
- Supabase schema, migrations, RLS, and RPCs
- Checkout/payment calculations
- Dashboard/reseller/agency logic
- Canonicals, metadata, sitemap ownership, and schema claims
- Existing Phase 18 CWV containment and performance work
