# SocialRUSH customer workspace — PR #669

This report continues draft [PR #669](https://github.com/rushal0803/socialrush-panel/pull/669) on `feat/customer-workspace-mobile-premium-20261014`, starting from `0574cac8`. It preserves that PR's navigation foundation and reuses reviewed customer-page improvements from #667 rather than creating a competing redesign. It does not merge either PR or deploy production.

## Completed scope

All 36 actual customer page routes are represented by 36 route scenarios in the general matrix (35 distinct paths plus Favourites) and the separate Direct UPI payment journey. Services and New Campaign are intentionally redirects. See the [complete route inventory](route-inventory.md) and [raw responsive results](responsive-results.json).

| Area | Completed improvements and verification |
|---|---|
| Overview | Quieter shared cards, headings and money summaries; existing data and CTAs retained |
| New Order and Favourites | Service search with clear no-results recovery; live catalogue facts retained; catalogue refresh no longer overwrites edited prefill quantity/link; keyboard-readable controls |
| Orders, Order History and Details | Consistent cards, table typography, wrapping and CTA hierarchy; existing status, repeat, refill and support controls preserved |
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
- First local browser run: 23 passed, 5 failed because an inherited #667 assertion expected a bottom bar on Order Summary. #669 intentionally hides it. The new assertion verifies absence; no application behavior changed to satisfy the old test. Corrected complete matrix rerun: 9 passed, including all eight widths and the mobile search/capture check.

## Screenshots

Before images are the existing same-fixture **main `01d49452` baseline**, retained from the #667 audit. After images were recaptured from this coordinated #669 working tree. They are not a before/after comparison limited to #669's first three commits. Monetary values and records are synthetic fixtures, not live customer data.

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

Widths: **320, 360, 390, 430, 768, 1024, 1440 and 1920px**. All 288 general matrix layouts passed: no detected document overflow, tested heading/control clipping or runtime errors. The audit temporarily removes root overflow clipping so it cannot conceal failures. Wallet balance and main Add Funds link are verified in the first viewport. Direct UPI, bank transfer and USDT instruction panels and Add Funds QR layouts pass separate checks at all eight widths. Funding amount/heading visibility also passes the existing ten-width check.

Local verification on the final application code:

- `npx tsc --noEmit`: passed before the build and after integration.
- `npm run test:unit`: **222 passed**, zero failures, including six navigation/Wallet regression cases.
- `npm run test:payment-confidence`: **14 passed**.
- Focused Phase 22/package contracts: **11 passed**.
- `npm run build`: passed; existing unrelated lint warnings remain, with no suppression.
- Chromium first run: **23 passed**, five integration-test mismatches described above. Corrected rerun: **9 passed**, covering the complete eight-width matrix and mobile search. All 28 selected browser checks are established across these runs; do not describe the initial run as wholly green.
- Full configured `npm run test:smoke` and final-head Actions status are recorded in the PR's latest verification section after CI completes.

Browser coverage includes drawer close/Escape, focus cycling/restoration, body-scroll unlock, desktop breakpoint dismissal, native disclosure, all destinations, query navigation, service search no-results, search loading/error/retry/cancellation, exact wallet shortfalls at 0/200/100000, review text contrast, and payment instructions. The mocked manual-UPI test checks disabled submitting state, error/reference retention, retry and **pending verification**, never a fabricated successful credit. Both submissions are intercepted and fulfilled inside the browser; neither reaches the endpoint. Its reference is `QA-NOT-A-PAYMENT`; the submit button is checked above the bottom bar. No UPI app/link is launched.

## Performance evidence and limits

| Search, 1,000ms observation | Main baseline | Current #669 |
|---|---:|---:|
| 390px order + ticket reads | 60 | 2 |
| 1440px order + ticket reads | 140 | 2 |
| 390px automation-observed opening (ms) | 870 | 988 |
| 1440px automation-observed opening (ms) | 321 | 365 |

Raw [mobile baseline](before-search-390.json), [mobile current](search-journey-390.json), [desktop baseline](before-search-1440.json), [desktop current](search-journey-1440.json). Mobile uses 4× CPU, 150ms RTT and 1.6Mbps download with mocked responses; desktop is unthrottled. These are single automation samples, including locator scheduling, not INP. Both current opening samples are slower; the demonstrated improvement is the request reduction and full-viewport overlay, **not a speed claim**.

Fresh unthrottled localhost fixture observations, in milliseconds:

| Page | 390px LCP / CLS | 1440px LCP / CLS |
|---|---|---|
| Overview | 1256 / 0 | 1580 / 0 |
| New Order | 716 / 0 | 760 / 0 |
| Wallet | 876 / 0 | 1504 / 0 |

[Raw lab metrics](lab-metrics.json). Each is one navigation, captured at the audit observation; LCP may change with later content. These are neither field p75 measurements nor a measured before/after speed improvement. INP was not measured. Do not claim the site's LCP ≤2.5s, INP ≤200ms or CLS ≤0.1 field targets are achieved. No dependency or new animation library was added; existing navigation motion is reduced, and wallet counter animation is removed.

## Financial safety and release recommendation

No checkout/payment API, settlement/refund calculation, authentication, permissions, Supabase client implementation, RLS, schema or migration changes. No live service price, quantity limit, wallet balance/deduction, partial-wallet formula, order creation or idempotency change. Existing analytics/tracking calls are retained. New Order changes are local search/prefill interaction; order-summary and payment/recovery changes are presentation; wallet counter renders the actual supplied value immediately. QR fixture encodes a QA marker and cannot initiate payment. Fixtures use synthetic identity and transport; they cannot prove production settlement, authorization or real data completeness.

**Keep draft for owner review; hold production release.** Final-head required CI must be green. Physical Android/iPhone keyboard/safe-area checks, approved sandbox gateway/settlement/refund verification, complete current-head Safari/Firefox coverage and field p75 CWV remain unverified release checks. No real production order or payment was submitted. No merge or production deployment without explicit owner approval. Limit work to this existing PR and one coordinated implementation/evidence commit unless a genuine failing gate needs correction.
