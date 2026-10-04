# Service experience audit and implementation

## Inventory and source of truth

Run `node scripts/service-page-inventory.cjs` for the current configured path list and platform/service inventory. The complete inventory contains 110 configured service paths (including aliases and catalog-only paths), 43 service codes, seven platforms, and 22 country pages. These figures describe repository configuration, not verified production availability or indexed URLs. This includes static keyword aliases declared in the India route group. Live-only services require their existing active Supabase row; no new service is created by this work.

## Architecture and ordering

The application uses the root SEO catch-all, India routes, `/services/[slug]`, explicit catalog routes, and six country catch-alls. Shared components include PublicShell, platform icons, currency display, order builders, sticky actions, SEO intent sections, authority links and related-service recommendations. Dedicated workspaces collect custom comments, skill names and poll answers; those inputs must remain intact.

Public visitors can configure quantity and destination. The existing dashboard URL carries platform, canonical service code, quantity, link and resume state. Middleware returns unauthenticated visitors to login with the complete safe destination. The dashboard rechecks active service facts and quantities, then uses the existing wallet/payment/order APIs. Payment completion events remain server-controlled. No financial transaction is submitted by the landing page.

## Audit findings

- Decorative previews occupy valuable hero space ahead of the form.
- Several independent order implementations and strong gradients produce inconsistent hierarchy.
- Rates per 1,000 units can be mistaken for the selected order total.
- The generic landing builder used a static lookup despite receiving a supplied rate.
- Some comparisons and speed badges are not supported by independently verified evidence. Existing SEO content stays locked; no new claims of this kind are added.
- Long mobile heroes and dense comparison rows require wrapping and spacing review.
- Sticky actions need dismissal, safe-area spacing and space for support widgets.
- First-party consent-aware analytics already exists; reuse package_viewed, package_selected and new_order_clicked rather than creating a second system. Do not include destination URLs in analytics properties.
- Public reviews already come from the moderated completed-order review pipeline. Do not invent reviews or duplicate unfiltered reviews on individual services.

## Reference and reusable system

Instagram Followers India is the reference implementation because it has a dedicated established commercial route and a straightforward public-profile order. No traffic ranking is claimed. ServiceOrderCard adapts to supplied platform, service, quantity limits, step, rate, delivery and refill facts. Price estimates use the same paise rounding as the dashboard and explicitly identify INR checkout when displaying another currency. Service-specific URL rules remain authoritative. Existing specialized forms retain their extra inputs.

## SEO lock

Preserve route paths, aliases and redirects, slugs, metadata, canonicals, robots, sitemap, hreflang, indexability, H1 text, existing SEO headings and copy, JSON-LD, FAQ questions/answers, authority links and related internal links. Do not convert server components into client-only page content. The source guard compares changed templates against HEAD and forbids modifications to protected configuration, SEO, API, pricing and authentication files. Browser tests additionally verify the reference canonical, H1 and FAQ/schema content.

## Verification commands

```text
node --experimental-strip-types --test tests/unit/service-order-preview.test.ts
node scripts/service-seo-lock-check.cjs
npm run build
npx tsc --noEmit
npm run lint
git diff --check
npx playwright test tests/smoke/service-experience.spec.ts
```

Run TypeScript after the build finishes, since Next regenerates `.next/types` during builds. Browser checks cover the requested 320/375/390/430px widths, tablet, laptop, desktop and large desktop, validation and login query preservation. Live payment, signed-in wallet balance and provider delivery must be verified in an authorized test account before production promotion; local tests must not place paid orders.

## Final SEO lock confirmation

- URLs, slugs, aliases and redirects: unchanged.
- Metadata, canonicals, robots, sitemap behavior and hreflang: unchanged.
- Existing H1, SEO headings, body copy and internal SEO links: retained.
- JSON-LD and FAQ schema/questions/answers: retained.
- SEO content remains server rendered; indexability configuration is unchanged.

The source guard passes. The rendered comparison passes for 94 compiled service paths. The inventory's other configured paths include redirect aliases and runtime/catalog-dependent pages; this is not a claim that 110 unique pages were rendered locally.

## Validation limits and known baseline issues

Production build, TypeScript, lint and whitespace checks pass; lint reports existing warnings. Pricing-preview tests and currency, related-service, payment-confidence and trust tests pass. Existing `test:cro` fails on a Node path-alias resolution error in saved-monthly-plan; the existing country SEO test has one description-length failure in unchanged, locked metadata. Neither is concealed by editing SEO or unrelated code.

Browser checks cover public input validation, quantity/link preservation through login, mobile action dismissal and support-widget clearance, reference FAQ/canonical/H1, existing public navigation/authentication/payment safety and compiled-page horizontal overflow across eight widths. A transient public-page hydration error occurred in an earlier run and did not reproduce in two subsequent runs. These checks do not establish paid checkout, signed-in wallet correctness, provider delivery, real conversion uplift, or Core Web Vitals. No paid order was placed and no deployment was made.

## Completed browser results

All 752 compiled-page viewport checks passed: 94 service paths at 320, 375, 390, 430, 768, 1024, 1440 and 1920px. The combined run passed 87 of 88 tests; its only failure was an encoding-corrupted rupee symbol in a test expectation, corrected to a Unicode escape and rerun separately. No application change was needed for that failure. The public safety suite and three existing Instagram CRO tests passed. Mobile and desktop reference screenshots were visually reviewed.
The corrected reference order-validation/login-handoff test passed separately (1/1). Together with the combined run, all 88 browser test scenarios passed after correcting that assertion.

## Superseding final verification

The subsequent [blocker-resolution merge gate](service-page-merge-gate.md) records the latest technical repairs and commit state.

The results above describe earlier implementation runs. Use [the final verification report](service-page-final-verification.md) for the current readiness decision. The latest broad run passed 87/88 scenarios and reproduced homepage React hydration error #418. Real authenticated ordering remains unverified without a safe test session. These are unresolved readiness blockers; earlier passing retries do not resolve them. No merge or deployment is approved by this report.
