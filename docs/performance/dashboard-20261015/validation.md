# Validation results

- Production build: passed, including TypeScript and Next lint. Existing warnings also appear in the baseline (unused variables, existing hook dependency warnings and a raw payment image).
- `npm run test:unit`: 225 passed.
- `npm run test:dashboard`: 32 passed, including payment confidence/manual review contracts, live service facts, currency, navigation and the two new order-history mapper tests. This overlaps the default suite; counts are not additive unique-test totals.
- Selected Chromium journeys: 22 unique cases verified. The rebuilt application passed 21 together; the final wallet case then passed after scoping its alert assertion to the main element (Next also has a route announcer with role=alert). The dialog focus restoration, Escape, Tab containment, scroll unlocking and unverified-payment warning all pass.
- Responsive audit: 10 requested widths × 36 authenticated routes = 360 successful layout checks; no detected horizontal overflow or clipped controls. This geometry sweep preceded the final focus-handler-only correction; no geometry or styles changed afterward.
- Keyboard/contrast checks include the drawer close button, route-change closing, resize recovery, search focus and cancellation, Billing details, order review labels, recovery warning and wallet transaction dialog.
- Order review checks cover wallet balances 0, 200 and 100000; no paid request is submitted. Browser-only mocked funding remains pending. Gateway classification tests preserve failed/cancelled/pending/success distinctions.
- Both benchmark runs have empty browser-error arrays. All six final repeat-click p75s are below 1.5 seconds in the documented unthrottled localhost fixture profile. No production or field-performance certification is implied.

Focused lint checks and `git diff --check` passed. No dependency, schema, webhook, payment settlement or RLS change was made. No real order, charge, refund or UTR submission was created.

## Reproduction

1. `npm run build`
2. `npm run test:unit`
3. `npm run test:dashboard`
4. Set `RESPONSIVE_AUDIT=1`, `RESPONSIVE_PAYMENT_FIXTURE=1`, `DASHBOARD_UPGRADE_AUDIT=1`, `RESPONSIVE_STAGE=dashboard-performance-20261015` and run the selected `tests/smoke/premium-responsive.spec.ts`, `cashfree-customer.spec.ts` and `cashfree-direct-status.spec.ts` cases. Use the isolated server setup in the Playwright config, never production.
5. `npm run perf:dashboard` for baseline; set `DASHBOARD_BENCH_STAGE=after` for the candidate. Build the respective revision before each run, use the same test profile, and avoid concurrent browser/build workloads.
6. `npm run perf:dashboard:report` packages only the known audit files, rejects layout failures and writes the screenshot gallery and measurements.

Raw local evidence remains under `artifacts/dashboard-navigation`, `artifacts/premium-responsive/dashboard-performance-20261015`, `artifacts/dashboard-focus-build.log`, `artifacts/dashboard-all-unit.log`, `artifacts/dashboard-regression-final.log` and `artifacts/dashboard-wallet-pass.log`. Curated measurements and screenshots are committed alongside this document; large Playwright traces remain local.

## Release readiness

Ready for draft review and safe fixture QA. Not certified for production performance targets. Review the isolated financial presentation findings in [the audit](report.md), collect authenticated production timing/field measurements, and explicitly approve release before merging or deploying. Automatic Vercel deployment is disabled for this feature branch.
