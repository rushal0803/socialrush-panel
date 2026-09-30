# Phase 12 — Mobile, accessibility, performance + experimentation

## Scope

Phase 12 is the final quality pass after Phase 11 motion and microinteractions. It protects the existing SocialRUSH flows rather than redesigning them.

### Mobile
- Smoke-test core public routes at 320, 360, 390 and 430 CSS pixels.
- Fail CI on horizontal document overflow.
- Keep shared public, dashboard and admin shells width-contained.
- Give coarse-pointer form controls and buttons a 44px minimum interactive height.
- Preserve safe-area handling already present in public and dashboard shells.

### Accessibility
- Public shell keeps its skip-to-main link.
- Dashboard keeps its skip-to-dashboard-content link.
- Admin now exposes an equivalent skip-to-admin-content link.
- Existing global focus-visible rings remain authoritative.
- Existing prefers-reduced-motion handling remains authoritative.

### Performance
- No additional animation library or runtime dependency was added.
- Existing responsive image sizes, AVIF/WebP output, immutable Next static caching and long-lived asset caching stay unchanged.
- Phase 12 changes are CSS, test and configuration-light; they should not add customer runtime work.

### Funnel measurement
The existing analytics taxonomy already covers landing/service/package/order/checkout/payment milestones and web vitals. Phase 12 does not create duplicate event names or move trusted financial outcomes to the browser.

### Experiment readiness
Three A/B-ready flags are registered:
- hero_cta_copy
- service_card_density
- checkout_copy

All are disabled. Disabled experiments always resolve to control. No experiment may be enabled until production funnel analytics are considered trustworthy and exposure tracking is reviewed.

## Release gate
Before merge:
1. npm ci
2. TypeScript
3. CRM, international SEO, payment confidence and Phase 12 unit gates
4. production build
5. Chromium smoke tests, including Phase 12 compact viewport checks

## Definition of done
- No blocker mobile overflow on the tested core public routes.
- Skip navigation exists on public, dashboard and admin shells.
- Coarse-pointer controls meet the 44px minimum-height guard on the tested login flow.
- Reduced-motion handling remains present.
- Experiment flags remain control-only by default.
- Existing build and smoke gates stay green.
