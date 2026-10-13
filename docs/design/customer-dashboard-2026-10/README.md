# SocialRUSH customer workspace upgrade

Baseline: latest main `01d49452`, fetched on 13 October 2026. Implementation stays on `feat/premium-customer-dashboard-v2`. No merge or deployment is part of this change.

## Implementation

- Shared charcoal surfaces, restrained orange accents, consistent controls, tabular amounts and visible keyboard focus in `PremiumWorkspace.module.css`.
- Grouped desktop/mobile navigation retains existing links and adds Settings, Rewards, Reviews, Repeat Campaigns and API Documentation. Wallet joins the primary group. Active links distinguish favourites, child routes and aliases.
- CSS navigation states replace spring animation. The existing drawer retains its focus trap, Escape handling, scroll lock, safe-area padding, close control and close-on-navigation behavior.
- New Order adds labelled local catalogue search, result counts and a clear-search recovery action. It preserves the existing four-step order flow, specialty fields, availability checks, quantity/link validation and payment handoff.
- URL prefill applies once per query instead of reapplying whenever live catalogue facts arrive. Delayed service refreshes still update pricing/limits but preserve edited quantity, destination and specialty fields.
- Wallet amounts render exactly on the first render instead of animating from zero over 900ms. No calculation or ledger value changes.
- Billing uses transaction cards below 1440px so the fixed desktop sidebar cannot squeeze the six-column activity grid.
- Settings switches have accessible names and 44px targets. Save feedback and the support launcher clear the tablet/mobile bottom navigation.
- Saved Profiles uses an explicit locale/timezone to prevent server/client date hydration mismatches, enlarges row actions and prefills the selected public URL in New Order.
- Overview uses the shared system instead of an additional legacy stylesheet that restored large glows and a competing sticky action dock. Existing metrics, recovery opportunities, repeat actions and support data remain.
- Packages and workspace forms inherit the shared foundation; package prices, discounts and guarantees are not invented or changed.

## Route audit

All dashboard page files and their primary components were inspected. The following distinguishes shared visual upgrades from task-specific changes. Shared styling does not imply that each business operation was exercised against a real account.

| Routes | Audit and upgrade scope |
|---|---|
| `/dashboard` | Real server-derived metrics, recent/active orders, payments, support, saved profiles and repeat actions preserved; shared overview typography, surfaces and action placement |
| `/dashboard/new-order`, favourites query | Search and recovery, complete details/review flow, wallet split and validation |
| `/dashboard/wallet`, `/dashboard/add-funds` | Exact balance display, payment method availability, verification messaging, history and shared controls |
| `/dashboard/direct-upi`, `/dashboard/order-summary` | Protected session and wallet split code inspected; payment instructions and QR plates preserved |
| `/dashboard/orders`, `/dashboard/order-history`, `/dashboard/orders/[id]` | Existing filters, mobile cards, status/progress, refill and repeat behavior preserved; shared shell and surfaces |
| `/dashboard/billing`, `/dashboard/billing/transactions/[id]` | Responsive transaction cards/table, pending status and receipts preserved |
| `/dashboard/packages` | Live catalogue and tier selection preserved; shared header and workspace shell |
| `/dashboard/campaign-stacks`, `/dashboard/retainers` | Existing recommendations/calculations preserved; shared typography, cards and navigation |
| `/dashboard/reseller`, `/dashboard/reseller/portfolio`, `/dashboard/reseller/monthly-plans`, `/dashboard/reseller/monthly-planner`, `/dashboard/reseller/bulk-planner` | Existing planners and customer data preserved; shared shell, controls and responsive layout reviewed |
| `/dashboard/campaigns`, `/dashboard/campaigns/[id]` | Existing create/edit/assignment forms preserved; shared cards and headers |
| `/dashboard/clients`, `/dashboard/clients/[id]` | Existing account-scoped queries and client/profile actions preserved; shared cards and forms |
| `/dashboard/referrals`, `/dashboard/rewards` | Referral/reward data and eligibility preserved; shared surfaces and full navigation access |
| `/dashboard/saved-profiles` | Existing profile forms/prefill actions preserved; shared forms and navigation |
| `/dashboard/notifications` | Existing notification data/actions preserved; shared shell |
| `/dashboard/account`, `/dashboard/settings` | Existing account/auth actions preserved; labelled switches and tablet bottom clearance |
| `/dashboard/support` | Existing tickets, payment/order context and recovery links preserved; shared shell |
| `/dashboard/reviews`, `/dashboard/reviews/new`, `/dashboard/api-docs` | Existing functionality preserved and made directly discoverable in navigation |
| `/dashboard/services`, `/dashboard/new-campaign`, `/dashboard/repeat-campaigns` | Existing compatibility/redirect and repeat entry points inspected; shared destinations |

`packages/premium-page.tsx` is a compatibility export, not an additional route. No customer feature was removed.

The branch is explicitly excluded from automatic Vercel Git deployments in `vercel.json` to conserve preview usage, using the existing repository configuration pattern. See [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

## Financial boundaries

The diff does not alter order/payment APIs, financial calculations, settlement, wallet deductions, idempotency, refund handling, authentication, RLS or migrations. All balances and totals continue to come from the existing application paths. QR white plates retain their local styles. Pending payments remain pending until existing verification confirms them. Billing already exposes invoice metadata without downloadable documents; this change does not fabricate downloads.

Browser QA uses the existing process-only Supabase transport fixture. Additional order/client/transaction rows are synthetic. Read filters and nullable columns mirror requested data, and paid RPCs stay blocked. No actual paid order, wallet credit, payment reference submission or UPI launch is used for testing.

## Validation and evidence

Final production build and TypeScript validation passed. The unit suite passed 216 tests; the separate payment/navigation run passed 17 tests and the pricing/package/navigation run passed 9 tests (these commands overlap on navigation tests). Existing lint warnings remain visible.

The primary Chromium run passed all 20 tests: **340 layouts across 34 routes** at all ten requested widths, two drawer keyboard/navigation checks, service-search recovery, three delayed-catalogue wallet split checks, and four payment-instruction checks. No document overflow, clipped tested headings/controls or runtime errors were found in the final matrix. Financial reviews change quantity from 1,000 to 2,000 with a delayed catalogue response and assert total, wallet contribution, remaining payable and projected balance for wallet balances of 0, 200 and 100,000 INR without submitting an order.

See [responsive results and local metrics](responsive-results.json). Full local evidence lives under `artifacts/premium-responsive/dashboard-upgrade-after`; baseline captures are under `artifacts/premium-responsive/before`.

Five additional package checkout tests passed: preserved login handoff, intent idempotency/server pricing and quantity rejection, insufficient wallet routing without an order, changed-total protection, and specialty-field cleanup. WebKit passed the focused service-search and three wallet-split checks after test actions were synchronized with client hydration. WebKit drawer keyboard navigation and all-link/query navigation also passed in the earlier cross-engine run. This is a desktop WebKit engine check, not a physical iPhone test.

Firefox could not create a page in this local Playwright setup (`browserContext.newPage: Cannot read properties of undefined (reading '_page')`). Its application behavior remains unverified. Earlier WebKit quantity/search attempts interacted with visible server-rendered inputs before hydration; the final tests wait for a client catalogue request, retain the deliberately delayed response, and assert edited values and exact totals. No product assertions were removed or relaxed.

| Viewport | Overview before / after | New Order before / after | Wallet before / after |
|---|---|---|---|
| Mobile 390px | [Before](before-dashboard-390.png) / [After](after-dashboard-390.png) | [Before](before-dashboard-new-order-390.png) / [After](after-dashboard-new-order-390.png) | [Before](before-dashboard-wallet-390.png) / [After](after-dashboard-wallet-390.png) |
| Tablet 768px | [Before](before-dashboard-768.png) / [After](after-dashboard-768.png) | [Before](before-dashboard-new-order-768.png) / [After](after-dashboard-new-order-768.png) | [Before](before-dashboard-wallet-768.png) / [After](after-dashboard-wallet-768.png) |
| Desktop 1440px | [Before](before-dashboard-1440.png) / [After](after-dashboard-1440.png) | [Before](before-dashboard-new-order-1440.png) / [After](after-dashboard-new-order-1440.png) | [Before](before-dashboard-wallet-1440.png) / [After](after-dashboard-wallet-1440.png) |

## Performance observations

Wallet counters previously scheduled animation-frame state updates for 900ms; they now render the supplied exact value with no count-up state or observer. Sidebar active-state animation is CSS-only. The overview no longer imports an additional visual layer with animated glows and sticky effects. Service search is local and adds no network requests or dependency. Existing deferred catalogue and wallet fetching is preserved.

These are **single final-build local fixture observations**, not a before/after speed claim:

| Route | Width | LCP (ms) | CLS | TTFB (ms) |
|---|---:|---:|---:|---:|
| Overview | 390 | 1552 | 0 | 465 |
| New Order | 390 | 344 | 0 | 43 |
| Wallet | 390 | 624 | 0.0196 | 65 |
| Overview | 1440 | 1528 | 0 | 430 |
| New Order | 1440 | 1192 | 0 | 101 |
| Wallet | 1440 | 660 | 0.0105 | 40 |

No comparable baseline timing run or INP measurement was made. Production LCP/INP/CLS targets remain a release verification requirement.

Reproduce the complete customer matrix in PowerShell after a production build:

```powershell
npm run build
$env:RESPONSIVE_PAYMENT_FIXTURE='1'
$env:DASHBOARD_UPGRADE_AUDIT='1'
$env:RESPONSIVE_STAGE='dashboard-upgrade-after'
npx playwright test tests/smoke/premium-responsive.spec.ts --grep 'authenticated layouts at (320|360|375|390|430|768|1024|1280|1440|1920)px|customer service search|order review preserves|dashboard drawer|payment instructions at (320|390|768|1440)px' --workers=2
```

Lab LCP/CLS/TTFB values in per-width JSON files are single local, unthrottled synthetic navigations with reduced motion. They are not field Core Web Vitals, Lighthouse scores, INP measurements or a statistically paired before/after benchmark. The baseline screenshots use an empty fixture; the final workspace includes synthetic populated records. New Order uses the same catalogue in both.

## Release gate

Keep the PR in draft until CI, visual review and owner-approved staging checks pass. Firefox runner repair, real gateway settlement, database integration, physical Android/iPhone keyboard/safe-area behavior and field p75 LCP/INP/CLS require separate release verification. Local fixtures cannot prove production data completeness or gateway settlement. Existing unrelated lint warnings are not suppressed.
