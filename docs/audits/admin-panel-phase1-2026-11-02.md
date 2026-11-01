# Admin Panel 2.0 — Phase 1 verified audit baseline

Date: 2026-11-02
Scope: Read-only Supabase/Vercel checks and GitHub repository inspection. No production changes.

## Verified baseline
- Production Vercel deployment dpl_CxsGCeYtp8AoBsMjYAvpgWCrtKMC is READY, main SHA 35fcaf731447a948b69a9ae917b5af596d22711e.
- Public Supabase schema reports 1,106 profiles, 712 orders, 62 services, 143,889 analytics events.
- CRM has 63 automation run records, 64 prospect discovery runs, and 22 outreach messages. These counts do **not** establish successful delivery or functioning scheduled execution.
- SEO growth work queue has 0 records; do not infer missing functionality solely from an empty table.
- Security advisor warns that public.record_analytics_event is an anonymously executable SECURITY DEFINER function, plus 21 authenticated-role privileged function warnings. Each requires caller/ownership analysis before permission changes.
- cashfree_checkout_payment_attempts and order_notification_outbox have RLS enabled without policies; these may be intentionally server-only.

## Safe first implementation gates
1. Audit RPC caller authorization, grants, and RLS before proposing SQL migration.
2. Confirm CRM scheduler logs, email consent/suppression, retry/idempotency and reply classification before enabling additional sends.
3. Confirm SEO data ingestion and indexing evidence before automating changes; keep publish operations approval-gated.
4. Build admin health dashboard from verified data, with timestamps and explicit unknown/stale states; never replace missing data with zeros.
5. Add regression tests for privilege boundaries, empty/stale metrics and paused automation.
6. Require CI, Vercel preview and human approval before merge or production deployment.

## Non-goals
No live payment, checkout, customer, email, database, or SEO production mutations in this phase. No claims that automated revenue targets are guaranteed.

## Verification checklist
- [x] GitHub repository accessible
- [x] Supabase schema inventory queried read-only
- [x] Supabase security advisors queried
- [x] Vercel deployment inventory queried
- [ ] Application code-level audit
- [ ] Local tests and typecheck
- [ ] Preview deployment verified
- [ ] Security remediation reviewed
