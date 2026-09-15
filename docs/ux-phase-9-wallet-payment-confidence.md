# Phase 9 — Wallet + Payment Confidence

## Goal
Make wallet funding and payment status easier to understand without changing SocialRUSH payment providers, wallet-credit rules, transaction data, verification APIs, or checkout contracts.

## Audit findings
- `/dashboard/wallet` already contains balance, transaction history, pending-payment status, Cashfree verification handling, statements, and payment-help entry points.
- `/dashboard/add-funds` currently uses the manual UPI flow with an exact amount, generated payment reference, UTR / transaction ID submission, and server-side verification before wallet credit.
- the wallet page intentionally hides its internal add-funds section and routes customers to `/dashboard/add-funds` through `WalletAddFundsRedirect`.
- wallet funding and order checkout must remain separate from this UX phase.

## Phase 9 implementation
A shared `PaymentConfidenceExperience` is rendered above both Wallet and Add Funds. It:
- explains the payment lifecycle in four short steps: choose amount, complete payment, verification, wallet update;
- warns customers not to repeat a payment while verification is pending;
- makes it explicit that submitting a payment reference does not itself guarantee immediate wallet credit;
- provides direct navigation between Wallet, Add Funds, and payment support;
- improves keyboard focus visibility, mobile layout, and reduced-motion behavior.

## Existing behavior preserved
- current wallet balance and transaction queries;
- manual UPI amount/reference/UTR flow;
- `/api/wallet/manual-upi` verification submission;
- Cashfree checkout and `/api/payments/cashfree/verify` behavior already present in WalletDashboard;
- pending/completed/failed/refunded transaction states;
- wallet-balance update events and return-to-order recovery;
- payment method enablement rules;
- statement download and transaction filters.

## Protected scope
- no changes to payment providers or payment method availability;
- no API changes;
- no wallet-credit mutation changes;
- no order checkout changes;
- no Supabase queries, schema, or migrations;
- no pricing changes;
- no auth or middleware changes;
- no SEO/schema changes;
- no dependency upgrades.

## Validation before merge
- `npx tsc --noEmit`
- `npm run build`
- Playwright smoke tests
- exact-head Vercel preview READY
- final `main` comparison and changed-file scope review
