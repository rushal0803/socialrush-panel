# Conversion analytics and profit intelligence design

**Offline foundation, not a production data claim or enabled analytics change.** Under ₹50,000 monthly revenue is the user's stated starting point, not a validated extract. ₹5 lakh monthly net profit is a planning objective, not the legacy dashboard's ₹5 lakh revenue target.

## Existing capture audit

| Source | Finding | Consequence |
|---|---|---|
| lib/analytics/events.ts at #764 | Browser DNT check; session ID and page path; clipped arbitrary UTM/campaign fields; no explicit opt-in/GPC/internal gate in this branch | “Consent-aware” comment alone does not prove opt-in; optional capture needs a consent design before release |
| app/api/analytics/route.ts at #764 | Allowlisted client event names, JSON/rate limits, primitive metadata keys and session cookie; no consent/environment gate before DB access | DNT browser behavior does not secure the server endpoint; preview/custom domain/internal activity is not independently excluded |
| lib/analytics/server.ts | Trusted events after business commit, unique IDs and duplicate-index handling; attribution inherited from most recent sourced event | Stronger outcome provenance than browser totals, but no full consent/environment/history guarantee |
| #760 collection-environment.ts and guards | Excludes loopback/vercel hosts and preview/development runtime; absent from #764 ancestry | Preserve during integration, including early server suppression; does not replace explicit consent/internal/synthetic controls |
| payment_completed / wallet_topup_completed | Both may describe the same wallet funding operation | Neither is earned revenue or an independently paid service order; never sum wallet deposit and service spend as two sales |
| order_created | Direct UPI may be verification_pending | Do not classify order creation or UTR submission as verified payment |
| revenue-dashboard.ts | Verified revenue/refund/customer aggregates | Net revenue is not net profit; multi-order-in-window share is not longitudinal retention |
| revenue-goal-engine.ts / revenue-audit.ts | Revenue target and hard-coded Day 30 comparison constants | Constants require source/period provenance before business claims; no new report treats them as observed baselines or profit evidence |

The first-touch naming also needs validation: explicit later campaign parameters can overwrite stored attribution, and the server selects the latest sourced row. Do not promise first-touch accuracy or causal channel ROI without a reconciled attribution contract. Metadata-key allowlisting with arbitrary string values does not establish that a URL/email cannot enter an allowed field. The prototype instead retains only finite categorical values, never raw paths, UTM strings, public destination links, emails, tokens or payment references.

## Consent and exclusion contract

Before any future capture adapter: obtain affirmative optional-analytics consent; honor revocation, DNT and GPC; do not allocate optional session/campaign storage before consent. Bind server consent to a same-origin, signed/versioned consent record rather than trusting request-body `consent=true`. Unknown consent must drop events before cookies, auth lookups or analytics writes. Withdrawn consent clears optional identifiers and stops future capture; define retention/deletion and legal basis with the owner before wiring. Financial/operational records have a separate required accounting purpose and must not be deleted by analytics opt-out.

The production adapter must independently check deployment target and exact canonical host, trusted internal/account/test flags and synthetic order provenance. A query parameter alone cannot opt a session into production analytics. Engineering traffic goes to a distinct synthetic sink or is discarded; client markers cannot override server exclusion. Enforce the same policy before trusted analytics writes and again in the reporting ingestion. Production reports must fail on mixed datasets. QA, localhost, previews (including custom domains), staff activity and synthetic orders are excluded. Deliberate bot/abuse traffic additionally needs rate, trust and bot filtering; the pure prototype is not an anti-fraud boundary.

## Funnel definition

| Stage | Existing/future event | Authority |
|---|---|---|
| Landing | page_viewed | Consented browser; categorical page template |
| Discovery | service_selected | Deliberate selection; not every filter keystroke |
| Service | service_viewed | Actual detail exposure |
| Details | order_details_completed | Valid selection; no raw destination stored |
| Review | checkout_started | Authoritative review reached; not payment success |
| Optional auth | sign_up_completed / separately login_completed | Committed server result; already authenticated users skip |
| Verified paid order | future verified_order_paid | Reconciled order/payment fact after commit; server-only and exactly once per order |

The implemented sequential diagnostic is specifically the **discovery-entry same-session cohort**, not the overall business conversion rate. It requires ordered landing→discovery→service→details→review→verified-order events. Auth is optional, not a required stage. Direct-to-service/package and returning authenticated cohorts require separate branch definitions before dashboard activation. The event mapping does not blindly reinterpret legacy payment_completed as a paid order. Anonymous cross-device/auth joins are not inferred; consented server-linked joins need separate approved design. Reuse an outcome event ID on retries; reject conflicting ID reuse and separate synthetic data. Primary denominator is eligible consented cohort sessions, never all raw page views. Consent selection bias must be reported.

## Financial facts and report design

All monetary facts must be reconciled, verified INR integer paise, earned ex-GST/indirect tax and mapped to an order/service where relevant. Refunds use their posting/recognition period, including historical orders. Do not mutate old sales or clamp loss days. Provider credits, reversals, installments and FX/tax normalization require a reviewed accounting adapter; unsupported facts must withhold completeness, not be silently discarded. Acquisition expenses appear once as marketing cost, never again as an extra CAC deduction.

```text
earned revenue ex indirect tax − refunds = net revenue
− fulfillment − processing − chargeback − variable support − marketing
− fixed operating costs − depreciation − interest − income tax
= net profit (only when every coverage category is reconciled)
```

Zero requires explicit evidence of no cost in a complete period. Missing fees, fulfillment, support, marketing, overhead, depreciation, interest or tax produces null net profit plus missing-input reasons. The known-cost remainder is only a diagnostic. Financial coverage does not require behavioral analytics consent; customer-level analytics and attribution still must obey purpose/access rules.

| Proposed admin report | Definition / controls | Implemented foundation / remaining gate |
|---|---|---|
| Profit waterfall | Earned ex-tax revenue, occurrence-period refunds, every cost category, coverage badge and loss values | Pure report + fixtures; ledger adapter/reconciliation/authorization BLOCKED |
| AOV | Gross earned order value / distinct earned paid orders; separately show net revenue per order | Pure gross AOV; no wallet top-up or pending order denominator |
| Retention | New/returning customers in window using verified first-paid history; separately mature 30/60/90-day cohort repeat rate | Pure new/returning mix only; it is NOT cohort retention. Mature cohort history/survivorship handling NOT RUN |
| CAC | Acquisition spend / newly paying customers in matching scope; channel CAC requires trusted attribution, observed spend and eligible acquisition coverage | Pure blended ratio only; no customers/spend completeness → null. Channel/incremental CAC BLOCKED |
| Service profitability | Service net revenue − mapped fulfillment/processing = direct contribution; shared-cost allocation shown separately with a reviewed method | Pure contribution; no false service net-profit ranking or invented overhead allocation |
| Conversion quality | Sequential cohort rates, missing joins, consent rate, exclusions, retries and verified outcome count | Pure diagnostic; production capture and paid-order adapter BLOCKED |

Admin access should require server-verified staff role/authorization; keep row-level/raw identifiers out of browser exports. Default aggregate reports, minimum cohort sizes and scoped audit logs; restrict customer history. No new admin route, export endpoint, schema/RLS change or production adapter is introduced here. Existing admin authorization is not re-certified by this prototype.

## Growth decisions require evidence

At hypothetical all-cost net margins of 20%, 30%, 40% and 50%, ₹5 lakh monthly net profit requires respectively about ₹25 lakh, ₹16.67 lakh, ₹12.5 lakh and ₹10 lakh monthly net revenue. These are arithmetic scenarios from the existing offline model, not current margins, traffic forecasts or promised outcomes. Do not subtract costs twice when using an all-cost margin.

First establish complete monthly reconciliations and refunds/cost quality. Then compare contribution per eligible visitor, service refund/support burden, verified order conversion, customer repeat cohorts and observed acquisition spend. Pre-register eligible cohort, attribution window, sample size/MDE and refund/error/support guardrails. Increase acquisition only after positive reconciled unit economics and safety gates; higher AOV or revenue alone is insufficient. No real revenue, conversion or profit improvement is claimed in this work.
