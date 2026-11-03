> **Current payment strategy:** wallet + manual UPI/bank transfer and conditional USDT TRC20 only. Razorpay/Cashfree are retired and their sandbox/configuration work is Not Applicable. Do not reintroduce gateways through Phase 2.

# SocialRUSH growth Phase 2 — implementation specification

Prepared 22 October 2026. **Planning artifact only. No Phase 2 feature implementation, migration, experiment, branch, PR or deployment is authorized by this document.** Future implementation belongs in separately reviewed growth work after the financial gates pass. This is distinct from the older presentation project documented in `docs/premium-phase2-design.md`; do not overwrite that history or assume its delivery status.

## Business objective and measurement

Scale toward **₹10,00,000 monthly refund-adjusted recognized service revenue**, subject to finance approval of the recognition policy. Wallet deposits are funding, not revenue. Current baseline, supplier-cost coverage and attainable demand are unknown; this is a target, not a forecast or profit claim.

Illustrative monthly arithmetic: at net recognized AOV ₹500, the target requires 2,000 orders; at ₹1,000, 1,000 orders; at ₹2,000, 500 orders. These are scenarios, not validated prices, package recommendations or acquisition forecasts. Track contribution only with verified costs and mature refund cohorts. Prioritize trustworthy mobile service discovery and checkout, explicit packages/agency offers, SEO intent alignment and repeat-customer retention.

## Product outcome and prerequisites

Improve qualified service discovery, mobile checkout completion, earned order value and repeat purchase while keeping price, payment, fulfilment and refund claims verifiable. Establish a measured baseline first; no conversion uplift, revenue target or profitability improvement is promised. Browser funnel events are diagnostic, not accounting records.

Prerequisites before implementation affecting purchases: Phase 1.3 mandatory financial gates passed, approved staging accounts and supplier-cost evidence, agreed cancellation/refill/partial-delivery policy, reliable catalog availability, and a reviewed financial reporting baseline. Presentation-only work may be designed in parallel, but must not conceal unavailable services or imply a successful payment.

Preserve current routes, canonical ownership, session/role checks, historical order prices, UPI/manual funding workflows, wallet idempotency, atomic refunds, gateway retirement controls and unknown-cost handling. Reuse existing dark/orange tokens and shared components. Do not introduce a second client-side price source, an alternative ledger or direct browser financial writes.

## Work packages and acceptance

| ID / priority | Deliverable and implementation boundary | Acceptance / measurable outcome |
|---|---|---|
| G2-01 / P1 | Premium service-page template with current availability, rate/quantity limits, deliverable, expected timing, evidence-backed quality/refill terms, requirements, contextual FAQs and order entry. Start from `components/marketing/services/PremiumCatalogServiceLanding.tsx`, `ServiceOrderCard.tsx`, live catalog helpers and existing service routes. | Active and unavailable states share the same catalog guard. Missing facts display unavailable/unknown. No fake reviews, popularity, savings or guarantees. Valid quantity/link carries to server quote; keyboard/mobile CTA works without obscuring copy. Measure eligible landing → valid quote rate. |
| G2-02 / P1 | Mobile-first review and checkout: clear service/quantity/link, fixed INR charge, displayed local currency label, wallet/external split, quote expiry, validation and recoverable pending/error states. Reuse existing dashboard order-summary/new-order and wallet flows. | At 320/390/768/1440px all amounts/controls readable, visible labels, 44px primary targets, focus restored after dialogs, no horizontal clipping, usable at 200% zoom. One idempotency key survives retry; changed payload requires new quote. Pending verification never looks paid. Measure quote → confirmed legitimate order, split by payment flow. |
| G2-03 / P2 | Higher AOV through user-selected quantity ladders, compatible optional add-ons and a comparison of deliverables. Recommendations use server-approved rules and verified service compatibility. | No preselected paid add-ons or forced bundles. Total and every component price shown before confirmation. Discount reference is current and evidenced; unavailable cost prevents margin-based promotion. Reconcile AOV to recognized-order cohort; monitor order conversion, refunds and support workload. |
| G2-04 / P2 | Bundles and agency packages: explicit component services, quantities, destinations, delivery/refill terms, one-time versus recurring terms, client/campaign attribution and cost coverage. Reuse `lib/cro`, existing packages, agency clients/campaigns and reseller surfaces after reviewing current capabilities. | Each component is orderable and quoted server-side. A changed/inactive component invalidates the quote. Entire bundle reservation/order creation must be transactional; do not loop independent checkout RPCs and call it atomic. Define and test partial fulfilment/cancellation allocation before launch. No recurring billing without separate consent and implementation scope. |
| G2-05 / P1 | SEO conversion improvements: strengthen existing canonical money pages, focused FAQs, intent-matched internal links, guide-to-service handoff, clear titles/descriptions and crawlable unavailable states. Use existing metadata/ownership/authority helpers. | Preserve canonical URLs, sitemap integrity and one primary page per intent. Structured data contains only verified visible facts; price/availability agree with the source. No duplicate near-identical geographic pages or unsupported promises. Measure qualified organic landing → quote/order alongside search CTR; distinguish search traffic changes from checkout effects. |
| G2-06 / P2 | Retention: explicit save/reorder, eligible refill guidance, recent-order tracking, customer-controlled campaign reminders and agency saved destinations. Prefer existing in-app surfaces first. | Reorder revalidates current price/service and obtains confirmation; never silently repeats a charge. No password collection or automatic external fulfilment. Reminder preferences respect consent/suppression/frequency rules; channels beyond existing integrations require separate scope. Measure 30/60-day repeat-customer cohorts and support/refund guardrails, not only clicks. |
| G2-07 / P1 | Revenue analytics: connect acquisition/quote/order cohorts to completion-based earned revenue and linked refunds; show missing recognition/cost coverage and reporting completeness. Extend existing `lib/analytics/financial-report.ts` / admin reporting rather than browser-derived money totals. | Deposits/reservations excluded from earnings. Net can be negative; dates use explicit IST boundaries. Verified supplier costs only; unknown margin remains null. Admin access and cross-customer isolation tested. Export totals match server reports, including >1,000 rows, refunds in later periods and duplicate event IDs. |

## Journey and state contract

1. Visitor selects an available service and valid quantity/public destination. Server resolves the live service, limits, eligibility and approved discount; it returns an expiring immutable quote/intent. A display-currency change never changes the INR ledger amount.
2. Review shows the complete deliverable, destination, all components, charge, wallet application and external balance. User can revise before committing. Link/payment errors retain safe entered data without storing secrets.
3. Wallet-only confirmation uses the existing atomic guarded deduction. Manual split creates order, reference claim, wallet effect and intent completion together. An external manual payment path follows the approved funding contract; UI success derives from verified backend state, not redirect arrival.
4. Network timeout shows pending/retry with the same request identity. Idempotent retry returns the existing legitimate order; mismatched request content cannot create another charge. No aggressive automatic retries of external operations.
5. Confirmation/tracking separates received, verification pending, processing, completed, failed and refunded states. Refund status comes from durable backend/audit state. Repeat/refill actions are explicit and use current eligibility.

For a future bundle, define before coding: parent quote ID, immutable component snapshots, per-component money allocation/rounding, total equality, reservation/order transaction, partial-delivery state, refund allocation and retained accounting evidence. This requires its own financial design review and migration plan. Existing Phase 1.1 ledger keys and state transitions cannot be bypassed by a growth feature.

## Data, pricing and analytics contracts

| Contract | Required meaning |
|---|---|
| Catalog / quote | Existing persisted service identity and approved rules are authoritative. Quote includes request/intent ID, currency, quantity, destination, immutable charge, expiry and attributable client/campaign. No hardcoded supplier margin or client-supplied total accepted. |
| Bundle / agency pricing | Versioned server definitions; item allocations sum exactly to charged total in minor units. Cost verification, discount provenance, scope and cancellation rules recorded. Do not retrofit historical order prices. |
| Experiment | Assignment ID/version and consent-aware pseudonymous visitor/session; never use experiment assignment for authorization, pricing privilege or financial idempotency. Persist server-approved quote rule version where relevant. |
| Funnel event | Unique event ID, event name/version, timestamp, route/service, pseudonymous session, optional intent/order ID and experiment version. No raw email, public destination URL, provider payload or payment secret. Deduplicate at ingestion. |
| Financial event source | Backend confirmed orders/refunds, completion timestamps and verified costs. A browser event named `payment_success` is not a recognized sale. Report completeness/failure explicitly, never a partial total presented as complete. |

Proposed diagnostic event names: `service_viewed`, `service_unavailable`, `quote_requested`, `quote_created`, `quote_rejected`, `checkout_reviewed`, `checkout_submitted`, `order_confirmed`, `verification_pending`, `checkout_failed`, `reorder_requested`. Emit confirmed order state from trusted server transitions; do not double-count browser and server emissions. Extend existing analytics primitives after reviewing consent and retention. No new data collection is implemented here.

Metric definitions for finance/product approval:

- **Eligible landing conversion:** distinct sessions obtaining a valid server quote / distinct eligible service landing sessions. Exclude bot/QA traffic through a documented rule; do not silently redefine eligibility after an experiment starts.
- **Checkout completion:** distinct legitimate backend orders with the agreed verified-paid state / distinct submitted quote intents, cohort by intent creation date and separate manual-pending lag. Report same-day and matured cohorts; do not treat pending receipts as failures or sales.
- **Recognized AOV:** recognized gross service revenue / distinct orders recognized in the same period. Report linked refund-adjusted net and refund rate separately. Wallet deposit size is not AOV; report bundle-parent versus component denominators explicitly.
- **Contribution margin:** recognized net service revenue minus verified supplier costs and only separately evidenced fee/cost categories. If any required cost coverage is missing, report unavailable and its coverage percentage, not estimated profit. Keep this distinct from operating profit.
- **Repeat purchase:** customers with a subsequent legitimate paid order within 30/60 days / eligible customers with a full follow-up window after first paid order. Provide a recognized-revenue cohort view separately; avoid mixing maturity, fulfilment or cancellation rules.
- **Organic conversion:** attributed organic landing cohort reaching a legitimate order, with attribution window and missing-consent/unknown-source category. Search-console CTR and browser conversion use different populations and should not be multiplied without a justified model.

## Delivery sequence and review units

1. **Contract/baseline review:** catalog parity, financial gate results, quote/refund/business policies, metric definitions, missing data and sample sizes. Produce a baseline artifact from approved data only; do not invent an uplift target.
2. **Service template and SEO handoff:** G2-01/G2-05 with existing service routes and availability guards. Capture desktop/mobile evidence and check indexing metadata. Reuse patterns rather than copying one page per service.
3. **Checkout usability:** G2-02 with separate wallet/manual/manual/USDT pending journeys. Validate real staging Auth/API/DB state and retry invariants before measuring conversion.
4. **AOV/bundle design and implementation:** G2-03/G2-04 only after allocation/atomicity/cancellation review and verified costs. Prototype comparison UI first; money logic ships in a separately reviewed unit with backward-compatible migrations where needed.
5. **Retention and analytics:** G2-06/G2-07 with consent, cohort maturity, no-repeat-charge protection and reconciled reporting. Link funnel diagnostics to backend truth rather than replacing accounting.

Each unit needs a scope-specific design/QA review and its own future change request. This document does not create those branches or PRs. Do not bundle unrelated Phase 2 code into financial PR #702.

## QA and release acceptance

- Unit/contract tests for availability, quote/discount/rounding/expiry, bundle allocation, cohort definitions and idempotent analytics ingestion. Avoid tests that only match arbitrary class names or duplicate implementation.
- Native/PostgREST concurrency tests for repeated checkout and multi-item reservation failure; injected order/ledger failures must roll back all financial effects. Wallet refund retry never credits twice; retired gateways cannot be invoked.
- Real staging roles: anonymous/A/B/admin permission matrix, cross-owner ID attempts, browser key exposure checks and server-only credentials. New tables require reviewed grants and RLS; do not copy broad authenticated policies.
- Browser desktop/mobile/keyboard/reduced-motion/zoom journeys: discovery → quote → review → wallet/manual pending → order → refund/history → export → explicit reorder. Include slow network, expired session/intent, unavailable catalog, insufficient balance and unknown provider outcome.
- SEO checks for canonicals, indexability, redirects, sitemap, structured data, internal links and rendered price consistency. Compare bundle/service pages against server catalog state.
- Performance measurements on the same device/network/build methodology before/after; collect field data when available. Agree a budget after baseline; no unmeasured performance claim or fabricated lab comparison.
- Full TypeScript, lint, production build, relevant tests and exact-head CI. Clear all mandatory financial staging gates; fixture screenshots alone are insufficient for money flows.

## Experiment and rollback plan

Use explicit default-off controls for new journeys/pricing rules, reviewed assignment and an eligible baseline cohort. Define the primary metric, minimum mature sample, observation window and stopping rule before exposure. Do not ship a permanent winner based on one day or overlapping cohorts.

Stop exposure on any duplicate charge/refund, negative balance, unauthorized access, price/quote mismatch, incorrect paid/pending label or unreconciled financial total. Refund/support/margin guardrails must be compared against the agreed baseline, not a fabricated universal threshold. Conversion improvement cannot override a financial failure.

Presentation rollback restores the prior route components while preserving intents/orders. Disable new offers, keep existing quoted obligations/history valid, and retain ledger/audit/event evidence. New money-affecting rules need backward-compatible readers and a forward-fix plan; do not roll back to pre-atomic financial handlers or remove populated financial tables.

Open decisions before implementation: service priority and approved copy evidence; pricing/discount ownership; bundle allocation and partial-refund policy; agency recurrence versus one-time purchase; acquisition attribution/consent; verified supplier cost/fee coverage; baseline and experiment budgets; staging/runtime approval. No Phase 2 implementation or financial rollout should be inferred from this specification.
