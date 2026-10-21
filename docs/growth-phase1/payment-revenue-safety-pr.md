# Phase 1.1: Make refunds, wallet checkout and revenue reporting transaction-safe

Cancellation previously changed order status before crediting the wallet, and gateway refunds could succeed externally before local settlement failed. This change makes order refunds and manual split checkout atomic in PostgreSQL, reserves funds before a single gateway refund submission, reconciles uncertain responses without reissuing them, and validates captured wallet payments against their exact funding record.

Both revenue pages now use an admin-only database report with completion-based recognition, linked service refunds, negative net values and explicit missing-cost/reconciliation warnings. Wallet statements distinguish external refunds from wallet credits. Existing customer/order price snapshots remain unchanged.

The additive migration introduces idempotent ledger keys, refund request/audit storage, manual receipt claims, verified supplier costs, admin RPCs and restrictive RLS/grants. It has only been applied in disposable SQL fixtures. Gateway refunds stay default-off; this review branch is excluded from Vercel Git deployment. Do not merge or deploy.

Validation passed: full TypeScript, 237 standard unit tests, 43 finance behavior/SQL/RLS tests, 37 dashboard regressions, lint (existing warnings) and the full fixture-backed production build. Exact outcomes and gaps: `docs/growth-phase1/payment-revenue-safety-validation.md`.

Release gates: native multi-session PostgreSQL, full Supabase/PostgREST integration, provider test-mode reconciliation, authenticated browser QA and historical ledger/cost review. PGlite's single session does not establish native lock interleavings. No real financial records or payments were used for testing.

Implementation/rollout assumptions and changed-file groups: `docs/growth-phase1/payment-revenue-safety.md`.
