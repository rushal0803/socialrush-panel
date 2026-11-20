# SocialRUSH 3.0 — Phase 0 audit and financial integrity proposal

Audit date: **15 November 2026, Asia/Calcutta**. **Release decision: HOLD.**

This is a fresh, bounded Phase 0 review plus an isolated arithmetic repair. It is not a completed authenticated audit, a production readiness certificate, or a forecast of ₹5 lakh profit. No production writes, auth changes, payment calls, indexing requests, emails, merges or deployments were performed. Existing PRs were left unchanged.

## 1. Verified project and release state

| Item | Fresh observation |
|---|---|
| Repository | `rushal0803/socialrush-panel`; public; default branch `main` |
| Base | `35fcaf731447a948b69a9ae917b5af596d22711e` |
| PR #760 | OPEN, DRAFT, unmerged; base `main`; 36 commits, 155 changed files |
| Current #760 head | `04affabe4287cfa79eab6696ec53825c94714227`, branch `fix/seo-release-blockers-20261110` |
| Supplied historical candidate | `bd5a066ac4c96ba0003483b16da048a2465f58e4` is no longer the head. Historical results are not current QA proof. |
| Additional auth work | Draft #761, head `b07b484a3d24dd84f4047708d563e176efc9aaf2`, targets #760's branch; not included in #760 |
| Required CI | Both named GitHub Actions contexts succeeded at current #760 head. Two sets correspond to PR contexts; see evidence.json URLs. Optional performance jobs and comparison were SKIPPED. |
| Protection | Ruleset 26923348 active; no bypass actors; two required checks; PR and thread resolution required. Zero required approving reviews and non-strict up-to-date policy are current settings. No settings changed. Effective-branch-rule endpoint was unavailable through the connector; default-branch metadata plus ruleset condition `~DEFAULT_BRANCH` were inspected. |
| Exact #760 preview | `dpl_8gEqJvo2wYkSsATH4ser5bGrUZiZ`, READY, source `04affabe...`, `socialrush-panel-p5u2p63yp-rushalthakur240-6255s-projects.vercel.app` |
| Production deployment record | `dpl_CxsGCeYtp8AoBsMjYAvpgWCrtKMC`, READY, `main` source `35fcaf7...`; separate from previews |
| Technology | Source package.json specifies **Next.js 15.5.26 / React 19.2.8**, not the brief's Next.js 14. Vercel project Node version 24.x. |

### Isolation gate

Read-only Supabase inventory confirms dedicated QA project `imcysruvfjsexdppxcwc` ACTIVE_HEALTHY; old preview `gtlztholtjhafhvknnku` INACTIVE; historical production reference `valclbfoassmfyixwnyv` ACTIVE_HEALTHY. No database query, credential retrieval or project change was made.

Vercel metadata lists **19 branch-specific Preview overrides** on #760's branch, including Supabase URL/key/service-role, DATABASE_URL and payment/notification/provider settings. `decrypt=false` was used. Variable names/scope are evidence; comments and masked values do not establish effective values, safe provider mode, or immutable-deployment runtime identity. A new branch does **not** inherit another branch's overrides.

Unauthenticated HEAD of the exact preview redirects **302 to Vercel SSO**. No bypass/share link was created. Client + server + direct DB identity, synthetic-account ownership, disabled fulfillment, payment mode and notification/cron isolation remain **BLOCKED**. Existing PR attestations are historical/owner-reported, not fresh independent PASS.

The new proposal uses a **separate worktree and branch from verified main**, with no copied .env or credentials. Tests import only pure local arithmetic and use invented records in memory. They run with an empty environment except PATH. This proves the narrow backend-free test scope; it does not certify the application preview. Automatic Vercel deployment is disabled for this new branch in vercel.json before publication. No new preview is required for this proposal.

## 2. Current-state technical and business audit

Evidence was gathered from exact candidate source, repository/release APIs, masked Vercel metadata, Supabase project inventory, public HTTP GETs and bounded public browser captures. App/admin files changed below are identical on main and #760 before this proposal. No production customer records or financial ledgers were accessed.

| Area | Existing capability and observed limitation |
|---|---|
| Homepage | Existing black/orange premium hero, service categories, live-price cards, process explanation, FAQs, policy links, sample workspace and reviews section. Public HTML explicitly labels workspace sample data; reviews section reports no published customer reviews. Do not replace this with fabricated testimonials. Many discovery/CTA sections repeat; test consolidation after baseline measurement. |
| Service pages | Quantity selection, public destination fields, totals, delivery/refill details, related guides already exist. Public followers page shows ₹999.90/1K, 100 units ₹99.99 and no refill. Likes shows ₹249/1K, 100 units ₹24.90. These are timestamped observations, not proposed pricing changes or fulfillment verification. |
| Customer workspace | Existing order creation/history/tracking, balance, add-funds, billing/transaction detail, account, support, saved profiles, repeat campaigns and reseller planners. Route existence is verified; authenticated execution, invoice completeness, accessibility and real payment behavior are unverified. |
| Admin | Existing analytics/revenue, CRM customers/leads/pipeline/replies/automation health, order controls, payments, SEO/growth workspaces. Extend these instead of creating parallel dashboards. |
| Reporting | Existing goal engine explicitly targets ₹500,000 **revenue**. It cannot demonstrate the requested **net profit**. Existing revenue dashboard accepts paid orders and refunds but not fulfillment, fees, tax or operating costs. |
| Auth | Server `getUser` checks and profile-role admin gate exist. #760 handles code/token-hash recovery; #761 adds implicit-fragment recovery work. Provider configuration and real Google/email/recovery flows remain blocked. |
| Checkout | Intent/order routes exist; wallet RPC can mutate balances/create orders. Legacy Cashfree order POST normalizes a method but does not call the shared `isPaymentMethodEnabled` guard before calling `/orders`. All external top-up methods are disabled in the shared flags. Runtime exploitability/configuration is unknown; no endpoint was invoked. |
| Analytics | #760 contains host/environment guards in browser events, collection API and trusted server writer. Local tests pass; deployed exclusion and third-party analytics are not independently verified. Funnel reliability currently uses monotonic aggregate counts, which cannot prove same-user ordering. |
| CRM | Existing consent/contact-basis types, suppression, opt-out, retry/delivery contracts and automation workspaces. Draft #718–#720 contain additional CRM work; do not replay them blindly or enable sends. Full runtime/audit-log inspection remains pending. |
| Security | Supabase config separates service-role creation into server-only code; admin API helper checks authenticated profile role. Exhaustive API authorization, live RLS, grants, profile-role write restrictions, rate limits and secrets audit have not been completed. No RLS PASS is claimed. |

### Public SEO and competitor observations

Homepage, `/buy-instagram-followers-india`, `/instagram-likes`, robots.txt and sitemap.xml returned HTTP 200. Sample pages have self-referencing canonical and index/follow metadata with distinct titles. This does not establish index coverage, Google-selected canonicals, valid rich-result eligibility or ranking performance. No indexing request was made.

Followers copy states no refill and carries a “Fast Delivery” badge; replace subjective speed language only after delivery-data review. Likes copy explicitly warns that artificial engagement can breach platform rules and that INR billing does not imply India-only engagement. Retain such limitations. Delivery estimates and refill eligibility need provider evidence, not copy inference.

`digispeed.in` returned HTTP 200 and currently positions around digital marketing, SEO, ads, web development and training. Its observable service grouping and inquiry-oriented positioning support testing legitimate strategy/analytics offers. No competitor revenue, conversion, ranking superiority or service authenticity was verified; do not copy its design/content.

**Connected GSC/GA4 baseline unavailable:** GSC Wizard refused access with `subscription_required`. No paid service was enabled. Provide first-party exports or restore access for ranking, traffic, CWV and attribution analysis. Public retrieval is not a substitute for analytics.

## 3. Prioritized issue register

Severity is potential harm; priority includes uncertainty and dependency. Effort is an initial estimate, not a delivery promise.

| ID | Severity / priority | Evidence and user/business impact | Complexity / recommended action |
|---|---|---|---|
| SR-01 | Critical / P0 | Preview runtime backend/worker/payment identity unverified; authenticated test could touch live records or providers. Metadata is insufficient. | M; obtain read-only deployment-specific identity evidence, verify QA-only fixtures and all server-side side effects before interaction. Keep checkout BLOCKED. |
| SR-02 | High / P0 | Cashfree legacy POST lacks shared disabled-method guard at #760 and main; potential external order creation despite disabled UI flags. | M; separately review server-side fail-closed guard and all legacy create/status/webhook paths using stubbed providers; never probe production. |
| SR-03 | High / P0 | Auth recovery fixes split across #760/#761; no fresh real-provider evidence. Users may fail recovery/login. | M; review #761 independently, test code/token-hash/fragment, expired/replayed links, redirects and real session behavior at both viewports. |
| SR-04 | High / P1 | Synthetic refund-only day: gross 0, refunds 100, displayed net 0; main and #760 use Math.max(0,...). Understates losses. | S; **fixed in this draft** in daily and aggregate arithmetic. Negative balances retained; no ledger change. |
| SR-05 | High / P1 | Revenue engine target is ₹5 lakh revenue; no complete cost/tax waterfall in inspected dashboard. May drive unprofitable scaling. | M/L; offline model supplied, full financial dashboard remains specification pending reconciliation. |
| SR-06 | High / P1 | Monotonic event counts set funnelTrackingReliable. Different populations can decrease without a real conversion path. | M; ordered session/customer cohorts and attribution coverage; keep diagnostic label until fixed. No experimental uplift claimed. |
| SR-07 | Medium / P1 | Pricing/hydration fixes exist on candidate, absent new hosted evidence. A correct static total cannot verify slow-load selection persistence. | M; exact-SHA 390/1440 slow-load quantity and authoritative intent tests, after SR-01. |
| SR-08 | Medium / P1 | GSC subscription blocks connected baseline; no RUM evidence. SEO/performance prioritization lacks measurement. | S/M; read-only exports, settled date ranges, p75 device cohorts and lab profiling. No invented baseline. |
| SR-09 | Medium / P2 | Public homepage contains repeated discovery/CTA/value sections; possible scanning burden. Conversion impact unproven. | M; preserve branding; compare a shorter hierarchy in an isolated prototype with task completion tests. |
| SR-10 | Medium / P1 | Service speed/refill claims require evidence; artificial engagement entails platform and consumer-risk exposure. | M; catalog claim register and legal/platform review; prioritize legitimate content/strategy/analytics offers. |

## 4. Premium UI/UX specification and page architecture

Retain existing SocialRUSH identity and reusable components: tailwind.config.ts, globals.css, marketing/PremiumSystem.module.css, PremiumHomeHero, PremiumHomepage, dashboard/PremiumWorkspace.module.css, dashboard/Ui and admin/AdminUI. Consolidate tokens rather than add an independent visual framework.

Design rules: existing near-black surfaces and orange actions; semantic surface/text/border tokens; 4/8px spacing rhythm; 16px minimum body text where practical; 44px preferred touch targets; visible keyboard focus; persistent labels and described validation; WCAG AA contrast (4.5:1 normal text, 3:1 large text/UI); reduced-motion support. Use motion only for understandable state changes. Test 320px stress plus mandatory 390/1440px, 200% zoom and keyboard operation. Contrast and screen-reader compliance are acceptance targets, not current PASS claims.

**Homepage recommended order:** concise hero with one primary service-discovery CTA → searchable platform/service grid → catalog-backed featured choices → three-step order explanation → concise price/terms/support proof → genuine completed-order reviews only when published → useful FAQ/policy links → one final CTA. Label mockups as sample views. Feature services only after contribution, complaint/refund and demand evidence; revenue rank alone is insufficient. Keep high-value educational/internal links, remove repetition only after review.

**Service page recommended order:** unique title and limitations → quantity + correct destination field → persistent summary with integer quantity, rate unit, currency and authoritative total → verified delivery/refill conditions → review CTA → eligibility/refund/cancellation explanation → genuinely relevant FAQ/guides/services. Preserve typed input through slow hydration and login. Validate public destination type client/server; never request platform passwords. Reject stale/forged prices server-side and show a fresh review prompt. Announce summary changes accessibly without moving focus. Sticky mobile CTA must not cover inputs, messages or policy links.

**Workspace:** retain existing navigation; make active/pending/failed/refill states distinct; put order tracking/support/repeat action alongside each order; show wallet liability separately from earned revenue; define invoice requirements with accounting/legal owner. Empty/error states must offer a useful next step and avoid internal migration instructions for customers.

## 5. Conversion optimization plan

Instrument a consent-aware ordered journey: eligible landing → service selection → valid details → auth completion → server-calculated review → payment accepted → verified paid order → fulfillment. Link pseudonymous sessions to accounts only under the applicable privacy basis. Never send destination URLs, email, payment reference, tokens or customer identifiers to general analytics. Use trusted idempotent server events for financial outcomes and exclude all engineering environments before collection.

Experiments (no experiment started):

| Hypothesis | Primary metric | Guardrails / rollback |
|---|---|---|
| Preserving quantity/link through auth reduces loss | Unique valid-review-to-paid-order conversion | Price/quantity mismatch or input loss: stop immediately |
| Shorter discovery hierarchy speeds service choice | Task success and landing-to-valid-review rate | Accessibility failure, support contacts or error increase: revert variant |
| Clear payment status distinguishes submitted from paid | Verified payment-to-order completion | Duplicate orders, incorrect paid state, reconciliation drift: disable variant |

Register owner, exact SHA, audience/assignment unit, exclusion rules, hypothesis, baseline, absolute MDE, sample plan, start/end, immutable metrics, outcome and rollback. Example only: baseline 2% buyer conversion, detecting 2.0%→2.5%, two-sided α=.05, 80% power requires roughly **13,800 eligible visitors per arm** under an independent two-proportion approximation; recompute with actual baseline and clustered-user assumptions. With low traffic use task-based usability and funnel diagnostics first. Do not repeatedly peek and declare a winner. Judge revenue experiments using contribution per eligible visitor and refund/support guardrails, not AOV alone.

## 6. ₹5 lakh monthly net-profit model

**Business facts available:** user reports revenue below ₹50,000/month. This is an unverified upper bound, not ledger evidence. Actual order volume, AOV, margins, fulfillment cost, fees, refunds, CAC, retention, operating costs and tax are unavailable. Hardcoded historical baselines in revenue-audit.ts are not accepted as current verified business metrics.

Definitions: earned revenue excludes indirect tax, wallet deposits, unpaid transactions and unfulfilled/unearned amounts under an accountant-approved recognition policy. Refunds reduce earned revenue once; chargeback losses exclude amounts already refunded. Wallet spend may fund an earned order, but the deposit itself is a liability. Do not double count deposit + order. Reconcile payment settlements, wallet ledger, earned orders and refunds separately.

Waterfall: earned revenue − refunds = net revenue; − fulfillment cost = gross profit; − processing fees, incremental support, non-duplicated chargebacks and acquisition spend = contribution profit; − fixed operations and depreciation = operating profit; − interest = pretax profit; − applicable income tax = net profit. GST/tax collection is not income; tax treatment/rates require professional verification. Unknown costs produce **INCOMPLETE**, not zero expenses. Negative results remain negative.

All rows below are **assumptions-based target arithmetic**, using ₹500 **net revenue per order**, 1.5 orders per paying customer/month and 2% qualified-visitor-to-unique-paying-customer conversion. Margins include all costs and income tax. Gross charged AOV cannot replace net revenue/order without refund/tax reconciliation.

| Final net margin | Required monthly net revenue | Orders | Paying customers | Repeat orders | Qualified visitors |
|---|---:|---:|---:|---:|---:|
| 20% | ₹25,00,000 | 5,000 | 3,334 | 1,666 | 1,66,700 |
| 30% | ₹16,66,667 | 3,334 | 2,223 | 1,111 | 1,11,150 |
| 40% | ₹12,50,000 | 2,500 | 1,667 | 833 | 83,350 |
| 50% | ₹10,00,000 | 2,000 | 1,334 | 666 | 66,700 |

Revenue = target profit / final net margin; orders = ceil(revenue / net revenue per order); customers = ceil(orders / orders per customer); repeat orders = orders − customers; visitors = ceil(customers / buyer conversion). Repeat-order counts do not determine the percentage of customers who repurchase or cohort retention. Rounded quantities create slight buffer.

Sensitivity at 30% margin: ₹250/₹500/₹1,000 net revenue per order requires 6,667/3,334/1,667 orders. With the base ₹500 assumption, 1%/2%/3% buyer conversion requires 2,22,300/1,11,150/74,100 visitors. These do not prove margins can be sustained. Compared with the user's <₹50,000 bound, required revenue is more than 20–50×; the time needed cannot be forecast from available evidence.

Bottom-up example, also unverified: net revenue ₹20L; fulfillment 40% ₹8L; processing 2% ₹40k; chargebacks 1% ₹20k; variable support 2% ₹40k; marketing 10% ₹2L; fixed ops ₹1.5L; depreciation ₹10k; interest ₹10k → pretax ₹7.3L. Illustrative 25% income tax → net ₹5.475L (27.375%). Tax is an assumption, not advice. Do not extrapolate this cost mix without invoices and a feasible capacity plan.

CAC = acquisition spend / new paying customers. If a verified customer yields ₹300 expected contribution before acquisition cost during an approved payback window, ₹300 is the break-even CAC before fixed overhead; the operating ceiling must be lower. Establish actual contribution, refund reserves and cohort repeat behavior before buying traffic.

Run `node scripts/profit-scenario-model.mjs` or add `--csv`. Import `profitWaterfall` with accountant-reconciled aggregate inputs; the script has no backend integration. Missing costs remain null. JSON and CSV snapshots accompany this report.

## 7. SEO and compliant acquisition roadmap

First get settled 28-day GSC page/query/device/country data against previous 28 days and year-over-year where available; record property/date/coverage limits. Pair with first-party landing sessions and verified orders without exposing customer data. Review top priority Instagram, YouTube, LinkedIn and Facebook URLs against actual demand, profitability and eligibility; do not mass-generate geo doorway pages.

Validate robots/sitemap URL ownership, status/redirect chains, canonical consistency, structured data against visible content, unique titles and helpful FAQs; inspect any conflicting route ownership in #760 before building more content. No FAQ rich-result promise or invented review schema. Prioritize title tests only where position and sample size support CTR diagnosis. Index inspection reads must be quota-aware; no submission/indexing request is authorized.

The platform-policy risk register must link current official terms for each offered platform, identify artificial engagement, removal/suspension risk and prohibited performance claims, and record legal/consumer disclosures and owner decisions. This review has not completed current platform-by-platform legal verification. Never create fake accounts or engagement automation. Develop scoped legitimate offers: profile audits, content calendars, analytics reporting, creative consulting and organic audience strategy. Pilot with opt-in customers and measure delivery hours, outcomes, refunds and contribution. Use original guides, own consenting case studies and transparent inquiry forms; no spam links or unauthorized outreach.

## 8. Customer retention and CRM plan

Extend existing lifecycle/CRM workspaces. Map each event to source-of-truth order status, recipient eligibility, template/version, consent basis, suppression state, idempotency key, attempt log and retention policy. Order confirmations and genuine status/support updates are transactional; marketing follow-ups require the applicable consent/legal basis and unsubscribe. Never represent queued or provider-accepted email as delivered.

Suggested lifecycle: account welcome → order confirmation → actual fulfillment transitions → support events → eligibility-checked refill assistance → neutral feedback request → consented reorder reminder. Do not promise refill where catalog says none or solicit only positive reviews. Inactivity/win-back is an analysis queue first; no live send enabled.

Safeguards: global opt-out checked immediately before send; per-user frequency cap (proposed marketing maximum one per 7 days, subject to approval); event/customer/template deduplication; bounded exponential retry; dead-letter queue; authenticated webhooks and replay protection; human review for refunds, disputes and ambiguous replies; least-privilege access. Test synthetic inboxes and stubbed providers only. Detailed email/inbound processing implementation must use the relevant email security skill before changes.

## 9. Admin 3.0 improvement specification

Extend `/admin/analytics` and existing revenue intelligence, payments, order controls, CRM automation health and SEO/growth pages. Add source/date coverage and reconciliation status to every metric. Costs require versioned service/provider cost snapshots and accounting period allocation; never overwrite historical costs with today's catalog prices.

Required cards: net revenue, gross/contribution/operating/net profit, refund value and rate, CAC, revenue/customer, service and channel contribution. Unknown values display “Unavailable / needs reconciliation,” not ₹0. Include previous equal-length settled periods and currency/timezone. Service/channel profit must show unattributed costs and reconcile to the total; label allocation assumptions. Separate cash collections, wallet liability, pending payments and earned revenue.

Operations queues: stale/pending fulfillment, payment/reference duplicates, failed reconciliation, pricing mismatches, refund disputes and support SLA. Show source link, responsible role, age, severity and next action. Require server-side authorization on every route/action, owner-based RLS, finance/admin permissions and append-only audit records. The inspected profile-role gate is a starting point; do not assume every endpoint is protected. No new paid services needed for the initial specification.

## 10. KPI scorecard and 30/60/90-day roadmap

| KPI | Definition / present baseline | Initial gate |
|---|---|---|
| Qualified organic traffic | Eligible organic landing sessions, bots/internal excluded; unavailable | Agree qualification and attribution; report weekly |
| Purchase conversion | Unique verified paying customers / eligible visitors; unavailable | Establish baseline + uncertainty before experiment |
| AOV | Earned pre-refund order revenue ex tax / recognized orders; unavailable | Track beside net revenue/order, margin and refunds |
| Gross margin | Gross profit / net revenue; unavailable | Cost coverage and revenue reconciliation required |
| Contribution margin | Contribution profit / net revenue; unavailable | Positive by promoted service/channel before scale |
| Net profit | Full reconciled waterfall after applicable tax; unavailable | ₹5L aspirational long-term goal; no 90-day promise |
| Repeat purchase | Cohort customers purchasing again within fixed window / eligible initial buyers; unavailable | Report 30/60/90-day cohorts and maturity |
| CAC | Acquisition spend / new paying customers, by channel; unavailable | Within verified contribution/payback ceiling |
| Refund rate | Completed earned-revenue refunds / comparable earned revenue; unavailable | Count/value and timing/cohort views; investigate regressions |
| CWV | Field p75 by device over applicable window; unavailable | LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 where practical |

**Days 0–30:** close isolation evidence gap; review auth #761 and Cashfree mismatch; run mandatory hosted QA; reconcile financial definitions and 90 days of aggregate records; inventory service claims and cost coverage; establish analytics/CWV baseline. Deliver narrowly scoped draft fixes and one brand-consistent homepage/service prototype. Owner roles: engineering/security, finance and product. Exit: no open critical safety defects, reproducible tests, known baseline quality. This is a gate, not assumed completion.

**Days 31–60:** implement approved design/accessibility changes in isolated preview; instrument ordered cohorts; run sufficiently powered experiments or usability tasks; refine priority content using GSC evidence; pilot legitimate strategy/analytics offerings; test CRM lifecycle against synthetic contacts. Exit: trustworthy event/finance reconciliation, no guardrail regressions, measurable service-level contribution.

**Days 61–90:** expand only proven acquisition/service combinations, review repeat cohorts and support capacity, introduce approved opt-in retention workflows, publish reconciled service/channel profit reporting. Update profit scenarios with actual costs and tax. If margins, acquisition or fulfillment fail the gates, reduce expansion and repair them. Sustained ₹5L net profit is a later milestone dependent on evidence, not a 90-day commitment.

## 11. Test and release verification

See test-release.csv for mandatory case status and reproduction. Fresh exact-head CI metadata is independent evidence only for CI scope; Vercel READY means built, not authenticated QA. Local tests cannot certify Google configuration, emails, hosted checkout, live RLS or field CWV.

Fresh local candidate baseline: 13/13 targeted analytics-guard, recovery-source, revenue-dashboard and revenue-engine tests pass. Recovery test inspects source strings; it is not a provider integration test. Fresh proposal suite: 16/16 arithmetic/revenue/scenario tests pass using synthetic in-memory data, including refunds and incomplete-cost handling. Typecheck results and browser capture scope are in verification.md. Full app build and full regression/security/accessibility/performance suites were not rerun for this narrowly scoped proposal.

Public browser captures are unauthenticated observations at 390 and 1440. Mutation/API/third-party requests were blocked; this changes runtime behavior and is not full functionality QA. The local Chromium certificate trust store did not accept the environment's public TLS chain; screenshot capture bypasses certificate validation only in that ephemeral public-only context. Public HTTP retrieval used normal certificate verification. No production security control was modified, and no TLS-health finding is inferred from the local browser issue. Screenshots require scroll reveal because existing offscreen animation hides sections before intersection.

Release gate: recheck base/head, current required checks and all open dependencies; independently establish exact preview client/server/database identity and synthetic fixture ownership; prove server-side payment/fulfillment/email/cron isolation; execute all mandatory mobile/desktop scenarios with timestamped network/server and screenshot evidence. Keep PRs draft; no merge or production deployment is authorized. Missing evidence remains BLOCKED.

## 12. Phase record, risks and rollback

Scope: Phase 0 audit + narrow refund-reporting repair + standalone assumptions-based profit model. Business rationale: prevent losses being hidden and prevent revenue targets being confused with profit. Files: this docs directory; scripts/profit-scenario-model.mjs; tests/unit/profit-scenario-model.test.mjs; revenue-dashboard regression test; lib/analytics/revenue-dashboard.ts; app/admin/analytics/page.tsx; vercel.json branch-specific deployment opt-out.

Risks: consumers may previously have assumed net revenue cannot be negative; chart display of negative values needs isolated authenticated visual QA. Chart ceiling remains nonnegative, but daily financial values remain signed. No historical records or current prices are changed. The model depends on supplied accounting definitions and is not an audited financial statement. Existing malformed charge data, incomplete rows/pagination, refund matching, revenue recognition, funnel cohort logic and other historical reporting defects are outside this patch.

Rollback before merge: close this draft/stop work; existing main/#760 remain unchanged. Future approved rollback: revert only this reviewed commit through a separate PR, preserving all financial records and unrelated work; record that arithmetic revert reintroduces loss suppression. Do not remove branch deployment opt-out while publishing this branch. Any app release, customer-facing automation, live business/process/payment/configuration change requires explicit owner approval under the brief.

Remaining: authenticated QA; current Google/email/recovery configuration; effective preview isolation; provider guard remediation; exact-SHA full regression; field and lab performance; exhaustive security/RLS review; financial reconciliation; data-backed feature ranking; implemented design/CRM/admin phases. No new application preview was produced because independently verified hosted isolation is unavailable.
