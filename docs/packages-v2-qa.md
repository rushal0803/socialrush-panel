# Packages v2 verification

Verified on 7 October 2026 against the production build, with an isolated Supabase transport and recorded public catalogue facts. No paid order was submitted.

| Width | Public | Authenticated dashboard |
| --- | --- | --- |
| 320 | Pass | Pass |
| 360 | Pass | Pass |
| 375 | Pass | Pass |
| 390 | Pass | Pass |
| 412 | Pass | Pass |
| 430 | Pass | Pass |
| 768 | Pass | Pass |
| 1024 | Pass | Pass |
| 1280 | Pass | Pass |
| 1440 | Pass | Pass |

Each width covers hero, platform buttons, service choices, cards, selected package and review area. Document and control bounds show no horizontal overflow; review remains reachable. Badge placement uses normal flow. Package CTA contrast meets 4.5:1 before and after selection. There are no browser runtime or console errors with the isolated HTTP and realtime transports. Screenshots are in `artifacts/packages-v2/{public,dashboard}-{width}-{top,review}.png`.

The live database audit found 61 active rows. All 42 coded checkout services and the supported legacy Facebook Group Members row produce package options. Eighteen remaining legacy rows have no supported checkout identity, zero rates, or duplicate campaign definitions; these are not advertised as purchasable packages. No platform, service, price or popularity claim was invented.

Focused tests cover quantity bounds/steps, unique tiers, central discount rules, wallet sufficient/insufficient/loading states, logged-out login continuation, authenticated dashboard rendering, each of the seven supported platforms, live-only YouTube Comments/Watch Hours/Facebook Group Members, server-calculated totals, ignored client amounts, rejected mismatched quantities, intent idempotency, intent-first order requests, and insufficient-wallet handoff. The order request is intercepted before any wallet debit.

All 29 focused browser tests and 25 unit/regression tests pass, including selecting every supported service at 320px. TypeScript, lint, production build and `git diff --check` pass. Lint reports existing unrelated warnings. A real production customer login and real payment fulfillment are outside the isolated test run. Existing payment integrations and wallet RPCs were not changed.

Business review: discounts are centrally set to 0%, 3%, 5% and 8%. Provider costs are absent from the customer catalogue, so minimum profit margin cannot be verified from these facts. Review those margins before releasing the draft PR; the tier percentages can be reduced in one file.
