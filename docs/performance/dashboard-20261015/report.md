# Customer dashboard performance audit

Baseline: `4e879ddffde6bd026b0c53e09b0278517cb4bd89` (latest main at the start of this audit). Next 15.5.26, React 19.2.8. One feature branch; no schema migration, settlement change, dependency installation or production deployment.

The feature branch explicitly disables automatic deployments using Vercel's [branch deployment configuration](https://vercel.com/docs/project-configuration/git-configuration#gitdeploymentenabled). Production deployment behavior is unchanged.

## Findings and changes

| Area | Evidence | Change |
| --- | --- | --- |
| Overview | 21 database queries in one awaited group, including three count-only queries with identical predicates to row queries | Exact counts now accompany recent, active and completed rows: 18 queries, with the same filters and failure mapping. This is a source-verified reduction, not measured production request savings. |
| Orders / Order History | Entire client page; effect awaited remote auth and then an unbounded order query after hydration | First 50 orders now arrive in the authenticated server render. Stable ordering, exact total and explicit batches of 50 for older records. Filters/status counts clearly describe loaded records. Refill, tracking, specialty repeat links and analytics retained. |
| Wallet | CSS hid an entire mounted Add Funds form; baseline browser counted 169 descendants inside that hidden section | Removed the unused form and its funding-only state/handlers. Existing Add Funds route and gateway-return verification retained. Add Funds links use client navigation directly. |
| Wallet motion | Opacity reveals, hover transforms, bar-height animations and intersection observers on financial cards | Cards and charts render immediately. Chart heights are static. Root application still uses Framer Motion, so this does not remove that shared dependency. |
| Wallet details | Inline, eagerly bundled transaction overlay lacked the shared focus/keyboard behavior | Details module loads on demand and uses DashboardDialog: focus capture/return, Tab containment, Escape, scroll lock and accessible labeling. Pending transactions explicitly have no completed wallet impact. |
| Shared search | Dialog implementation and search results logic imported by every header | Lightweight trigger and keyboard shortcut remain in shell. Dialog/results module only mounts on open; requests abort on dismissal. |
| Shared balances | Sidebar-owned profile subscription had no server-side customer filter; header showed only initial balance | One provider uses a customer-filtered subscription, validates finite updates and supplies both displays. Cleanup remains explicit. No extra polling or subscriptions. |
| Billing | All invoices serialized and hydrated at once | Exact-count pages of 24 with stable ordering, explicit customer predicates and previous/next links. Existing payment filters, details, proof links and exports retained. |
| Packages | Next 15 searchParams accessed synchronously | Await parameters alongside the live catalog, preserving deep links and current availability checks. |
| Saved order draft | Draft-loading effect reran whenever the live-services array changed | Resolve draft identity against definitions, then let existing live-facts refresh update the chosen service. Draft request no longer depends on catalog refreshes. |
| Recovery | Parsed unrelated session storage and could skip expired keys while removing them | Snapshot matching keys first; tolerate disabled storage; preserve recovery links, expiry, analytics and already-paid warning. |
| Navigation | Existing grouped drawer already provided all 22 destinations and focus management | Full prefetch after hover/focus, pending-link feedback, compact Account/Help layout, Wallet/Orders quick actions, stable close callback and reduced-motion loading fallback. |
| Errors | No customer route error boundary | Recoverable error UI with retry, Wallet and Support actions; warns customers to check payment state before retrying payment. |

The shared Direct UPI bridge is a small effect with no visual checkout interface. It remains eager to avoid changing gateway initialization order. The larger ProfessionalUpiCheckout was already scoped to order-summary in main; this audit does not take credit for that earlier improvement. Auth context already uses React.cache (request-local), and most server queries already run concurrently. No cross-customer or shared cache was introduced.

## Route coverage

All customer routes inherit the refined persistent shell, search boundary, balance synchronization, navigation and error recovery. Page-specific changes are concentrated on Overview, New Order, Orders, Order History, Wallet, Billing and Packages.

Existing premium page components remain in place for Add Funds, order details, transaction details, order-summary, direct UPI, Campaign Stacks, Recurring Revenue/retainers, Reseller Hub and its portfolio/monthly plans/monthly planner/bulk planner, campaigns and campaign details, clients and client details, Referral Center, Saved Profiles, Favourite Services, Notifications, Account, Settings, Support, Repeat Campaigns, Rewards, Reviews/review submission, API docs and service/new-campaign redirects. Preserving an existing design is not a claim that each page was rebuilt.

The responsive audit exercises these destinations and populated nested-route fixtures. It also checks order review and wallet contribution, Add Funds and payment instructions, menu focus/close/resize behavior, pending funding, search retry/cancellation, overflow and selected screenshots.

## Measurement method

Run `node scripts/dashboard-navigation-benchmark.cjs` against a completed local production build. Set `DASHBOARD_BENCH_STAGE=after` for the second capture. The runner owns a loopback Next process using the existing test-only Supabase transport. Browser Supabase requests are mocked, writes rejected and realtime messages simulated. No fixture token is accepted by production application code.

Profile: Chromium, 1440×900, reduced motion, no CPU/network throttling, same-machine local production server. Six fresh document navigations followed by five cycles of actual sidebar clicks. Transition ends after the destination heading is visible and two animation frames; it is not a measurement of every asynchronous secondary widget. Every sample must keep the same document and reach the authenticated route. The raw report retains browser request timing/transfer entries, DOM counts, single-navigation LCP/CLS observations and errors; Playwright traces capture the journey.

Baseline repeat transition p75 (five observations per route): Overview 999 ms; New Order 334 ms; Orders 217 ms; Wallet 997 ms; Billing 289 ms; Packages 1,015 ms. These already satisfy the 1.5 s target in this unthrottled synthetic profile and do not reproduce the reported production latency.

Before/after results, production-build bundle sizes and validation outcomes are recorded in the adjacent evidence files after verification. Never substitute these localhost samples for field p75, production database timings or INP. A single LCP observation is not a percentile, and no INP claim is made.

## Remaining constraints and isolated financial findings

- Production navigation latency has not been reproduced with a real customer's session. Database execution plans, region placement, real network RTT, cold starts and field CWV need read-only production observability before release targets can be certified.
- Read-only Supabase project metadata identifies the locally configured database in `ap-southeast-2`; `vercel.json` pins functions to `syd1`. Those locations are aligned in Sydney. Do not claim a database/function region mismatch or move functions to India without measuring actual traffic and confirming deployed configuration.
- getDashboardContext remains request-local and still validates claims and loads the owned profile. For symmetric JWTs, the installed Supabase getClaims implementation may require remote verification; middleware and server rendering can each validate. Do not replace this with an unverified session or client-supplied identity header.
- Overview still has 18 independent reads and waits for its slowest result. Further consolidation should use measured query plans and an explicitly reviewed data/API change, not an inaccurate summary of a truncated row sample.
- Some secondary server pages still call getUser themselves, and some secondary collections are unbounded. They are documented follow-up candidates; their auth behavior and collection semantics were preserved here.
- Wallet summary amounts are calculated from the latest 100 transactions, not the lifetime ledger. Labels now say recent history. Existing CSV uses the term “Balance impact” for signed transaction amounts even when a transaction is pending; that pre-existing export semantics issue needs a separate financial review.
- Existing legacy Wallet success text derives the displayed amount from URL parameters after server verification. The server remains authoritative for success/balance, but display wording should eventually use a verified transaction amount. Settlement/API logic was not altered in this UI change.
- Overview starter recommendations can fall back to static service facts when live data is absent. Final order endpoints continue validating price and availability; eliminating misleading fallback recommendations should be handled separately with explicit service-availability regression coverage.
- No live orders, charges, UTR submission, refunds or settlement operations were used for QA. Fixture checks cannot certify real gateway callbacks, RLS configuration or production settlement correctness.

Release readiness is conditional on the recorded checks and owner review. Do not merge or deploy automatically.
