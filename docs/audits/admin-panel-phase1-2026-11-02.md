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

## 2026-11-02 follow-up: privileged functions and CRM runtime
- The live `public.record_analytics_event` function is `SECURITY DEFINER` and executable by `anon` and `authenticated`. Its implementation validates an event allowlist, requires a session for anonymous calls, caps metadata at 2 KB, and enforces a per-identity 120-events/hour threshold. A caller-supplied anonymous session UUID may be changed; this is not an effective global anti-abuse limit. Review rate limiting at the edge and owner permissions before proposing a grant change. Do not revoke anonymous execution without tracing public analytics callers.
- The security advisor currently reports 1 anonymously executable and 21 authenticated executable SECURITY DEFINER functions. Some authenticated functions enforce `auth.uid()` ownership checks; review each caller and function before altering grants.
- CRM automation run records: 64 completed, latest 2026-11-02 02:30 UTC. Prospect discovery: 61 completed, 2 partial, 2 skipped, latest completed 2026-11-02 02:55 UTC.
- Outreach message status counts: 7 sent, 4 delivered, 1 bounced, 10 drafts. These are persisted statuses, not independently verified provider outcomes.
- Outreach settings: enabled=true, auto_send=false, global_daily_send_limit=10, autopilot_daily_enroll_limit=10, autopilot_max_sends_per_run=3, autopilot_pause_on_complaint=true. Preserve auto_send=false.
- Safe application fix: show "Unavailable" rather than "Off" when automation settings cannot be loaded. Added read-only monitoring regression tests and included them in `test:crm-pipeline`.
- No database grants, functions, policies, customer records or outreach settings were changed.

## Privileged RPC triage — follow-up (read-only)
- Live permissions inventory confirms 21 `SECURITY DEFINER` functions callable by `authenticated`, of which `record_analytics_event` is also callable by `anon`. These are advisor exposure warnings, not proof that every function is exploitable.
- `is_admin()` checks the caller's `auth.uid()` against `profiles.role = 'admin'`; `request_review_removal()` scopes its update to `user_id = auth.uid()`. Their privileged execution is not by itself a demonstrated authorization bypass.
- `place_order()` validates `auth.uid()`, active service, quantity and wallet balance; however, the live function's `INSERT INTO public.orders (user_id, service_id, link, quantity)` omits the calculated `charge` even though it deducts that charge from the wallet and logs a transaction. Inspect column defaults, constraints, current callers and isolated database tests before deciding whether this is an actual accounting inconsistency. No live orders were placed.
- `create_wallet_payment()` still recognizes legacy payment methods such as card, netbanking and cashfree. Determine whether this RPC is still reachable by active customer flows before proposing restrictions. Do not modify payment processing without dedicated regression and owner approval.
- `record_analytics_event()` anonymous grant remains unchanged; application-level origin checks do not prevent direct Supabase RPC calls. Proposed database remediation needs caller inventory, staging verification and explicit approval.

## Order charge integrity follow-up (read-only, 2026-11-02)
- All 726 existing production orders have non-null, positive `charge` values (minimum 3.00, maximum 34,995.00). This establishes recorded-field completeness, **not** wallet-debit equivalence.
- `public.orders.charge` is `NOT NULL` and has **no column default**. `place_order()` and `place_campaign()` omit `charge` in their insert statements. A new call to either function would normally fail the NOT NULL constraint unless an applicable BEFORE INSERT trigger supplies a value.
- Inspected order triggers: `calculate_order_progress()` changes progress/status fields only; `reject_paused_service_order()` validates service availability; `assign_public_order_id()` still needs inspection for any unexpected charge assignment. Do not assume historical orders used these legacy RPCs.
- No test orders or wallet transactions were created. Recommended follow-up: inspect remaining BEFORE INSERT trigger, trace legacy RPC callers, and add isolated SQL regression tests before proposing a migration.
