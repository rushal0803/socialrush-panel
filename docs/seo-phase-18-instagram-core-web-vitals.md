# Phase 18 — Instagram Core Web Vitals

## Scope

Phase 18 audits the canonical Instagram commercial templates for LCP, CLS, INP, image weight, unnecessary JavaScript, third-party work, font loading, render blocking, and avoidable client-side rendering.

The goal is to improve the critical rendering path without changing checkout, pricing authority, order validation, SEO canonicals, or visible service functionality.

## Findings

### LCP
- The primary Instagram money-page heroes are text/CSS driven rather than dependent on large raster hero images.
- The followers phone illustration is decorative UI built in HTML/CSS and is hidden on narrow screens by the existing mobile CRO rules.
- No remote Google/local font loader is used by the inspected primary Instagram money pages. The global typography stack falls back to system fonts.
- Deep content already uses `content-visibility: auto` through `.instagram-cwv-page`, keeping hero and order-critical content eager.

### CLS
- Interactive previews use fixed aspect ratios or explicit layout containers.
- Deep sections retain `contain-intrinsic-size` so skipped content has a layout placeholder before it is painted.
- Phase 18 does not introduce asynchronously sized hero media.

### INP / main-thread work
- The Instagram Views interactive preview previously updated React state every 90ms while playing.
- The continuous progress/bar movement now runs with CSS keyframes. React only updates the play/pause state when the user interacts.
- Service-worker registration is deferred to `requestIdleCallback` with a short timeout fallback so PWA setup no longer competes with early rendering.

### Client boundaries
- Followers, Likes, and Views canonical page shells remain React Server Components.
- Their actual order builders remain client components because quantity, URL validation, currency display, and handoff are interactive.
- Comments, Saves, and Shares still use integrated client workspaces because their order controls and previews are tightly coupled. Phase 18 deliberately does not split those large components without a separate interaction regression pass.

### Images
- No above-the-fold `<img>` element is used by the three primary Instagram money-page shells.
- Existing Open Graph images are metadata assets and do not participate in page LCP.
- No new image dependency was added.

### Third-party / render blocking
- No new third-party script was added to the Instagram templates.
- Payment SDK behavior and checkout loading were not changed.
- PWA registration is now idle work rather than critical-path work.

## Guardrails added

`tests/unit/phase18-instagram-cwv.test.ts` protects:
- Instagram CWV containment classes.
- Server rendering for the primary Followers/Likes/Views shells.
- Timer-free Instagram Views preview animation.
- Idle service-worker registration.
- No accidental raster hero image or remote font-loader regression on the primary money pages.

The pre-merge workflow runs this Phase 18 regression test before the production build and browser smoke suite.

## Intentionally unchanged

- Service prices and catalogue authority.
- Supabase data.
- Checkout and payment processing.
- Order validation.
- Canonicals, metadata intent ownership, sitemap ownership, and structured-data claims.
- Existing interactive order-builder functionality.
