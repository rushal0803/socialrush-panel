# Customer dashboard completion ? 15 October 2026

Base: latest fetched main 97e1c660. Existing feature branch: feat/dashboard-premium-ux-overhaul. No merge to main or deployment is authorized.

## Scope reconciliation

The supplied brief largely describes work already merged in #667, #669 and the performance audit in 97e1c660. Those implementations are preserved. Replacing their shared foundations or rebuilding every page would duplicate reviewed work and consume build capacity without a demonstrated benefit.

The inherited dashboard includes charcoal/orange foundations, grouped navigation with all 22 destinations, an accessible mobile drawer, safe-area bottom navigation, local service search, order validation and wallet contribution review, money-page hierarchy, transaction dialogs, account/workspace pages, loading/error recovery and shared balance updates.

Previous route inventory, mobile/desktop before/after screenshots and measured performance are in [the dashboard audit](../../performance/dashboard-20261015/report.md) and [its validation](../../performance/dashboard-20261015/validation.md). These are inherited evidence, not new measurements from this change.

## Incremental implementation

The shared customer header and display-preference provider change in this pass. Its custom currency popup advertised menu behavior but had no menu roles, selection state, arrow-key handling or focus restoration. A labelled native select provides browser keyboard and touch behavior, selected-value semantics and a description explaining that the wallet ledger and payments remain INR. It uses the existing currency options and persistence. A compact code remains visible on narrow phones, with native keyboard/touch selection and accessible currency names.

The removed popup also removes local open state, memoization and two window event listeners. This is a source-level simplification; no speed improvement is claimed. No dependency was installed.

The added browser regression exercises keyboard selection, persisted preference, reload, return to INR and header layout at all ten requested widths. It deliberately holds the automatic display-currency response until after the customer selects USD, then releases an INR response: the manual selection must remain USD, including after reload. This exposed an existing race in the display provider; a ref now records manual selection so delayed or queued automatic detection cannot overwrite it. Exchange rates and monetary calculations are untouched. Existing read-only route and payment fixtures are reused. Automatic Vercel deployments are disabled for this branch.

Exact application files changed: components/dashboard/DashboardHeaderBar.tsx and lib/currency/use-currency.ts. Every authenticated customer destination inherits the header improvement; the provider also preserves display preferences on public pages. No individual route page or financial handler changes in this increment.

## Business integrity and release limits

No auth, backend, database migration, RLS, order creation, price, quantity, wallet balance/deduction, payment method, checkout, webhook, invoice, refund, refill or analytics implementation changes. No production orders or payments are used for verification.

Native picker appearance varies by operating system. Physical Android/iPhone keyboard/safe-area behavior, live data completeness and gateway settlement require owner-approved release verification. Field p75 LCP/INP/CLS targets are not certified by localhost fixtures. Keep the pull request draft; no merge or production deployment without explicit approval.

## Current validation

- Unit tests: 225 passed.
- Payment-confidence tests: 14 passed.
- Focused header lint: passed.
- TypeScript: passed.
- Production build: passed on the corrected application code; existing unrelated lint warnings remain.
- Initial candidate fixture browser run: 29 passed (6.9 minutes), including 360 layouts across 36 routes and all ten requested widths. No document overflow or clipped tested headings/controls. Internal overflow diagnostics are retained in [the raw results](responsive-results.json); these include decorative content and are not whole-site accessibility certification.
- The initial candidate screenshot exposed duplicate narrow-phone currency text; this was corrected by removing the overlay. The final focused browser run and full smoke outcomes are recorded below when complete.

### Local performance observations

The initial candidate route matrix measured these single unthrottled Chromium fixture navigations. The final change only removes the currency overlay and narrows its select; these samples precede that correction. No causal speed improvement, production percentile or INP claim is made.

| Route | Width | LCP ms | CLS |
| --- | ---: | ---: | ---: |
| Overview | 390 | 1344 | 0 |
| New Order | 390 | 608 | 0 |
| Wallet | 390 | 348 | 0 |
| Overview | 1440 | 1612 | 0 |
| New Order | 1440 | 548 | 0 |
| Wallet | 1440 | 788 | 0 |

The first build passed, but a subsequent interrupted build left no prerender manifest and its smoke server could not start. That diagnostic attempt is not counted as a passing run. A clean final rebuild completed before the full smoke and final focused runs.


## Full smoke and final correction

The standard smoke suite passed: **262 passed, 67 opt-in skips (10.6 minutes)**. That run precedes the final automatic-detection guard. The first post-visual-correction focused run passed eight cases but failed preference persistence on reload, exposing the automatic-detection race described above. Its failed assertion is retained and strengthened with a deliberately delayed response. It is not reported as a passing run. Final focused results follow after the verified build.

## Final verified application

- Final production build: passed, including type validation; existing unrelated lint warnings remain.
- Latest unit suite: 225 passed. Dashboard contracts: 32 passed. Payment-confidence: 14 passed (these suites overlap). Focused lint: clean.
- Final focused Chromium run: **9 passed (2.9 minutes)**. Includes deliberately delayed automatic detection, manual currency choice and reload persistence, all ten header widths, both drawer journeys, pending Billing details/focus, mocked funding still pending, funding visibility at all ten widths, and exact wallet splits for balances 0/200/100000. No real financial write.
- Reviewed final screenshots: [320px](currency-header-320.png), [390px](currency-header-390.png), [1440px](currency-header-1440.png). Fixtures are synthetic.
- Full smoke: 262 passed / 67 opt-in skipped on the immediately preceding application before the final display-only race guard. It was not repeated after the guard; final focused tests cover that correction. Latest-head CI remains a release gate.
- The 360-route-layout matrix predates the final currency-only correction; the final header is separately verified at all ten widths. No whole-site contrast, physical-device, multi-engine, production settlement or field-performance certification is claimed.

No main merge or production deployment. Automatic Vercel deployment is disabled for this feature branch. Keep draft for owner review.
