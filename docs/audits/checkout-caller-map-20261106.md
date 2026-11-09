# Checkout caller map — 2026-11-06

Repository tree and branch file inspection (not GitHub code-search indexing) confirmed:
- `app/api/checkout/intent/route.ts`: requires `clientRequestId` and validates a random UUIDv4 shape; queries and inserts `checkout_intents.client_request_id`.
- `app/api/orders/route.ts`: invokes `checkout_custom_intent_with_wallet` with `p_client_request_id: body.clientRequestId` after checking required fields. This is a confirmed server-side caller.
- `app/dashboard/campaigns/actions.ts`: invokes `assign_my_order_to_campaign`, not a checkout RPC.
- The tree contains `app/api/orders/manual-upi/route.ts`, `app/api/checkout/payment/route.ts`, and several retired gateway paths. Their actual behavior has **not** yet been inspected.

Prior GitHub code search returned no matches, but direct branch-file inspection confirms a live RPC caller. Do not use code-search emptiness to infer a function is unused.

## Follow-up
Review the complete `app/api/orders/route.ts` authentication, error mapping, request-key validation and order response; trace `app/api/checkout/intent/route.ts` idempotent conflict behavior. Inspect manual payment callers separately before proposing production RPC changes. Keep retired Cashfree/Razorpay inactive. No production writes, orders or merges.
