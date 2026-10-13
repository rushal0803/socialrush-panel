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

## Search and compact navigation follow-up

The same feature branch preserves the owner's test-only correction and adds native, keyboard-operable mobile disclosure groups. New Order, Orders, Wallet and Packages remain immediately visible; all 22 destinations remain available. Compare the [previous drawer](before-compact-drawer-390.png) with the [compact drawer](after-compact-drawer-390.png).

Search previously refetched continuously when orders were empty or a request failed. It now reads orders and tickets once per opening or explicit retry, aborts pending reads on dismissal, and reports loading, empty and error states. Its dialog is portalled to the document body, with labelled controls, keyboard containment, Escape/outside dismissal, focus restoration and body scroll restoration. This removes the sticky header's containing-block constraint without changing authenticated APIs or financial state.

| Search observation | Before | After |
|---|---:|---:|
| 390px, API reads during the 1,000ms observation | 60 | 2 |
| 1440px, API reads during the 1,000ms observation | 140 | 2 |
| 390px, automation-observed opening time (ms) | 870 | 1046 |
| 1440px, automation-observed opening time (ms) | 321 | 281 |
| 390px, dialog overlay bounds | 390 × 117px | 390 × 844px |
| 1440px, dialog overlay bounds | 1184 × 117px | 1440 × 844px |

The mobile run uses Chromium 4× CPU slowdown, 150ms RTT, 1.6Mbps download and 750Kbps upload; desktop is unthrottled. API responses are synthetic empty records. Opening time is a single automation sample, including test/locator scheduling, **not INP or a field percentile**. Mobile opening was slower in this sample; only the request reduction and corrected overlay geometry are established improvements. Raw samples: [mobile before](before-search-390.json), [mobile after](after-search-390.json), [desktop before](before-search-1440.json), [desktop after](after-search-1440.json).

Follow-up validation passed the production build, TypeScript, 216 unit tests, 14 payment-confidence tests and 14 targeted navigation/package/responsive contracts (some overlap). Three search browser tests verify request budgets, focus/Escape, explicit error retry and cancellation. Twelve further Chromium tests cover the compact drawer, service search, wallet shortfall reviews, payment instructions and 102 layouts across all 34 routes at 320/768/1440px. The original ten-width, 340-layout evidence remains above. The added fixture-only CI step runs these critical search/navigation/wallet reviews within the existing smoke job, without another build or job.

The full local `npm run test:smoke -- --workers=2` completed with 325 passed, 59 opt-in cases skipped and one timeout in the existing public-navigation warmup test. Its menu click did not open a drawer; the unchanged test passed on isolated rerun (2.5s test / 8.5s suite). No assertion was removed or relaxed. The first full run was interrupted before a summary and is not counted as a pass. After the final focus correction, all eight Chromium search/navigation/wallet cases selected for CI passed together in 29.8s. Final-head CI is the full release regression gate, with the repository's existing retry policy.

The follow-up desktop WebKit short-phone drawer check passed. The combined WebKit run exhausted its global deadline before the remaining checks ran; an isolated search retry check then exposed Safari's pointer-button focus behavior. Search now explicitly focuses its trigger on pointer opening, so dismissing restores the correct trigger. After the correction, both the unchanged search retry/cancellation/focus test and all-destinations/query-navigation drawer test passed in an isolated WebKit run (2 tests, 33.8s). The final production rebuild and `npx tsc --noEmit` passed. The timing samples above were captured before this final focus-only correction. Desktop WebKit checks do not establish physical iPhone behavior.

## Final review and comparison with PR #668 (14 October 2026)

The final review started from #667 head `916008c0`, preserving the owner's persistent Add Funds/Get Support footer and its green CI run `38470083344`. PR #668 (`13d307f0`) was compared against current main and this implementation; its alternative navigation was not cherry-picked wholesale.

| Overlap in #668 | Disposition in #667 |
|---|---|
| Compact native disclosure groups, readable sidebar, CSS active states, safe-area clearance | Already implemented in #667; preserve the existing 22 destinations and page styling |
| Persistent Add Funds and Support footer | Already integrated by the owner; both controls remain visible and at least 44px high on a 320×480 phone. The existing wallet hash link redirects to the canonical `/dashboard/add-funds` payment page, rather than revealing an inline wallet section. [Current drawer](final-funds-drawer-390.png) |
| Shared bottom-navigation route matching | Already shared; add the missing Order Summary → New Order continuation highlight and constrain the favourites query exclusion to its actual page |
| Explicit bottom-bar focus and reduced-motion states | Integrate the missing keyboard outline and reduced-motion transition class |
| Direct UPI highlighted as New Order | Preserve #667's Wallet highlight for its existing funding route; no payment flow changes |
| Alternate menu spacing, group ordering and seven-file foundation replacement | Preserve working #667 layout; no demonstrated capability gap warrants a second redesign |

The visual review found dark legacy text on dark order-review cards. Presentation-only classes now give quantity/link labels, summary values, instructions and recovery feedback readable colours and quieter borders. The UPI caption and saved-checkout warning receive the same correction. Financial calculations, validation, wallet loading and submission code before the JSX return are unchanged; the payment/recovery components change colour classes only. QR plates and the intentionally light X-platform badge retain their existing contrasting text.

| Selected text, computed colour contrast | Before | After |
|---|---:|---:|
| Quantity/link labels and order summary values, 390px | 1.06:1 | 17.29:1 |
| Direct UPI caption, 390px | 2.51:1 | 12.75:1 |
| Already-paid recovery warning, 390px | 1.16:1 | 15.90:1 |

The new browser check requires at least 4.5:1 for selected review text at 390/1440px and for the synthetic already-paid warning. It checks the existing recovery URL without following it or creating an intent, payment or UTR. These are computed CSS colour measurements for those selected controls, not a whole-site accessibility certification or a performance claim. See [raw contrast measurements](final-review-contrast.json).

The Add Funds click check first exposed an incorrect test assumption: the wallet hash uses the existing redirect to `/dashboard/add-funds`; its inline section is intentionally hidden. The corrected destination check then found the payment heading below the mobile viewport because the large confidence panel preceded the entire funding form. The layout now places the unchanged form first and the unchanged confidence panel afterwards. No payment control, method, warning, amount rule or verification action is removed. The browser regression checks the actual destination and amount field, plus first-viewport heading/amount visibility and overflow at all ten requested widths.

| Capture | Before | After |
|---|---|---|
| Order review, mobile 390px | [Before](before-order-review-contrast-390.png) | [After](after-order-review-contrast-390.png) |
| Order review, desktop 1440px | [Before](before-order-review-contrast-1440.png) | [After](after-order-review-contrast-1440.png) |
| Saved-payment warning, mobile 390px | [Before](before-recovery-warning-390.png) | [After](after-recovery-warning-390.png) |
| Funding form, mobile 390px | [Before](before-funding-form-390.png) | [After](after-funding-form-390.png) |
| Funding form, tablet 768px | [Before](before-funding-form-768.png) | [After](after-funding-form-768.png) |
| Funding form, desktop 1440px | [Before](before-funding-form-1440.png) | [After](after-funding-form-1440.png) |

Navigation/package unit contracts and the contrast/recovery browser check run in existing CI steps, with no additional CI job or deployment. The original mobile/tablet/desktop evidence and detailed 34-route inventory remain above. Latest final-head CI and release status are linked from PR #667.

Local review verification: production build, `npx tsc --noEmit`, 216 unit tests, 14 payment-confidence tests and 7 package/navigation contract tests passed. The post-contrast route run passed all 24 browser checks, including 340 layouts across 34 routes at every requested width, exact wallet shortfall reviews, search, navigation and payment instructions. After reordering the funding layout, six focused Chromium checks passed: the actual drawer-to-funding journey, heading/amount visibility and overflow at all ten widths, and payment instructions at 320/390/768/1440px. See [raw route results](final-review-responsive-results.json); that matrix precedes the final funding-layout reorder, which is covered by the focused ten-width check. Earlier failed diagnostic assertions are explained above; no product assertion was removed to hide a defect.

The final isolated WebKit run passed all three checks in 28.3s: drawer-to-funding navigation, funding heading/amount visibility across all ten widths, and review/recovery contrast. This remains a desktop engine check; physical iPhone keyboard and safe-area behavior is a release review requirement.

## Release gate

Keep the PR in draft until CI, visual review and owner-approved staging checks pass. Firefox runner repair, real gateway settlement, database integration, physical Android/iPhone keyboard/safe-area behavior and field p75 LCP/INP/CLS require separate release verification. Local fixtures cannot prove production data completeness or gateway settlement. Existing unrelated lint warnings are not suppressed.

## Mobile wallet first-screen usability follow-up (14 October 2026)

Inspection of the actual 390px and 768px fixture captures revealed a content-priority issue: the wallet route placed a four-step payment explainer and a detailed confidence panel above the live wallet balance and actions, pushing the money controls below the first fold.

The wallet route now renders its existing WalletDashboard first, followed by both existing payment-confidence components. No data fetching, payment options, pricing calculations, hidden legacy add-funds form, add-funds redirect, or transaction semantics changed. The separate add-funds route retains its payment guidance. A unit regression checks this order.

Visual evidence warning: the checked-in wallet 'after' screenshots predate this specific ordering correction and must be recaptured for design approval. Re-run configured responsive and payment regression tests at this exact head before merge. No Vercel preview or production deploy requested.
