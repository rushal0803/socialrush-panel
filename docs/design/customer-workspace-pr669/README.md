# SocialRUSH customer workspace — PR #669

## Latest continuation: 15 October 2026

Reviewed owner head `f507b6d0`, including the incorporated #674 money-page work, without restarting the redesign. Chromium passed **34 tests** in 5.9 minutes: **360 general layouts** (36 scenarios at 320, 360, 375, 390, 430, 768, 1024, **1280**, 1440 and 1920px), ten direct-payment widths and critical customer journeys. No detected horizontal overflow. Updated Overview/New Order/Wallet comparisons use fresh captures; historical before images remain labelled with their original baseline below.

The new pending-payment Billing test checks ten widths, status wording, receipt destination, overlay visibility, scroll lock, filter recovery, keyboard containment and focus restoration without payment submission. It reproduced a WebKit focus escape in the owner's boundary-only focus trap. The correction explicitly cycles through dialog controls and focuses the invoking Details button before opening, preserving focus restoration in Safari. No financial data, calculation, request or payment action changed. **Corrected-build test passed in Chromium (34.4s) and WebKit (1.4m), each across all ten widths.** This focused WebKit check does not establish complete Safari coverage.

TypeScript, **225 unit tests** and the corrected production build pass. **14 payment-confidence tests** passed on the owner head; financial code is unchanged. Owner-head Actions [38614532235](https://github.com/rushal0803/socialrush-panel/actions/runs/38614532235) passed; this is historical evidence until the correction's exact-head CI completes. Existing build lint warnings remain outside this presentation change.

| Refreshed evidence | Mobile 390px | Tablet 768px | Desktop 1440px |
|---|---|---|---|
| Wallet | [Capture](after-dashboard-wallet-390.png) | [Capture](after-dashboard-wallet-768.png) | [Capture](after-dashboard-wallet-1440.png) |
| Billing | [Capture](after-dashboard-billing-390.png) | [Capture](after-dashboard-billing-768.png) | [Capture](after-dashboard-billing-1440.png) |
| Pending payment dialog | [Capture](billing-pending-dialog-390.png) | [Capture](billing-pending-dialog-768.png) | [Capture](billing-pending-dialog-1440.png) |
| Order Review | [Capture](after-dashboard-order-summary-390.png) | [Capture](after-dashboard-order-summary-768.png) | [Capture](after-dashboard-order-summary-1440.png) |

Measured Next.js build First Load JS, prior main reconciliation versus owner head: Overview **120 → 120 kB**, New Order **208 → 208 kB**, Wallet **169 → 169 kB**, Order Summary **187 → 187 kB**, Billing **114 → 115 kB**. Route-scoping the legacy UPI client did **not** show a reported bundle reduction; Billing accessibility adds approximately 1 kB. These rounded build estimates do not establish faster performance or field CWV targets.

**Remaining product limitation:** Billing supplies invoice metadata and payment receipt details, not downloadable invoice documents. No approved invoice-document endpoint/assets exist in this reviewed implementation; no fake download was added. Physical Android/iPhone behavior, complete browser coverage, field INP/p75 CWV, large histories and approved sandbox settlement/refunds remain unverified. Keep draft for owner review; no production merge/deployment.

This report continues draft [PR #669](https://github.com/rushal0803/socialrush-panel/pull/669) on `feat/customer-workspace-mobile-premium-20261014`, starting from `0574cac8`. The latest continuation reconciles owner-merged main `d4c2baaa` (#667 plus analytics #671/#672) into this same feature branch; it does not duplicate those already merged page upgrades. It preserves that PR's navigation foundation and reuses reviewed customer-page improvements from #667 rather than creating a competing redesign. It does not merge either PR or deploy production.

## Completed scope

All 36 actual customer page routes are represented by 36 route scenarios in the general matrix (35 distinct paths plus Favourites) and the separate Direct UPI payment journey. Services and New Campaign are intentionally redirects. See the [complete route inventory](route-inventory.md) and [raw responsive results](responsive-results.json).

| Area | Completed improvements and verification |
|---|---|
| Overview | Quieter shared cards, headings and money summaries; existing data and CTAs retained |
| New Order and Favourites | Service search with clear no-results recovery; live catalogue facts retained; catalogue refresh no longer overwrites edited prefill quantity/link; keyboard-readable controls |
| Orders, Order History and Details | Existing labelled search/status/platform filters now precede summaries, repeat/growth promotions and guidance; tracking records precede cross-sell cards. Accessible loading/error/no-results states and AA-contrast repeat buttons; status, repeat, refill and support logic preserved |
| Wallet and Add Funds | Exact displayed balance without animated intermediate values; existing balance/actions and amount form before supplementary payment guidance; readable history and pending states |
| Order Summary and Direct UPI | Readable summary/instructions/recovery contrast; preserve #669's hidden bottom bar on focused checkout routes; no payment calculations or submission changes |
| Packages, Billing and Transaction Details | Shared restrained charcoal/orange foundation; billing switches to cards below 1440px to avoid cramped rows; existing invoice metadata preserved |
| Campaign Stacks, Recurring Revenue, Reseller Hub and its four subpages | Consistent typography, borders, cards, inputs and responsive layouts; real quantities, prices and campaign actions preserved |
| Campaigns/Details, Clients/Details and New Campaign | Shared design and fixture layout checks; existing workspace records and navigation preserved |
| Referrals, Saved Profiles, Repeat Campaigns, Rewards, Reviews/New Review | Shared cards and hierarchy; Saved Profiles get deterministic dates and labelled repeat-order handoff; existing actions retained |
| Notifications, Account, Settings, API Documentation and Support | Shared input/card/focus foundation; settings icon buttons now labelled; existing support and notification flows preserved |
| Navigation and Search | Preserve #669's quick actions, native Workspace disclosure, close button and scroll locking; restore all 22 destinations, correct query/nested active states, persistent Add Funds/Support footer; viewport-bound search dialog, focus containment/restoration, explicit retry and bounded reads |

Existing good page layouts were preserved. Shared design improvements apply throughout the customer shell; this is not a claim that every page received a new bespoke implementation or that production backend behavior was exercised.

## Bugs and integration corrections

- The owner's `defaultOpen` → valid `open` correction is verified by TypeScript and an updated navigation regression. Initial Vercel deployment `dpl_5Sv8ET6uhVBxQY3wDaaQnARJ1suT` was READY on exact head `0574cac8`; its two predecessors failed.
- Initial Actions run [38552243081](https://github.com/rushal0803/socialrush-panel/actions/runs/38552243081) passed TypeScript but failed the brand-colour unit contract. Restore the actual SocialRUSH `#ff7600` token; do not weaken the brand test.
- Restore Settings, Rewards, Repeat Campaigns, Your Reviews and API Documentation to the drawer. Place Wallet with the main money destinations. Fix Favourites query highlighting and closing after same-path query navigation.
- Keep funding/support actions visible on a 320×480 phone, with at least 44px targets; no destination removed.
- Reuse proven fixes for the search empty/error request loop, contained dialog/focus, cramped billing rows, unreadable review/recovery text and money controls pushed below guidance. No alternative financial implementation was adopted.
- The obsolete Phase 22 unit assertion expected a removed inline colour string. It now checks retained readable text, tap targets, active state, keyboard outline and the dark portal surface.
- Actions [38555894258](https://github.com/rushal0803/socialrush-panel/actions/runs/38555894258) passed the full smoke suite (262 passed, 62 opt-in skips) but found Add Funds document overflow at 1024px on Linux Chromium (1051px measured width). The local Windows header also exceeded its own available width. Fix the header's old navigation-helper argument order and show its optional workspace caption only from 1440px, leaving narrow desktop space for money/account actions. Funding tests now check visible header controls as well as document width; the overflow assertion is retained.
- First local browser run: 23 passed, 5 failed because an inherited #667 assertion expected a bottom bar on Order Summary. #669 intentionally hides it. The new assertion verifies absence; no application behavior changed to satisfy the old test. Corrected complete matrix rerun: 9 passed, including all nine widths and the mobile search/capture check.

## Screenshots

Before images are the existing same-fixture **main `01d49452` baseline**, retained from the #667 audit. After images were recaptured from the latest #669 working tree reconciled with main, including the Orders priority correction. New Order plain-entry captures are kept separate from its Favourites variant. They are not a before/after comparison limited to #669's first three commits. Monetary values and records are synthetic fixtures, not live customer data.

| Page | Mobile 390px before / after | Tablet 768px before / after | Desktop 1440px before / after |
|---|---|---|---|
| Overview | [Before](before-dashboard-390.png) / [After](after-dashboard-390.png) | [Before](before-dashboard-768.png) / [After](after-dashboard-768.png) | [Before](before-dashboard-1440.png) / [After](after-dashboard-1440.png) |
| New Order | [Before](before-dashboard-new-order-390.png) / [After](after-dashboard-new-order-390.png) | [Before](before-dashboard-new-order-768.png) / [After](after-dashboard-new-order-768.png) | [Before](before-dashboard-new-order-1440.png) / [After](after-dashboard-new-order-1440.png) |
| Wallet | [Before](before-dashboard-wallet-390.png) / [After](after-dashboard-wallet-390.png) | [Before](before-dashboard-wallet-768.png) / [After](after-dashboard-wallet-768.png) | [Before](before-dashboard-wallet-1440.png) / [After](after-dashboard-wallet-1440.png) |
| Orders | [Current](after-dashboard-orders-390.png) | [Current](after-dashboard-orders-768.png) | [Current](after-dashboard-orders-1440.png) |
| Billing | [Current](after-dashboard-billing-390.png) | [Current](after-dashboard-billing-768.png) | [Current](after-dashboard-billing-1440.png) |
| Packages | [Current](after-dashboard-packages-390.png) | [Current](after-dashboard-packages-768.png) | [Current](after-dashboard-packages-1440.png) |
| Direct UPI instructions | [Current](payment-UPI-390.png) | [Current](payment-UPI-768.png) | [Current](payment-UPI-1440.png) |

[Current drawer](drawer-390.png) · [Browser-mocked pending verification](mocked-pending-confirmation-390.png). The drawer capture waits for the logo to load. All-route viewport/full-page captures remain in local `artifacts/premium-responsive/pr669-final`; only selected evidence is checked in to limit repository growth.

## Responsive, functional and payment checks

Widths: **320, 360, 375, 390, 430, 768, 1024, 1440 and 1920px**. All 324 general matrix layouts passed: no detected document overflow, tested heading/control clipping or runtime errors. The audit temporarily removes root overflow clipping so it cannot conceal failures. Wallet balance and main Add Funds link are verified in the first viewport. Direct UPI, bank transfer and USDT instruction panels and Add Funds QR layouts pass separate checks at all eight widths. Funding amount/heading visibility also passes the existing ten-width check.

Local verification on the final application code:

- `npx tsc --noEmit`: passed before the build and after integration.
- `npm run test:unit`: **223 passed**, zero failures, including seven navigation/Wallet/header regression cases after the CI correction.
- `npm run test:payment-confidence`: **14 passed**.
- Focused Phase 22/package contracts: **23 passed** (Phase 22, latest analytics Phase 45 and package contracts).
- First-order, checkout and retention contracts: **20 passed** (configured phase checks; do not sum overlapping suites as unique coverage).
- `npm run build`: passed; existing unrelated lint warnings remain, with no suppression.
- Latest reconciled application: **30 Chromium checks passed**, including all 324 general route layouts, nine-width payment instructions, service search, navigation, wallet splits and mocked funding. The new Orders test was interrupted because its initial locator waited for a mobile bar hidden on desktop; corrected hidden-element lookup and bounded timeout. The unchanged application then passed that Orders test separately (1 check, 14.1s test / 32.8s suite), covering all nine widths. All 31 selected scenarios are established across these runs; the initial run is not presented as wholly green.
- Historical Chromium first run: **23 passed**, five integration-test mismatches described above. Corrected rerun: **9 passed**, covering the complete eight-width matrix and mobile search. All 28 selected browser checks are established across these runs; do not describe the initial run as wholly green.
- Full configured `npm run test:smoke` and final-head Actions status are recorded in the PR's latest verification section after CI completes.

Browser coverage includes drawer close/Escape, focus cycling/restoration, body-scroll unlock, desktop breakpoint dismissal, native disclosure, all destinations, query navigation, service search no-results, search loading/error/retry/cancellation, exact wallet shortfalls at 0/200/100000, review text contrast, and payment instructions. The mocked manual-UPI test checks disabled submitting state, error/reference retention, retry and **pending verification**, never a fabricated successful credit. Both submissions are intercepted and fulfilled inside the browser; neither reaches the endpoint. Its reference is `QA-NOT-A-PAYMENT`; the submit button is checked above the bottom bar. No UPI app/link is launched.

## Performance evidence and limits

| Search, 1,000ms observation | Historical pre-upgrade baseline | Current #669 |
|---|---:|---:|
| 390px order + ticket reads | 60 | 2 |
| 1440px order + ticket reads | 140 | 2 |
| 390px automation-observed opening (ms) | 870 | 998 |
| 1440px automation-observed opening (ms) | 321 | 162 |

Raw [mobile baseline](before-search-390.json), [mobile current](search-journey-390.json), [desktop baseline](before-search-1440.json), [desktop current](search-journey-1440.json). Mobile uses 4× CPU, 150ms RTT and 1.6Mbps download with mocked responses; desktop is unthrottled. These are single automation samples, including locator scheduling, not INP. The samples vary between runs (the earlier coordinated run was 988ms mobile / 365ms desktop). They do not establish a speed improvement; the demonstrated improvement is the request reduction and full-viewport overlay.

Fresh unthrottled localhost fixture observations, in milliseconds:

| Page | 390px LCP / CLS | 1440px LCP / CLS |
|---|---|---|
| Overview | 1432 / 0 | 1684 / 0 |
| New Order | 684 / 0 | 856 / 0 |
| Wallet | 1392 / 0 | 1416 / 0 |

[Raw lab metrics](lab-metrics.json). Each is one navigation, captured at the audit observation; LCP may change with later content. These are neither field p75 measurements nor a measured before/after speed improvement. INP was not measured. Do not claim the site's LCP ≤2.5s, INP ≤200ms or CLS ≤0.1 field targets are achieved. No dependency or new animation library was added; existing navigation motion is reduced, and wallet counter animation is removed.

## Financial safety and release recommendation

No checkout/payment API, settlement/refund calculation, authentication, permissions, Supabase client implementation, RLS, schema or migration changes. No live service price, quantity limit, wallet balance/deduction, partial-wallet formula, order creation or idempotency change. Existing analytics/tracking calls are retained. New Order changes are local search/prefill interaction; order-summary and payment/recovery changes are presentation; wallet counter renders the actual supplied value immediately. QR fixture encodes a QA marker and cannot initiate payment. Fixtures use synthetic identity and transport; they cannot prove production settlement, authorization or real data completeness.

**Keep draft for owner review; hold production release.** Final-head required CI must be green. Physical Android/iPhone keyboard/safe-area checks, approved sandbox gateway/settlement/refund verification, complete current-head Safari/Firefox coverage and field p75 CWV remain unverified release checks. No real production order or payment was submitted. No merge or production deployment without explicit owner approval. Existing coordinated implementation, genuine CI overflow correction and one continuation to reconcile latest main and prioritize Orders; no competing PR, new dependency or deployment command.

## Latest code audit and Orders priority correction

Latest main already contains the reviewed shared design, New Order/search, Wallet/funding and Billing improvements from #667. This continuation preserves them and resolves the overlapping UI/QA files in #669. The owner?s return-visit and concurrent-beacon analytics fixes are retained. Protected API, Supabase implementation, payment logic and database paths have no diff against latest main. The normalized Orders source before its JSX return is identical to main: fetching, status mapping, summary calculations, filtering and repeat-URL logic did not change.

The remaining demonstrated design gap was Orders hierarchy: a large command center and repeat/growth cards preceded search, filters and records. Existing filters now come first, followed by summary and records; every repeat campaign, growth and refill/support control remains available. Search/status/platform controls have accessible names, and loading/error/no-results feedback is announced. Primary repeat/new-order labels use dark text on SocialRUSH orange. No additional client state, request, animation or JavaScript library was introduced.

| Orders | Before priority correction (PR starting head 2b4192b1) | Current |
|---|---|---|
| Mobile 390px | [Before](before-orders-priority-390.png) | [After](after-dashboard-orders-390.png) |
| Tablet 768px | [Before](before-orders-priority-768.png) | [After](after-dashboard-orders-768.png) |
| Desktop 1440px | [Before](before-orders-priority-1440.png) | [After](after-dashboard-orders-1440.png) |

[Raw Orders measurements](orders-priority.json): search is within the first viewport and above the bottom bar at all nine widths; footer shortcuts clear the bottom bar; computed repeat-button contrast is 6.94:1; status/no-results/reset and preserved quantity/link handoff passed with read-only synthetic records. The complete route matrix also checks populated Orders and Order History. No orders were submitted.

The request reduction above belongs to the prior upgrade already merged in main; it is not claimed as an incremental speed improvement from this Orders/layout continuation. Latest samples do not identify an additional measured bottleneck that warrants a risky JavaScript, data-fetching or financial refactor. Field INP and p75 CWV targets remain unverified. Final-head CI and preview status are recorded in the existing PR after the reconciliation commit.

## Integrated money-page accessibility patch (14 October 2026)

- Reconciled draft [#674](https://github.com/rushal0803/socialrush-panel/pull/674) into the **single customer-workspace PR #669** without overwriting its navigation and Orders improvements. The original PR #674 remains open until this consolidated branch passes the exact-head checks.
- Exact order-review UI, saved payment recovery, keyboard-trapped Billing transaction details, mobile readable inputs, and route-scoped legacy UPI overlay are included. The two previously overlapping files (`PremiumWorkspace.module.css` and `dashboard-navigation.test.ts`) were merged by preserving #669's complete content and adding only #674's additive CSS and two new regression tests.
- No price calculation, wallet balance, checkout intent, payment provider callbacks, Supabase migrations, auth, RLS, or customer financial data were touched.
- **Release gate:** re-run latest SHA CI, payment-confidence, full browser smoke, TypeScript and Vercel preview; verify mobile overlays versus bottom navigation at 320/390/430px. No merge or production release from this integration commit.
