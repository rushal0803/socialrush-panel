# Business measurement and admin roadmap

₹5 lakh monthly **net profit** is a planning target. The user's under-₹50,000 revenue starting point is not independently reconciled here. No revenue, conversion, CAC, retention or profitability improvement is claimed from synthetic tests.

1. **Prove release safety first.** Independently review this integrated diff and all retained recovery/payment/security/SEO/UI behavior. Close runtime isolation and manual accessibility gates before any approved release. Do not scale acquisition while payment provenance or fulfillment isolation is uncertain.
2. **Approve consent infrastructure separately.** Review a durable/shared consent and replay adapter, authoritative account/internal/synthetic classification, necessary consent-record retention, expiry/revocation behavior and preference UI. Activation flags and deployment remain unchanged. Keep operational/security/accounting records independent of optional marketing consent.
3. **Establish authoritative outcomes.** Reconcile paid orders versus wallet funding, pending manual references, fulfilled/earned sales, refunds and corrections. A client-triggered authenticated signup event is not proof of account creation. Reconcile first-party financial facts rather than optimizing raw event totals or revenue alone.
4. **Create complete monthly reconciliations.** Earned revenue ex indirect tax, occurrence-period refunds, fulfillment, processing, chargebacks, variable support, marketing, overhead, depreciation, interest and income tax. Zero needs evidence; missing/unverified coverage stays null. Signed prior-period corrections post in the current recognition window without editing historical orders. Service correction allocation remains withheld until a reviewed allocation policy exists.
5. **Only then measure growth.** Define consented eligible cohorts and direct/discovery/package/auth-return branches, sampling and missing joins. Optional analytics selection bias means its denominator differs from all business customers. Measure contribution per eligible visitor, verified-order completion, refund/support burden and reliable repeat behavior. Pre-register experiments, minimum sample/MDE and guardrails. No field data or experiment is executed here.

## Admin dashboard specification

| View | Definition | Unknown / access rules |
|---|---|---|
| Actual net profit | Monthly earned ex-tax revenue minus refunds and every reconciled cost class; show posted correction waterfall separately | Null until complete coverage; never label net revenue as profit; no hard-coded historical baseline as observed data |
| Wallet liability | Opening liability + deposits/refund credits − applications/cash refunds = closing liability | Never earned revenue; missing opening/coverage is unknown; negative liability triggers reconciliation rather than clamping |
| AOV | Earned order gross / distinct earned paid orders; show net revenue/order separately | Wallet deposits and pending orders excluded; correction is not a new order |
| CAC | Matching-scope acquisition expense / newly paying customers; channel CAC needs approved attribution and observed spend | Unknown history/spend → null; do not subtract CAC again after deducting marketing expense |
| Retention | Mature 30/60/90-day cohorts based on authoritative first-paid history; distinguish returning-in-window mix | Incomplete history or observation window withheld; multiple orders this month is not cohort retention |
| Service contribution | Net revenue less mapped fulfillment/processing; display shared-cost/correction allocation separately | Direct contribution is not service net profit; withhold corrected rankings without allocation evidence |
| Measurement quality | Consent/exclusion coverage, missing joins, discarded/replayed events, outcome reconciliation and capture start/version | Show cohort discontinuity after privacy changes; old raw-path/campaign reports are not directly comparable |

Future admin adapters require server-verified staff authorization, scoped aggregate exports and audit trails, minimum cohort protections, RLS/privileged-query review and owner/accountant-approved reconciliation. No live ledger connection, migration, new admin endpoint or customer export is introduced here.

At hypothetical all-cost net margins of 20–50%, ₹5 lakh net profit needs ₹25–10 lakh monthly net revenue. That is arithmetic, not a forecast or a claim about current margins. Avoid double-subtracting costs when using an all-cost margin. Complete trustworthy unit economics before adding acquisition spend.
