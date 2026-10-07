# SocialRUSH Packages v2

The public and dashboard pages fetch customer-safe package facts on the server and share `PremiumPackagesPageContent`. Only the public variant renders marketing navigation and the footer. The dashboard uses its native header, sidebar and bottom navigation. Package navigation stays on the current surface through selection, login and Add Funds.

## Catalogue and eligibility

`lib/package-catalog.server.ts` reads active services with `is_active=true`, `accepts_new_orders=true`, a positive rate, valid whole-number min/max and non-paused health. Identities must match a checkout-supported catalogue service by code, or an exact platform/name match for legacy rows without codes. The fallback name match enables the active Facebook Group Members row without inventing a code or altering the database.

A live audit on 7 October 2026 found 61 active rows: 42 coded services, one supported legacy Facebook Group Members row, and 18 remaining legacy rows without supported checkout identity (including zero-rate and duplicate campaign definitions). The Packages experience offers the 43 supported identities across Instagram, YouTube, Facebook, LinkedIn, X, TikTok and Telegram. Legacy `other` records cannot safely use the existing code-based checkout. They are excluded; no service or rate is fabricated. Catalogue failures show an unavailable state, never a stale price.

## Quantities and pricing

`lib/package-discounts.ts` is the single tier policy: Starter 0%, Growth 3%, Pro 5%, Scale 8%. Quantities start at the real minimum and grow geometrically up to the smaller of the maximum and 500 times the minimum, with nice-number rounding, quantity-step snapping and deduplication. Narrow ranges yield fewer tiers.

Both surfaces receive server-generated integer-paise prices. Checkout intents independently reload current catalogue facts, validate package identity, service and quantity, resolve the real service row, recheck availability/limits and apply the configured tier discount to its current selling rate. Client-supplied amounts are ignored. A changed final total stops the order request and asks the customer to refresh and review. Existing order RPCs, wallet deductions, idempotency and payment methods are retained.

Discounts are capped at 8% of the configured selling rate. The catalogue exposes no provider-cost data: these small discounts do **not** prove a minimum profit margin. Business margins must be reviewed before releasing the draft PR; percentages can be reduced centrally without UI changes.

## Experience

The four-step journey uses wrapping platform buttons, searchable service choices, compact cards and a review area. Recommendations describe a campaign-size choice, never popularity. Savings compare the discounted package with the same service/quantity at its current regular rate. Refill terms come from the live row; no delivery estimates, reviews or scarcity are invented. Extra inputs support custom comments, poll answers and endorsement skills. Browser storage preserves these inputs through sign-in and Add Funds.

Badges remain in normal flow. The package flow adds no sticky action bar; the dashboard bottom navigation retains reserved space. Explicit pale CTA backgrounds avoid legacy global CSS changing white buttons into black-on-black controls. Visible focus, pressed states, labels and link validation remain accessible. Public metadata, canonical, breadcrumb and matching visible FAQ/schema are retained, with crawlable package-service links.

## Verification

Run `node --experimental-strip-types --test tests/unit/packages-v2.test.ts tests/unit/phase33-package-psychology.test.ts`, `npx tsc --noEmit`, `npm run lint`, `npm run build` and `git diff --check`.

The Playwright setup starts the production build with `scripts/packages-test-backend.cjs`, an isolated Supabase transport backed by a recorded customer-catalogue fixture. It also isolates middleware transport. No application authorization is bypassed and paid RPCs are blocked. The fixture is test-only and is never imported by production code. A running test server can be supplied through `PLAYWRIGHT_BASE_URL`; use `http://localhost:<port>` to match Next's local API origin.

`tests/smoke/packages-v2.spec.ts` checks public and authenticated dashboard layouts at 320, 360, 375, 390, 412, 430, 768, 1024, 1280 and 1440 pixels; package selection, review reachability, overflow, CTA contrast, runtime/console errors, every platform, live-priced services, login continuity, wallet shortfalls, intent-first checkout, tampered prices/quantities and idempotency. Screenshots are written to `artifacts/packages-v2`. Authenticated tests use a local test identity, not a production customer account. Real catalogue access is separately verified with the read-only audit script. No real paid order is submitted.
