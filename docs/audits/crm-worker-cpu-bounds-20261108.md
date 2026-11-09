# Phase 1: CRM worker bounds and CPU-risk review (2026-11-08)

Scope: read-only code review of `lib/crm/prospect-discovery.ts`, `lib/crm/prospect-enrichment.ts`, `lib/email/service.ts`, and `lib/orders/notification-delivery.ts` on draft PR #743. **Not** an attribution of the past Vercel CPU overage.

## Confirmed findings

1. Prospect discovery caps official-site resolutions at 6 and backlog enrichments at 5 per run, but each enrichment attempts up to five pages sequentially with an 8-second fetch timeout per page, plus DNS/MX lookups. At the configured maxima, up to eleven candidates may be enriched, and a single candidate may consume substantial wall-clock time. Search requests have a separate 12-second timeout. There is no single whole-run deadline. Inspect function duration and CPU metrics before reducing legitimate CRM research.
2. Prospect discovery selects `domain` for **all** `crm_lead_candidates` and **all** `crm_leads` on each run to construct a duplicate set. This may become a scaling bottleneck as CRM records grow; database-level uniqueness already handles duplicate insertion errors, but replacing the full scan requires preserving the current duplicate-reporting semantics.
3. Prospect enrichment previously buffered complete HTML before truncating. Draft PR #743 now reads response chunks with a byte cap and includes the new contract test in `test:crm-pipeline`; CI and Vercel checks passed for commit `3654a90`.
4. Customer email cron invokes `processCustomerEmailEvents(5)`; each promotional event may execute multiple parallel Supabase queries and email delivery has an 8-second timeout. Preserve suppression/consent and transactional delivery semantics in any performance change.
5. Order notification delivery claims up to 20 notifications, processes them sequentially, and uses Resend idempotency keys with up to five attempts. It is test-recipient-gated and may be disabled by `ORDER_NOTIFICATIONS_ENABLED`. Do not remove these safety gates to speed it up.
6. Prospect enrichment allows fetch redirects and checks the final hostname after the request. Redirect destinations are not independently checked against public IP restrictions **before** following; treat this as a separate SSRF hardening review, not merely a CPU issue.

## Next implementation gates

- Obtain per-route Vercel invocations, execution duration and CPU metrics; do not conflate wall-clock waits with CPU use.
- Introduce an explicitly tested, conservative whole-run deadline for prospect discovery only after verifying how partially completed runs are finalized.
- Consider paginated or targeted duplicate lookups with DB uniqueness as the final guard; first measure row counts and review existing schema constraints.
- Independently validate each redirect hop before making an outbound enrichment request; add redirect-to-private-address regression coverage.
- Keep draft PR #743 unmerged until security, checkout, preview and release gates are explicitly reviewed.

No production settings, scheduled jobs, emails, billing, database objects or deployments changed as part of this review.
